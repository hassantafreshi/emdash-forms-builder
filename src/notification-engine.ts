/**
 * Forms Builder Plugin — Notification Engine
 *
 * Token substitution, template safety, tracking code generation/lookup.
 * Section J of the EFB implementation spec.
 *
 * Security:
 * - HTML allowlist sanitization before email body output.
 * - Token substitution runs BEFORE sanitization so no injected tokens survive.
 * - No arbitrary HTML execution in render path.
 */

import type { FormDefinitionV1, SubmissionV1 } from "./types.js";

const EMAIL_PATTERN =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// =============================================================================
// HTML Escaping (used to escape field values before template insertion)
// =============================================================================

const HTML_ESC_MAP: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#x27;",
};
const HTML_ESC_RE = /[&<>"']/g;

function escapeHtmlContent(s: string): string {
	return s.replace(HTML_ESC_RE, (ch) => HTML_ESC_MAP[ch] ?? ch);
}

// =============================================================================
// Tracking Code Generator
// =============================================================================

/**
 * Generate a tracking code in 'date_en_mix' style: YYMMDD + 5 random alphanums.
 * Example: 260418A1B2C
 */
export function generateTrackingCode(): string {
	const d = new Date();
	const yy = String(d.getUTCFullYear()).slice(-2);
	const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
	const dd = String(d.getUTCDate()).padStart(2, "0");
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let suffix = "";
	const bytes = crypto.getRandomValues(new Uint8Array(5));
	for (const b of bytes) {
		suffix += chars[b % chars.length];
	}
	return `${yy}${mm}${dd}${suffix}`;
}

// =============================================================================
// Token System
// =============================================================================

export interface TokenContext {
	websiteName: string;
	formName: string;
	submittedAt: string;
	confirmationCode: string;
	/** Absolute URL to view the response thread */
	linkResponse: string;
	/** Map from field name to string value for [field:name] tokens */
	fieldValues: Record<string, string>;
}

const TOKEN_PATTERN = /\[([^\]]+)\]/g;

/** Replace all supported tokens in a template string. */
export function substituteTokens(template: string, ctx: TokenContext): string {
	return template.replace(TOKEN_PATTERN, (_match, token: string) => {
		const t = token.trim();
		switch (t) {
			case "website_name":
				return ctx.websiteName;
			case "form_name":
				return ctx.formName;
			case "submitted_at":
				return ctx.submittedAt;
			case "confirmation_code":
				return ctx.confirmationCode;
			case "link_response":
				return ctx.linkResponse;
			default:
				if (t.startsWith("field:")) {
					const fieldName = t.slice("field:".length).trim();
					return ctx.fieldValues[fieldName] ?? "";
				}
				// Unknown token — leave as-is
				return `[${token}]`;
		}
	});
}

// =============================================================================
// HTML Allowlist Sanitizer (minimal, no DOM required)
// =============================================================================

/**
 * Allowed HTML tags in email bodies.
 * Attributes are only allowed as listed per tag.
 */
const ALLOWED_TAGS: Record<string, string[]> = {
	p: [],
	br: [],
	strong: [],
	em: [],
	u: [],
	b: [],
	i: [],
	ul: [],
	ol: [],
	li: [],
	a: ["href"],
	span: [],
	div: [],
	h1: [],
	h2: [],
	h3: [],
	blockquote: [],
	pre: [],
	code: [],
};

const TAG_PATTERN = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/gs;
const ATTR_PATTERN = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*"([^"]*)"/g;

/**
 * Sanitize HTML string against the allowlist.
 * Strips disallowed tags and attributes.
 * Decodes HTML entities before checking schemes to prevent entity-encoding bypass.
 */
export function sanitizeHtml(html: string): string {
	// Strip HTML comments first
	let clean = html.replace(/<!--[\s\S]*?-->/g, "");
	// Normalize null bytes
	clean = clean.replace(/\0/g, "");

	return clean.replace(TAG_PATTERN, (match, tagName: string, attrs: string) => {
		const tag = tagName.toLowerCase();
		const isClosing = match.startsWith("</");
		const allowedAttrs = ALLOWED_TAGS[tag];
		if (allowedAttrs === undefined) {
			// Not in allowlist — strip entire tag
			return "";
		}
		if (isClosing) return `</${tag}>`;

		let safeAttrs = "";
		if (allowedAttrs.length > 0 && attrs) {
			const attrMatches = attrs.matchAll(ATTR_PATTERN);
			for (const [, attrName, attrValue] of attrMatches) {
				const attr = attrName!.toLowerCase();
				if (!allowedAttrs.includes(attr)) continue;
				// Block dangerous schemes in href (decode entities first to prevent bypass)
				if (attr === "href") {
					const decoded = attrValue!
						.replace(/&#x([0-9a-fA-F]+);?/g, (_, hex: string) =>
							String.fromCharCode(parseInt(hex, 16)),
						)
						.replace(/&#(\d+);?/g, (_, dec: string) => String.fromCharCode(parseInt(dec, 10)));
					const v = decoded.replace(/[\s\x00-\x1f]/g, "").toLowerCase();
					if (v.startsWith("javascript:") || v.startsWith("vbscript:") || v.startsWith("data:")) {
						continue;
					}
					safeAttrs += ` href="${escapeAttr(attrValue!)}"`;
				} else {
					safeAttrs += ` ${attr}="${escapeAttr(attrValue!)}"`;
				}
			}
		}

		return `<${tag}${safeAttrs}>`;
	});
}

const RE_AMP = /&/g;
const RE_QUOT = /"/g;
const RE_LT = /</g;
const RE_GT = />/g;

function escapeAttr(value: string): string {
	return value
		.replace(RE_AMP, "&amp;")
		.replace(RE_QUOT, "&quot;")
		.replace(RE_LT, "&lt;")
		.replace(RE_GT, "&gt;");
}

// =============================================================================
// Email Notification Builder
// =============================================================================

export interface RenderedNotification {
	subject: string;
	body: string;
}

/**
 * Build admin and user notification payloads from a form definition + submission.
 */
export function buildNotifications(
	form: FormDefinitionV1,
	submission: SubmissionV1,
	options: {
		websiteName: string;
		responseBaseUrl: string;
	},
): {
	admin: RenderedNotification | null;
	user: RenderedNotification | null;
} {
	const fieldValues: Record<string, string> = {};
	for (const answer of submission.answers) {
		const field = form.fields[answer.fieldId];
		if (field) {
			const v = answer.value;
			let sv: string;
			if (v == null) sv = "";
			else if (typeof v === "string") sv = v;
			else if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint")
				sv = String(v);
			else if (typeof v === "object") sv = JSON.stringify(v);
			else sv = "";
			// HTML-escape field values to prevent stored XSS in email templates
			fieldValues[field.name] = escapeHtmlContent(sv);
		}
	}

	const ctx: TokenContext = {
		websiteName: escapeHtmlContent(options.websiteName),
		formName: escapeHtmlContent(form.meta.name),
		submittedAt: escapeHtmlContent(submission.submittedAt),
		confirmationCode: escapeHtmlContent(submission.trackingCode),
		linkResponse: escapeHtmlContent(`${options.responseBaseUrl}/track/${submission.trackingCode}`),
		fieldValues,
	};

	const { template } = form.notifications;

	function renderEmail(): RenderedNotification {
		const rawSubject = substituteTokens(template.subject, ctx);
		const rawBody = substituteTokens(template.body, ctx);
		return {
			subject: rawSubject,
			body: sanitizeHtml(rawBody),
		};
	}

	const adminNotification =
		form.notifications.admin.enabled && form.notifications.admin.recipients.length > 0
			? renderEmail()
			: null;

	let userNotification: RenderedNotification | null = null;
	if (form.notifications.user.enabled && form.notifications.user.recipientFieldId) {
		const recipientField = form.fields[form.notifications.user.recipientFieldId];
		if (recipientField?.type === "email") {
			userNotification = renderEmail();
		}
	}

	return { admin: adminNotification, user: userNotification };
}

/**
 * Validate that a list of recipient strings are syntactically valid email addresses.
 * Uses a strict RFC-compliant pattern.
 */
export function validateEmailRecipients(addresses: string[]): {
	valid: string[];
	invalid: string[];
} {
	const valid: string[] = [];
	const invalid: string[] = [];
	for (const addr of addresses) {
		if (EMAIL_PATTERN.test(addr)) {
			valid.push(addr);
		} else {
			invalid.push(addr);
		}
	}
	return { valid, invalid };
}
