/**
 * Forms Builder Plugin for EmDash CMS
 *
 * Cloudflare-native Form Builder migrated from Easy Form Builder (EFB).
 * Implements EFB spec sections A–Q: hybrid trusted builder + sandbox-compatible
 * submissions/settings, normalized schema, migration, notifications, tracking.
 *
 * @example
 * ```typescript
 * // astro.config.mjs
 * import { formsBuilderPlugin } from "@emdash-cms/plugin-forms-builder";
 *
 * export default defineConfig({
 *   integrations: [
 *     emdash({
 *       plugins: [formsBuilderPlugin()],
 *     }),
 *   ],
 * });
 * ```
 */

import type { PluginDescriptor, ResolvedPlugin, PluginDefinition } from "emdash";
import { definePlugin } from "emdash";
import { z } from "zod";

import { convertLegacyEfb } from "./legacy-converter.js";
import { dispatchAll, registerEmailChannel } from "./notification-dispatch.js";
import { generateTrackingCode, buildNotifications } from "./notification-engine.js";
import { sanitizeAnswers, sanitizeMessage, sanitizeText, stripHtml } from "./sanitize.js";
import { getAllTemplates, getTemplate } from "./templates.js";
import type {
	FormDefinitionV1,
	SubmissionV1,
	FormListItem,
	SubmissionListItem,
	NotificationPayload,
	PortalToken,
} from "./types.js";
import { validateFormDefinition } from "./validation.js";

// =============================================================================
// Storage schema
// =============================================================================

const STORAGE = {
	forms: { indexes: ["formId", "status", "createdAt", "updatedAt", "createdBy"] },
	submissions: {
		indexes: ["submissionId", "formId", "trackingCode", "status", "submittedAt", "email"],
	},
	responses: { indexes: ["messageId", "submissionId", "from", "sentAt"] },
	settings: { indexes: [] },
	portal_tokens: { indexes: ["tokenId", "email", "token", "createdAt", "activated"] },
} satisfies Record<string, { indexes: Array<string | string[]> }>;

// =============================================================================
// Route input schemas
// =============================================================================

const createFormSchema = z.object({
	name: z.string().min(1).max(200),
	description: z.string().max(2000).optional(),
	templateId: z.string().optional(),
});

const updateFormSchema = z.object({
	formId: z.string().min(1).max(100),
	definition: z.unknown(), // validated via validateFormDefinition
});

const deleteFormSchema = z.object({
	formId: z.string().min(1).max(100),
});

const duplicateFormSchema = z.object({
	formId: z.string().min(1).max(100),
});

const listFormsSchema = z.object({
	cursor: z.string().optional(),
	limit: z.number().int().min(1).max(100).default(50),
	status: z.enum(["draft", "published", "archived"]).optional(),
});

const getFormSchema = z.object({
	formId: z.string().min(1).max(100),
});

const submitFormSchema = z.object({
	formId: z.string().min(1).max(100),
	answers: z.array(
		z.object({
			fieldId: z.string().min(1).max(100),
			value: z.unknown(),
		}),
	),
	locale: z.string().max(20).optional(),
});

const listSubmissionsSchema = z.object({
	formId: z.string().optional(),
	cursor: z.string().optional(),
	limit: z.number().int().min(1).max(100).default(50),
	status: z.enum(["open", "closed", "read"]).optional(),
});

const getSubmissionSchema = z.object({
	submissionId: z.string().min(1).max(100),
});

const updateSubmissionStatusSchema = z.object({
	submissionId: z.string().min(1).max(100),
	status: z.enum(["open", "closed", "read"]),
});

const replySchema = z.object({
	submissionId: z.string().min(1).max(100),
	body: z.string().min(1).max(10000),
});

const trackingLookupSchema = z.object({
	trackingCode: z.string().min(1).max(50),
});

const importLegacySchema = z.object({
	data: z.unknown(),
	sourceVersion: z.string().optional(),
});

const exportCsvSchema = z.object({
	formId: z.string().min(1).max(100),
});

const settingsUpdateSchema = z.object({
	notificationEmail: z.string().max(320).optional().default(""),
	trackingStyle: z.enum(["date_en_mix", "sequential", "uuid"]).optional().default("date_en_mix"),
	autoDeleteDays: z.number().int().min(0).max(3650).optional().default(90),
	captchaEnabled: z.boolean().optional().default(false),
	portalEnabled: z.boolean().optional().default(true),
	portalTitle: z.string().max(200).optional().default("Support Portal"),
	portalWelcomeMessage: z.string().max(2000).optional().default(""),
	portalDefaultLocale: z.string().max(10).optional().default("en"),
	portalBrandColor: z.string().max(20).optional().default(""),
	portalLoginDescription: z.string().max(2000).optional().default(""),
	portalPagePath: z.string().max(500).optional().default(""),
	// Plan tier
	planTier: z.enum(["free", "pro"]).optional().default("free"),
	// Form embed appearance
	formAccentColor: z.string().max(20).optional().default(""),
	formBgColor: z.string().max(20).optional().default(""),
	formTextColor: z.string().max(20).optional().default(""),
	formBorderRadius: z.string().max(20).optional().default(""),
	formFontSize: z.string().max(20).optional().default(""),
	formButtonStyle: z.enum(["filled", "outline", "ghost"]).optional().default("filled"),
});

// ── Portal route schemas ──────────────────────────────────────────────
const portalRequestAccessSchema = z.object({
	email: z.string().min(1).max(320),
	locale: z.string().max(20).optional(),
});

const portalVerifyTokenSchema = z.object({
	token: z.string().min(1).max(200),
});

const portalListSubmissionsSchema = z.object({
	email: z.string().min(1).max(320),
	token: z.string().min(1).max(200),
	status: z.enum(["open", "closed", "read"]).optional(),
	cursor: z.string().optional(),
	limit: z.number().int().min(1).max(100).default(50),
});

const portalGetSubmissionSchema = z.object({
	email: z.string().min(1).max(320),
	token: z.string().min(1).max(200),
	submissionId: z.string().min(1).max(100),
});

const portalReplySchema = z.object({
	email: z.string().min(1).max(320),
	token: z.string().min(1).max(200),
	submissionId: z.string().min(1).max(100),
	body: z.string().min(1).max(10000),
});

const portalResendLinkSchema = z.object({
	email: z.string().min(1).max(320),
	locale: z.string().max(20).optional(),
});

// =============================================================================
// Helpers
// =============================================================================

// =============================================================================
// Branding & Plan Tier
// =============================================================================

const PLUGIN_DISPLAY_NAME = "EmForm Builder";
const PLUGIN_URL = "https://emdash.dev/plugins/forms-builder";
const BRAND_TEAM = "White Studio";
const BRAND_URL = "https://whitestudio.team";

/** Check if the site URL is a local/dev environment */
function isDevEnvironment(siteUrl: string): boolean {
	return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(siteUrl);
}

/** Build branding HTML for emails (only in free tier) */
function brandingHtml(tier: string): string {
	if (tier === "pro") return "";
	return `<p style="color:#9ca3af;font-size:11px;margin:8px 0 0">Powered by <a href="${PLUGIN_URL}" style="color:#6b7280;text-decoration:underline">${PLUGIN_DISPLAY_NAME}</a> · made by <a href="${BRAND_URL}" style="color:#6b7280;text-decoration:underline">${BRAND_TEAM}</a></p>`;
}

/** Build branding plain text for emails (only in free tier) */
function brandingText(tier: string): string {
	if (tier === "pro") return "";
	return `\nPowered by ${PLUGIN_DISPLAY_NAME} (${PLUGIN_URL}) · made by ${BRAND_TEAM} (${BRAND_URL})`;
}

function nowIso(): string {
	return new Date().toISOString();
}

const SLUG_CLEAN = /[^a-z0-9]+/g;
const SLUG_TRIM = /^-+|-+$/g;
const CSV_QUOTE = /"/g;

function strVal(v: unknown): string {
	if (v == null) return "";
	if (typeof v === "string") return v;
	if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint") return String(v);
	if (Array.isArray(v)) return JSON.stringify(v);
	if (typeof v === "object") {
		// Only serialize own properties to prevent prototype pollution leaks
		const safe: Record<string, unknown> = {};
		for (const key of Object.keys(v as Record<string, unknown>)) {
			safe[key] = (v as Record<string, unknown>)[key];
		}
		return JSON.stringify(safe);
	}
	return "";
}

function makeFormListItem(raw: unknown): FormListItem | null {
	if (typeof raw !== "object" || raw === null) return null;
	const item = raw as { id: string; data: Record<string, unknown> };
	const r = item.data;
	return {
		formId: (r.formId as string) ?? "",
		name: (r.name as string) ?? "",
		status: (r.status as FormListItem["status"]) ?? "draft",
		submissionCount: Number(r.submissionCount ?? 0),
		lastSubmissionAt: (r.lastSubmissionAt as string | null) ?? null,
		createdAt: (r.createdAt as string) ?? "",
		updatedAt: (r.updatedAt as string) ?? "",
	};
}

function makeSubmissionListItem(raw: unknown): SubmissionListItem | null {
	if (typeof raw !== "object" || raw === null) return null;
	const item = raw as { id: string; data: Record<string, unknown> };
	const r = item.data;
	return {
		submissionId: (r.submissionId as string) ?? "",
		formId: (r.formId as string) ?? "",
		formName: (r.formName as string) ?? "",
		trackingCode: (r.trackingCode as string) ?? "",
		status: (r.status as SubmissionListItem["status"]) ?? "open",
		submittedAt: (r.submittedAt as string) ?? "",
	};
}

/** Escape a CSV cell value */
function csvCell(value: unknown): string {
	const s = strVal(value).replace(CSV_QUOTE, '""');
	return `"${s}"`;
}

// ── Portal Helpers ────────────────────────────────────────────────────

const EMAIL_RE =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const TOKEN_EXPIRY_HOURS = 24;

/** Generate a cryptographically random portal token */
function generatePortalToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Extract the email field value from a submission's answers */
function extractEmailFromSubmission(
	formDef: FormDefinitionV1,
	answers: Array<{ fieldId: string; value: unknown }>,
): string | null {
	for (const field of Object.values(formDef.fields)) {
		if (field.type === "email") {
			const answer = answers.find((a) => a.fieldId === field.id);
			if (answer && typeof answer.value === "string" && EMAIL_RE.test(answer.value)) {
				return answer.value;
			}
		}
	}
	return null;
}

/** Check if a portal token is valid and not expired */
function isTokenValid(tokenData: PortalToken): boolean {
	// If never activated, it's valid until used
	if (!tokenData.activated) return true;

	// If activated, check 24h window
	if (tokenData.expiresAt) {
		return new Date(tokenData.expiresAt).getTime() > Date.now();
	}

	return false;
}

/** Build the admin notification email body with form answers */
function buildAdminEmailBody(
	formName: string,
	trackingCode: string,
	answers: Array<{ fieldId: string; value: unknown }>,
	formDef: FormDefinitionV1,
	tier: string = "free",
): { text: string; html: string } {
	const answerLines: string[] = [];
	const htmlLines: string[] = [];

	for (const ans of answers) {
		const field = formDef.fields[ans.fieldId];
		const label = field?.label ?? ans.fieldId;
		const value = ans.value == null ? "—" : String(ans.value);
		answerLines.push(`${label}: ${value}`);
		htmlLines.push(
			`<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#374151;white-space:nowrap">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#4b5563">${value}</td></tr>`,
		);
	}

	const text = [
		`New form submission: ${formName}`,
		`Tracking Code: ${trackingCode}`,
		"",
		"Submitted Data:",
		...answerLines,
		brandingText(tier),
	].join("\n");

	const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#2271b1,#1a5a8e);padding:24px;border-radius:12px 12px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">New Form Submission</h2>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">${formName}</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
    <div style="background:#f0f9ff;padding:12px 16px;border-radius:8px;margin-bottom:20px">
      <span style="font-size:12px;color:#6b7280">Tracking Code</span>
      <div style="font-family:monospace;font-size:16px;font-weight:700;color:#2271b1;margin-top:2px">${trackingCode}</div>
    </div>
    <table style="width:100%;border-collapse:collapse">${htmlLines.join("")}</table>
  </div>
  <div style="background:#f9fafb;padding:16px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">Sent by EmDash Forms</p>
    ${brandingHtml(tier)}
  </div>
</div>`.trim();

	return { text, html };
}

/** Build user confirmation email body */
function buildUserConfirmationBody(
	formName: string,
	trackingCode: string,
	answers: Array<{ fieldId: string; value: unknown }>,
	formDef: FormDefinitionV1,
	portalUrl: string,
	tier: string = "free",
): { text: string; html: string } {
	const answerLines: string[] = [];
	const htmlLines: string[] = [];

	for (const ans of answers) {
		const field = formDef.fields[ans.fieldId];
		const label = field?.label ?? ans.fieldId;
		const value = ans.value == null ? "—" : String(ans.value);
		answerLines.push(`${label}: ${value}`);
		htmlLines.push(
			`<tr><td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;font-weight:500;color:#374151">${label}</td><td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280">${value}</td></tr>`,
		);
	}

	const text = [
		`Thank you for your submission: ${formName}`,
		`Tracking Code: ${trackingCode}`,
		"",
		"Your submitted information:",
		...answerLines,
		"",
		portalUrl ? `View your submission and track responses: ${portalUrl}` : "",
		brandingText(tier),
	].join("\n");

	const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#2271b1,#1a5a8e);padding:24px;border-radius:12px 12px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">Submission Received</h2>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">${formName}</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
    <p style="color:#374151;font-size:14px;margin:0 0 16px">Thank you for your submission. Here's a summary of what you sent:</p>
    <div style="background:#f0f9ff;padding:12px 16px;border-radius:8px;margin-bottom:20px">
      <span style="font-size:12px;color:#6b7280">Tracking Code</span>
      <div style="font-family:monospace;font-size:16px;font-weight:700;color:#2271b1;margin-top:2px">${trackingCode}</div>
    </div>
    <table style="width:100%;border-collapse:collapse">${htmlLines.join("")}</table>
    ${
			portalUrl
				? `<div style="margin-top:24px;text-align:center">
      <a href="${portalUrl}" style="display:inline-block;background:#2271b1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">View Submission &amp; Replies</a>
    </div>`
				: ""
		}
  </div>
  <div style="background:#f9fafb;padding:16px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">Sent by EmDash Forms</p>
    ${brandingHtml(tier)}
  </div>
</div>`.trim();

	return { text, html };
}

/** Build admin reply notification email for the user */
function buildReplyNotificationBody(
	formName: string,
	trackingCode: string,
	replyBody: string,
	portalUrl: string,
	tier: string = "free",
): { text: string; html: string } {
	const text = [
		`New reply to your submission: ${formName}`,
		`Tracking Code: ${trackingCode}`,
		"",
		"Reply:",
		replyBody,
		"",
		portalUrl ? `View the full conversation: ${portalUrl}` : "",
		brandingText(tier),
	].join("\n");

	const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#2271b1,#1a5a8e);padding:24px;border-radius:12px 12px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">New Reply</h2>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">${formName} — ${trackingCode}</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
    <div style="background:#f0fdf4;padding:16px;border-radius:8px;border-left:4px solid #22c55e;margin-bottom:20px">
      <p style="color:#374151;font-size:14px;margin:0;white-space:pre-wrap">${replyBody}</p>
    </div>
    ${
			portalUrl
				? `<div style="text-align:center">
      <a href="${portalUrl}" style="display:inline-block;background:#2271b1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">View Full Conversation</a>
    </div>`
				: ""
		}
  </div>
  <div style="background:#f9fafb;padding:16px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">Sent by EmDash Forms</p>
    ${brandingHtml(tier)}
  </div>
</div>`.trim();

	return { text, html };
}

/**
 * Get or create a portal token for an email.
 * Reuses existing valid tokens to avoid sending multiple links.
 */
async function getOrCreatePortalToken(
	storage: { portal_tokens: { query: Function; put: Function } },
	email: string,
): Promise<{ token: string; isNew: boolean }> {
	// Check for existing valid (non-expired) token
	const existing = await storage.portal_tokens.query({
		where: { email },
		orderBy: { createdAt: "desc" },
		limit: 1,
	});

	if (existing.items.length > 0) {
		const item = (existing.items[0] as { data: Record<string, unknown> })
			.data as unknown as PortalToken;
		if (isTokenValid(item)) {
			return { token: item.token, isNew: false };
		}
	}

	// Create new token
	const tokenId = `ptk_${Date.now()}`;
	const token = generatePortalToken();
	const now = nowIso();

	const tokenData: PortalToken = {
		tokenId,
		email,
		token,
		createdAt: now,
		expiresAt: null, // Doesn't expire until activated
		activated: false,
		activatedAt: null,
	};

	await storage.portal_tokens.put(tokenId, tokenData);
	return { token, isNew: true };
}

/**
 * Build the portal URL for email links.
 * Uses the settings portalPagePath if set; falls back to the API route.
 */
function buildPortalUrl(baseUrl: string, token: string, portalPath: string): string {
	if (portalPath) {
		const normalized = portalPath.startsWith("/") ? portalPath : `/${portalPath}`;
		const separator = normalized.includes("?") ? "&" : "?";
		return `${baseUrl}${normalized}${separator}token=${token}`;
	}
	// Fallback: serve via plugin API route
	return `${baseUrl}/_emdash/api/plugins/emdash-form-builder/portal.page?token=${token}`;
}

// =============================================================================
// Plugin Descriptor (used in astro.config.mjs)
// =============================================================================

export function formsBuilderPlugin(): PluginDescriptor {
	return {
		id: "emdash-form-builder",
		version: "0.1.0",
		entrypoint: "@emdash-cms/plugin-forms-builder",
		options: {},
		adminEntry: "@emdash-cms/plugin-forms-builder/admin",
		componentsEntry: "@emdash-cms/plugin-forms-builder/astro",
		adminPages: [{ path: "/", label: "EmForm Builder", icon: "plus-circle" }],
		adminWidgets: [{ id: "summary", title: "EmForm Builder", size: "third" }],
	};
}

// =============================================================================
// Plugin Implementation
// =============================================================================

export function createPlugin(): ResolvedPlugin {
	const def: PluginDefinition = {
		id: "emdash-form-builder",
		version: "0.1.0",
		capabilities: ["read:content", "write:content", "email:send"],
		storage: STORAGE,
		admin: {
			pages: [{ path: "/", label: "EmForm Builder", icon: "plus-circle" }],
			widgets: [{ id: "summary", title: "EmForm Builder", size: "third" }],
			portableTextBlocks: [
				{
					type: "formEmbed",
					label: "Form",
					icon: "form",
					description: "Embed a form from EmForm Builder",
					fields: [
						{
							type: "select" as const,
							action_id: "formId",
							label: "Form",
							options: [],
							optionsRoute: "forms.options",
						},
					],
				},
				/* {
					type: "portalEmbed",
					label: "Support Portal",
					icon: "globe",
					description: "Embed the support portal for users to view and track their submissions",
					fields: [],
				}, */
			],
		},
		hooks: undefined,
		routes: {
			// ── Settings ──────────────────────────────────────────────────────
			"settings.get": {
				public: false,
				handler: async (ctx) => {
					const item = await ctx.storage.settings!.get("global");
					if (!item) return {};
					return item;
				},
			},

			"settings.update": {
				input: settingsUpdateSchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof settingsUpdateSchema>;
					await ctx.storage.settings!.put("global", input);
					return { success: true };
				},
			},

			// ── Templates ─────────────────────────────────────────────────────
			"templates.list": {
				public: false,
				handler: async (_ctx) => {
					return { items: getAllTemplates() };
				},
			},

			// ── Forms CRUD ────────────────────────────────────────────────────
			"forms.list": {
				input: listFormsSchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof listFormsSchema>;
					const result = await ctx.storage.forms!.query({
						where: input.status ? { status: input.status } : undefined,
						limit: input.limit,
						cursor: input.cursor,
						orderBy: { createdAt: "desc" },
					});
					return {
						items: result.items.map(makeFormListItem).filter(Boolean),
						cursor: result.cursor,
					};
				},
			},

			"forms.options": {
				public: false,
				handler: async (ctx) => {
					const result = await ctx.storage.forms!.query({
						limit: 100,
						orderBy: { createdAt: "desc" },
					});
					const items = result.items
						.map((r) => {
							const rec = (r as { data: Record<string, unknown> }).data;
							if (!rec.formId || !rec.name) return null;
							return { id: String(rec.formId), name: String(rec.name) };
						})
						.filter(Boolean);
					return { items };
				},
			},

			"forms.get": {
				input: getFormSchema,
				public: true,
				handler: async (ctx) => {
					const { formId } = ctx.input as z.infer<typeof getFormSchema>;
					const items = await ctx.storage.forms!.query({ where: { formId }, limit: 1 });
					const form = items.items[0];
					if (!form) return { error: "NOT_FOUND" };
					return { form: (form as { data: unknown }).data };
				},
			},

			"forms.create": {
				input: createFormSchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof createFormSchema>;
					const now = nowIso();

					// Sanitize name & description
					const nameResult = sanitizeText(input.name, { maxLength: 200, minLength: 1 });
					if (!nameResult.success)
						return { error: "VALIDATION_ERROR", detail: nameResult.error.message };
					const sanitizedName = nameResult.value;
					const sanitizedDescription = input.description
						? stripHtml(input.description).slice(0, 2000)
						: "";

					// Build definition from template or blank
					let definition: FormDefinitionV1;
					if (input.templateId) {
						const tpl = getTemplate(input.templateId);
						if (!tpl) return { error: "TEMPLATE_NOT_FOUND" };
						definition = {
							...tpl.definition,
							formId: `frm_${Date.now()}`,
							meta: {
								name: sanitizedName,
								slug:
									sanitizedName
										.toLowerCase()
										.replace(SLUG_CLEAN, "-")
										.replace(SLUG_TRIM, "")
										.slice(0, 100) || "form",
								description: sanitizedDescription,
								status: "draft",
								createdAt: now,
								updatedAt: now,
								createdBy: "admin",
							},
						};
					} else {
						const blankTpl = getTemplate("tpl_blank")!;
						definition = {
							...blankTpl.definition,
							formId: `frm_${Date.now()}`,
							meta: {
								name: sanitizedName,
								slug:
									sanitizedName
										.toLowerCase()
										.replace(SLUG_CLEAN, "-")
										.replace(SLUG_TRIM, "")
										.slice(0, 100) || "form",
								description: sanitizedDescription,
								status: "draft",
								createdAt: now,
								updatedAt: now,
								createdBy: "admin",
							},
						};
					}

					const validation = validateFormDefinition(definition);
					if (!validation.success) return { error: "VALIDATION_ERROR", detail: validation.error };

					await ctx.storage.forms!.put(definition.formId, {
						formId: definition.formId,
						name: definition.meta.name,
						status: definition.meta.status,
						submissionCount: 0,
						lastSubmissionAt: null,
						createdAt: definition.meta.createdAt,
						updatedAt: definition.meta.updatedAt,
						createdBy: definition.meta.createdBy,
						definition,
					});

					return { formId: definition.formId };
				},
			},

			"forms.update": {
				input: updateFormSchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof updateFormSchema>;
					const validation = validateFormDefinition(input.definition);
					if (!validation.success) return { error: "VALIDATION_ERROR", detail: validation.error };

					// Sanitize name & description in the definition
					const updatedDef = validation.data;
					const updateNameResult = sanitizeText(updatedDef.meta.name, {
						maxLength: 200,
						minLength: 1,
					});
					if (!updateNameResult.success)
						return { error: "VALIDATION_ERROR", detail: updateNameResult.error.message };
					updatedDef.meta.name = updateNameResult.value;
					updatedDef.meta.description = stripHtml(updatedDef.meta.description).slice(0, 2000);

					// Sanitize field labels and help text
					for (const field of Object.values(updatedDef.fields)) {
						field.label = stripHtml(field.label);
						field.ui.helpText = stripHtml(field.ui.helpText);
						field.ui.placeholder = stripHtml(field.ui.placeholder);
						if (field.options) {
							for (const opt of field.options) {
								opt.label = stripHtml(opt.label);
							}
						}
					}
					for (const step of updatedDef.steps) {
						step.title = stripHtml(step.title);
					}

					const existingItem = (
						await ctx.storage.forms!.query({ where: { formId: input.formId }, limit: 1 })
					).items[0];
					if (!existingItem) return { error: "NOT_FOUND" };

					const existing = (existingItem as { data: Record<string, unknown> }).data;
					updatedDef.meta.updatedAt = nowIso();

					// Preserve original metadata that shouldn't change on update
					updatedDef.formId = input.formId;
					if (existing.createdAt) updatedDef.meta.createdAt = existing.createdAt as string;
					if (existing.createdBy) updatedDef.meta.createdBy = existing.createdBy as string;
					// Preserve existing publish status — builder always sends "draft" so we
					// must restore the real status to avoid un-publishing a live form.
					const existingDef = existing.definition as { meta?: { status?: string } } | undefined;
					const existingStatus = existingDef?.meta?.status ?? (existing.status as string | undefined) ?? "draft";
					updatedDef.meta.status = existingStatus as "draft" | "published" | "archived";

					await ctx.storage.forms!.put(input.formId, {
						...existing,
						name: updatedDef.meta.name,
						status: updatedDef.meta.status,
						updatedAt: updatedDef.meta.updatedAt,
						definition: updatedDef,
					});

					return { success: true };
				},
			},

			"forms.delete": {
				input: deleteFormSchema,
				public: false,
				handler: async (ctx) => {
					const { formId } = ctx.input as z.infer<typeof deleteFormSchema>;
					const existing = (await ctx.storage.forms!.query({ where: { formId }, limit: 1 }))
						.items[0];
					if (!existing) return { error: "NOT_FOUND" };
					await ctx.storage.forms!.delete(formId);
					ctx.log.info(`Form deleted: ${formId}`);
					return { success: true };
				},
			},

			"forms.duplicate": {
				input: duplicateFormSchema,
				public: false,
				handler: async (ctx) => {
					const { formId } = ctx.input as z.infer<typeof duplicateFormSchema>;
					const item = (await ctx.storage.forms!.query({ where: { formId }, limit: 1 })).items[0];
					if (!item) return { error: "NOT_FOUND" };
					const record = (item as { data: Record<string, unknown> }).data;

					const original = record.definition as FormDefinitionV1;
					const now = nowIso();
					const newId = `frm_${Date.now()}`;
					const copy: FormDefinitionV1 = {
						...original,
						formId: newId,
						meta: {
							...original.meta,
							name: `${original.meta.name} (Copy)`,
							slug: `${original.meta.slug}-copy`,
							status: "draft",
							createdAt: now,
							updatedAt: now,
						},
					};

					await ctx.storage.forms!.put(newId, {
						formId: newId,
						name: copy.meta.name,
						status: copy.meta.status,
						submissionCount: 0,
						lastSubmissionAt: null,
						createdAt: copy.meta.createdAt,
						updatedAt: copy.meta.updatedAt,
						createdBy: copy.meta.createdBy,
						definition: copy,
					});

					return { formId: newId };
				},
			},

			"forms.publish": {
				input: getFormSchema,
				public: false,
				handler: async (ctx) => {
					const { formId } = ctx.input as z.infer<typeof getFormSchema>;
					const item = (await ctx.storage.forms!.query({ where: { formId }, limit: 1 })).items[0];
					if (!item) return { error: "NOT_FOUND" };
					const record = (item as { data: Record<string, unknown> }).data;

					const formDef = record.definition as FormDefinitionV1;
					const validation = validateFormDefinition(formDef);
					if (!validation.success) return { error: "VALIDATION_ERROR", detail: validation.error };

					formDef.meta.status = "published";
					formDef.meta.updatedAt = nowIso();
					await ctx.storage.forms!.put(formId, {
						...record,
						status: "published",
						updatedAt: formDef.meta.updatedAt,
						definition: formDef,
					});
					return { success: true };
				},
			},

			// ── Public form submission ─────────────────────────────────────────
			"forms.submit": {
				input: submitFormSchema,
				public: true,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof submitFormSchema>;

					// Register email channel if available
					if (ctx.email) {
						registerEmailChannel((msg) => ctx.email!.send(msg));
					}

					// Load form
					const item = (
						await ctx.storage.forms!.query({ where: { formId: input.formId }, limit: 1 })
					).items[0];
					if (!item) {
						ctx.log.warn("[forms.submit] form not found", { formId: input.formId });
						return { error: "NOT_FOUND" };
					}
					const record = (item as { data: Record<string, unknown> }).data;
					const formDef = record.definition as FormDefinitionV1;
					const effectiveStatus = formDef.meta.status ?? record.status as string;
					ctx.log.info("[forms.submit] form status check", { formId: input.formId, status: effectiveStatus, recordStatus: record.status });
					if (effectiveStatus !== "published") {
						ctx.log.warn("[forms.submit] form not published", { formId: input.formId, status: effectiveStatus });
						return { error: "FORM_NOT_PUBLISHED", detail: `Form status is '${effectiveStatus}'. Please publish the form first.` };
					}

					// Build field descriptors for sanitization (skip hidden/disabled)
					const fieldDescriptors = Object.values(formDef.fields)
						.filter((f) => !f.visibility.hidden && !f.visibility.disabled)
						.map((f) => ({
							fieldId: f.id,
							type: f.type,
							label: f.label,
							required: f.validation.required,
							minLength: f.validation.minLength,
							maxLength: f.validation.maxLength,
							min: f.validation.min,
							max: f.validation.max,
							pattern: f.validation.pattern,
							format: f.validation.format,
							options: f.options,
						}));

					// Sanitize & validate all answers
					const sanResult = sanitizeAnswers(input.answers, fieldDescriptors);
					if (!sanResult.success) {
						return {
							error: "VALIDATION_ERROR",
							detail: sanResult.errors.map((e) => `${e.label}: ${e.message}`).join("; "),
						};
					}

					const now = nowIso();
					const trackingCode = generateTrackingCode();
					const submissionId = `sub_${Date.now()}`;

					// Extract user email from answers if an email field exists
					const userEmail = extractEmailFromSubmission(formDef, sanResult.answers);

					const submission: SubmissionV1 = {
						submissionId,
						formId: input.formId,
						trackingCode,
						status: "open",
						submittedAt: now,
						submittedBy: { type: "guest", userId: null },
						meta: { ipHash: "", userAgent: "", locale: input.locale ?? "en" },
						answers: sanResult.answers,
						attachments: [],
						audit: [{ at: now, event: "submitted", actor: "guest" }],
					};

					await ctx.storage.submissions!.put(submissionId, {
						...submission,
						formName: formDef.meta.name,
						email: userEmail ?? "",
					});

					// Update form submission count
					const updatedCount = Number(record.submissionCount ?? 0) + 1;
					await ctx.storage.forms!.put(input.formId, {
						...record,
						submissionCount: updatedCount,
						lastSubmissionAt: now,
					});

					// Load plugin settings for notification email
					const settingsItem = await ctx.storage.settings!.get("global");
					const settings = (settingsItem ?? {}) as Record<string, unknown>;
					const adminEmail = (settings.notificationEmail as string) ?? "";
					const tier = (settings.planTier as string) ?? "free";

					// Build and dispatch notifications (async, fire-and-forget)
					const notifications: NotificationPayload[] = [];

					// Build portal URL for user (if email exists)
					let portalUrl = "";
					if (userEmail) {
						try {
							const { token } = await getOrCreatePortalToken(
								ctx.storage as unknown as { portal_tokens: { query: Function; put: Function } },
								userEmail,
							);
							const baseUrl = ctx.site?.url ?? "";
							const savedPortalPath = (settings.portalPagePath as string) ?? "";
							portalUrl = buildPortalUrl(baseUrl, token, savedPortalPath);
						} catch (err) {
							ctx.log.warn(`Portal token creation failed: ${String(err)}`);
						}
					}

					ctx.log.info(`[forms.submit] ctx.email available: ${!!ctx.email} | adminEmail: "${adminEmail}" | userEmail: "${userEmail ?? ""}" | portalUrl: "${portalUrl}"`);

					// Admin notification
					if (adminEmail && EMAIL_RE.test(adminEmail)) {
						const { text, html } = buildAdminEmailBody(
							formDef.meta.name,
							trackingCode,
							sanResult.answers,
							formDef,
							tier,
						);
						notifications.push({
							channel: "email",
							to: adminEmail,
							subject: `New submission: ${formDef.meta.name} [${trackingCode}]`,
							body: text,
							htmlBody: html,
						});
					}

					// User confirmation email (if email field exists)
					if (userEmail) {
						const { text, html } = buildUserConfirmationBody(
							formDef.meta.name,
							trackingCode,
							sanResult.answers,
							formDef,
							portalUrl,
							tier,
						);
						notifications.push({
							channel: "email",
							to: userEmail,
							subject: `Submission received: ${formDef.meta.name} [${trackingCode}]`,
							body: text,
							htmlBody: html,
						});
					}

					ctx.log.info(`[forms.submit] dispatching ${notifications.length} notification(s): ${notifications.map(n => `${n.channel}→${n.to}`).join(", ") || "none"}`);

					// Fire-and-forget dispatch
					dispatchAll(notifications, { log: ctx.log });

					// In dev/test environments, include the portal URL for debugging
					const devPortalUrl =
						portalUrl && isDevEnvironment(ctx.site?.url ?? "") ? portalUrl : undefined;

					return {
						success: true,
						trackingCode,
						thankYou: formDef.workflow.thankYou,
						...(devPortalUrl ? { _devPortalUrl: devPortalUrl } : {}),
					};
				},
			},

			// ── Submissions management ────────────────────────────────────────
			"submissions.list": {
				input: listSubmissionsSchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof listSubmissionsSchema>;
					const where: Record<string, string> = {};
					if (input.formId) where.formId = input.formId;
					if (input.status) where.status = input.status;

					const result = await ctx.storage.submissions!.query({
						where: Object.keys(where).length > 0 ? where : undefined,
						limit: input.limit,
						cursor: input.cursor,
						orderBy: { submittedAt: "desc" },
					});

					return {
						items: result.items.map(makeSubmissionListItem).filter(Boolean),
						cursor: result.cursor,
					};
				},
			},

			"submissions.get": {
				input: getSubmissionSchema,
				public: false,
				handler: async (ctx) => {
					const { submissionId } = ctx.input as z.infer<typeof getSubmissionSchema>;
					const result = await ctx.storage.submissions!.query({
						where: { submissionId },
						limit: 1,
					});
					const sub = result.items[0];
					if (!sub) return { error: "NOT_FOUND" };
					return { submission: (sub as { data: unknown }).data };
				},
			},

			"submissions.updateStatus": {
				input: updateSubmissionStatusSchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof updateSubmissionStatusSchema>;
					const result = await ctx.storage.submissions!.query({
						where: { submissionId: input.submissionId },
						limit: 1,
					});
					const item = result.items[0];
					if (!item) return { error: "NOT_FOUND" };
					const existing = (item as { data: Record<string, unknown> }).data;

					const now = nowIso();
					const audit = [
						...((existing.audit as unknown[]) ?? []),
						{ at: now, event: input.status, actor: "admin" },
					];

					await ctx.storage.submissions!.put(input.submissionId, {
						...existing,
						status: input.status,
						audit,
					});

					return { success: true };
				},
			},

			"submissions.delete": {
				input: getSubmissionSchema,
				public: false,
				handler: async (ctx) => {
					const { submissionId } = ctx.input as z.infer<typeof getSubmissionSchema>;
					const result = await ctx.storage.submissions!.query({
						where: { submissionId },
						limit: 1,
					});
					if (!result.items[0]) return { error: "NOT_FOUND" };
					await ctx.storage.submissions!.delete(submissionId);
					ctx.log.info(`Submission deleted: ${submissionId}`);
					return { success: true };
				},
			},

			// ── Response thread ───────────────────────────────────────────────
			"submissions.reply": {
				input: replySchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof replySchema>;

					// Register email channel if available
					if (ctx.email) {
						registerEmailChannel((msg) => ctx.email!.send(msg));
					}

					const subItem = (
						await ctx.storage.submissions!.query({
							where: { submissionId: input.submissionId },
							limit: 1,
						})
					).items[0];
					if (!subItem) return { error: "NOT_FOUND" };
					const sub = (subItem as { data: Record<string, unknown> }).data;

					const messageId = `msg_${Date.now()}`;
					const now = nowIso();

					// Sanitize reply body
					const bodyResult = sanitizeMessage(input.body);
					if (!bodyResult.success) {
						return { error: "VALIDATION_ERROR", detail: bodyResult.error.message };
					}

					await ctx.storage.responses!.put(messageId, {
						messageId,
						submissionId: input.submissionId,
						from: "admin",
						body: bodyResult.value,
						sentAt: now,
						authorId: null,
					});

					// Update submission audit and mark as read
					const audit = [
						...((sub.audit as unknown[]) ?? []),
						{ at: now, event: "replied", actor: "admin" },
					];
					await ctx.storage.submissions!.put(input.submissionId, {
						...sub,
						status: "read",
						audit,
					});

					// Send email notification to user if email exists
					const userEmail = (sub.email as string) ?? "";
					if (userEmail && EMAIL_RE.test(userEmail)) {
						const formName = (sub.formName as string) ?? "Form";
						const trackingCode = (sub.trackingCode as string) ?? "";

						// Load tier for branding
						const replySettingsItem = await ctx.storage.settings!.get("global");
						const replySettings = (replySettingsItem ?? {}) as Record<string, unknown>;
						const replyTier = (replySettings.planTier as string) ?? "free";

						// Get or create portal token for user
						let portalUrl = "";
						try {
							const { token } = await getOrCreatePortalToken(
								ctx.storage as unknown as { portal_tokens: { query: Function; put: Function } },
								userEmail,
							);
							const baseUrl = ctx.site?.url ?? "";
							const replyPortalPath = (replySettings.portalPagePath as string) ?? "";
							portalUrl = buildPortalUrl(baseUrl, token, replyPortalPath);
						} catch (err) {
							ctx.log.warn(`Portal token creation failed: ${String(err)}`);
						}

						const { text, html } = buildReplyNotificationBody(
							formName,
							trackingCode,
							bodyResult.value,
							portalUrl,
							replyTier,
						);

						dispatchAll(
							[
								{
									channel: "email",
									to: userEmail,
									subject: `New reply: ${formName} [${trackingCode}]`,
									body: text,
									htmlBody: html,
								},
							],
							{ log: ctx.log },
						);
					}

					ctx.log.info(`Reply added to submission ${input.submissionId}`);
					return { success: true, messageId };
				},
			},

			"submissions.responses": {
				input: getSubmissionSchema,
				public: false,
				handler: async (ctx) => {
					const { submissionId } = ctx.input as z.infer<typeof getSubmissionSchema>;
					const result = await ctx.storage.responses!.query({
						where: { submissionId },
						orderBy: { sentAt: "asc" },
						limit: 100,
					});
					return { items: result.items.map((r) => (r as { data: unknown }).data) };
				},
			},

			// ── Tracking lookup (public) ───────────────────────────────────────
			"tracking.lookup": {
				input: trackingLookupSchema,
				public: true,
				handler: async (ctx) => {
					const { trackingCode } = ctx.input as z.infer<typeof trackingLookupSchema>;
					const result = await ctx.storage.submissions!.query({
						where: { trackingCode },
						limit: 1,
					});
					const item = result.items[0];
					if (!item) return { error: "NOT_FOUND" };
					const sub = (item as { data: Record<string, unknown> }).data;
					return {
						trackingCode,
						formName: (sub.formName as string) ?? "",
						status: sub.status,
						submittedAt: sub.submittedAt,
					};
				},
			},

			// ── Legacy import ─────────────────────────────────────────────────
			"forms.importLegacy": {
				input: importLegacySchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof importLegacySchema>;
					try {
						const result = convertLegacyEfb(input.data, {
							sourceVersion: input.sourceVersion,
						});

						const { form, warnings } = result;
						const validation = validateFormDefinition(form);
						if (!validation.success) {
							return { error: "IMPORT_VALIDATION_ERROR", detail: validation.error };
						}

						await ctx.storage.forms!.put(form.formId, {
							formId: form.formId,
							name: form.meta.name,
							status: form.meta.status,
							submissionCount: 0,
							lastSubmissionAt: null,
							createdAt: form.meta.createdAt,
							updatedAt: form.meta.updatedAt,
							createdBy: form.meta.createdBy,
							definition: form,
						});

						ctx.log.info(`Imported legacy form '${form.meta.name}' as ${form.formId}`);
						return { formId: form.formId, warnings };
					} catch (err) {
						ctx.log.error(`Legacy import failed: ${String(err)}`);
						return { error: "IMPORT_ERROR", detail: String(err) };
					}
				},
			},

			// ── Export CSV ────────────────────────────────────────────────────
			"submissions.exportCsv": {
				input: exportCsvSchema,
				public: false,
				handler: async (ctx) => {
					const { formId } = ctx.input as z.infer<typeof exportCsvSchema>;

					const formItem = (await ctx.storage.forms!.query({ where: { formId }, limit: 1 }))
						.items[0];
					if (!formItem) return { error: "NOT_FOUND" };
					const formRecord = (formItem as { data: Record<string, unknown> }).data;
					const formDef = formRecord.definition as FormDefinitionV1;

					// Collect all field IDs in order
					const fieldIds = formDef.steps.flatMap((s) => s.fields);
					const fieldLabels = fieldIds.map((id) => formDef.fields[id]?.label ?? id);

					// Load all submissions for form (up to 5000)
					const result = await ctx.storage.submissions!.query({
						where: { formId },
						limit: 5000,
						orderBy: { submittedAt: "asc" },
					});

					const rows: string[][] = [];
					const header = ["submissionId", "trackingCode", "status", "submittedAt", ...fieldLabels];
					rows.push(header);

					for (const item of result.items) {
						const sub = (item as { data: Record<string, unknown> }).data;
						const answers = (sub.answers as Array<{ fieldId: string; value: unknown }>) ?? [];
						const answerMap = new Map<string, unknown>(answers.map((a) => [a.fieldId, a.value]));
						const row = [
							(sub.submissionId as string) ?? "",
							(sub.trackingCode as string) ?? "",
							(sub.status as string) ?? "",
							(sub.submittedAt as string) ?? "",
							...fieldIds.map((id) => strVal(answerMap.get(id))),
						];
						rows.push(row);
					}

					const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");
					return { csv, filename: `submissions-${formId}-${Date.now()}.csv` };
				},
			},

			// ── Portal: Request Access (public) ───────────────────────────────
			"portal.requestAccess": {
				input: portalRequestAccessSchema,
				public: true,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof portalRequestAccessSchema>;
					const email = input.email.trim().toLowerCase();

					if (!EMAIL_RE.test(email)) {
						return { error: "INVALID_EMAIL" };
					}

					// Register email channel
					if (ctx.email) {
						registerEmailChannel((msg) => ctx.email!.send(msg));
					}

					// Check if user has any submissions with this email
					const submissions = await ctx.storage.submissions!.query({
						where: { email },
						limit: 1,
					});
					if (submissions.items.length === 0) {
						// Don't reveal whether email exists — return success anyway
						return { success: true };
					}

					// Get or create portal token
					const { token } = await getOrCreatePortalToken(
						ctx.storage as unknown as { portal_tokens: { query: Function; put: Function } },
						email,
					);

					// Load settings for branding + portal page path
					const settingsItem = await ctx.storage.settings!.get("global");
					const settingsData = (settingsItem ?? {}) as Record<string, unknown>;
					const tier = (settingsData.planTier as string) ?? "free";

					const baseUrl = ctx.site?.url ?? "";
					const reqPortalPath = (settingsData.portalPagePath as string) ?? "";
					const portalUrl = buildPortalUrl(baseUrl, token, reqPortalPath);

					// Send access link email
					const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#2271b1,#1a5a8e);padding:24px;border-radius:12px 12px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">Access Your Submissions</h2>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
    <p style="color:#374151;font-size:14px;margin:0 0 20px">Click the button below to access your submissions portal:</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${portalUrl}" style="display:inline-block;background:#2271b1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Open Portal</a>
    </div>
    <p style="color:#9ca3af;font-size:12px;margin:16px 0 0">If you didn't request this link, you can safely ignore this email.</p>
  </div>
  <div style="background:#f9fafb;padding:16px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">Sent by EmDash Forms</p>
    ${brandingHtml(tier)}
  </div>
</div>`.trim();

					dispatchAll(
						[
							{
								channel: "email",
								to: email,
								subject: "Your Portal Access Link",
								body: `Access your submissions: ${portalUrl}${brandingText(tier)}`,
								htmlBody: html,
							},
						],
						{ log: ctx.log },
					);

					// In dev/test environments, include the magic link URL for debugging
					const isDev = isDevEnvironment(baseUrl);
					return {
						success: true,
						...(isDev ? { _devPortalUrl: portalUrl } : {}),
					};
				},
			},

			// ── Portal: Verify Token (public) ─────────────────────────────────
			"portal.verifyToken": {
				input: portalVerifyTokenSchema,
				public: true,
				handler: async (ctx) => {
					const { token } = ctx.input as z.infer<typeof portalVerifyTokenSchema>;

					// Find token
					const result = await ctx.storage.portal_tokens!.query({
						where: { token },
						limit: 1,
					});
					if (result.items.length === 0) {
						return { error: "INVALID_TOKEN" };
					}

					const item = (result.items[0] as { data: Record<string, unknown> })
						.data as unknown as PortalToken;

					if (!isTokenValid(item)) {
						return { error: "TOKEN_EXPIRED", email: item.email };
					}

					// Activate token if first use — set 24h expiry
					if (!item.activated) {
						const now = nowIso();
						const expiresAt = new Date(
							Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
						).toISOString();
						await ctx.storage.portal_tokens!.put(item.tokenId, {
							...item,
							activated: true,
							activatedAt: now,
							expiresAt,
						});
					}

					return { success: true, email: item.email };
				},
			},

			// ── Portal: List User Submissions (public, token-protected) ───────
			"portal.submissions": {
				input: portalListSubmissionsSchema,
				public: true,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof portalListSubmissionsSchema>;

					// Verify token
					const tokenResult = await ctx.storage.portal_tokens!.query({
						where: { token: input.token },
						limit: 1,
					});
					if (tokenResult.items.length === 0) {
						return { error: "INVALID_TOKEN" };
					}
					const tokenData = (tokenResult.items[0] as { data: Record<string, unknown> })
						.data as unknown as PortalToken;
					if (!isTokenValid(tokenData) || tokenData.email !== input.email) {
						return { error: "UNAUTHORIZED" };
					}

					// Query submissions by email
					const where: Record<string, string> = { email: input.email };
					if (input.status) where.status = input.status;

					const result = await ctx.storage.submissions!.query({
						where,
						limit: input.limit,
						cursor: input.cursor,
						orderBy: { submittedAt: "desc" },
					});

					return {
						items: result.items.map(makeSubmissionListItem).filter(Boolean),
						cursor: result.cursor,
					};
				},
			},

			// ── Portal: Get Submission Detail (public, token-protected) ───────
			"portal.submissionDetail": {
				input: portalGetSubmissionSchema,
				public: true,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof portalGetSubmissionSchema>;

					// Verify token
					const tokenResult = await ctx.storage.portal_tokens!.query({
						where: { token: input.token },
						limit: 1,
					});
					if (tokenResult.items.length === 0) {
						return { error: "INVALID_TOKEN" };
					}
					const tokenData = (tokenResult.items[0] as { data: Record<string, unknown> })
						.data as unknown as PortalToken;
					if (!isTokenValid(tokenData) || tokenData.email !== input.email) {
						return { error: "UNAUTHORIZED" };
					}

					// Get submission and verify ownership
					const subResult = await ctx.storage.submissions!.query({
						where: { submissionId: input.submissionId },
						limit: 1,
					});
					if (subResult.items.length === 0) {
						return { error: "NOT_FOUND" };
					}
					const sub = (subResult.items[0] as { data: Record<string, unknown> }).data;
					if ((sub.email as string) !== input.email) {
						return { error: "UNAUTHORIZED" };
					}

					// Load responses
					const respResult = await ctx.storage.responses!.query({
						where: { submissionId: input.submissionId },
						orderBy: { sentAt: "asc" },
						limit: 100,
					});

					// Load form definition for field labels
					const formResult = await ctx.storage.forms!.query({
						where: { formId: sub.formId as string },
						limit: 1,
					});
					let fieldLabels: Record<string, string> = {};
					if (formResult.items.length > 0) {
						const formRecord = (formResult.items[0] as { data: Record<string, unknown> }).data;
						const formDef = formRecord.definition as FormDefinitionV1;
						for (const [id, field] of Object.entries(formDef.fields)) {
							fieldLabels[id] = field.label;
						}
					}

					return {
						submission: {
							submissionId: sub.submissionId,
							formId: sub.formId,
							formName: sub.formName,
							trackingCode: sub.trackingCode,
							status: sub.status,
							submittedAt: sub.submittedAt,
							answers: sub.answers,
						},
						responses: respResult.items.map((r) => (r as { data: unknown }).data),
						fieldLabels,
					};
				},
			},

			// ── Portal: User Reply (public, token-protected) ─────────────────
			"portal.reply": {
				input: portalReplySchema,
				public: true,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof portalReplySchema>;

					// Register email channel
					if (ctx.email) {
						registerEmailChannel((msg) => ctx.email!.send(msg));
					}

					// Verify token
					const tokenResult = await ctx.storage.portal_tokens!.query({
						where: { token: input.token },
						limit: 1,
					});
					if (tokenResult.items.length === 0) {
						return { error: "INVALID_TOKEN" };
					}
					const tokenData = (tokenResult.items[0] as { data: Record<string, unknown> })
						.data as unknown as PortalToken;
					if (!isTokenValid(tokenData) || tokenData.email !== input.email) {
						return { error: "UNAUTHORIZED" };
					}

					// Get submission and verify ownership
					const subResult = await ctx.storage.submissions!.query({
						where: { submissionId: input.submissionId },
						limit: 1,
					});
					if (subResult.items.length === 0) {
						return { error: "NOT_FOUND" };
					}
					const sub = (subResult.items[0] as { data: Record<string, unknown> }).data;
					if ((sub.email as string) !== input.email) {
						return { error: "UNAUTHORIZED" };
					}

					// Sanitize reply body
					const bodyResult = sanitizeMessage(input.body);
					if (!bodyResult.success) {
						return { error: "VALIDATION_ERROR", detail: bodyResult.error.message };
					}

					const messageId = `msg_${Date.now()}`;
					const now = nowIso();

					await ctx.storage.responses!.put(messageId, {
						messageId,
						submissionId: input.submissionId,
						from: "guest",
						body: bodyResult.value,
						sentAt: now,
						authorId: null,
					});

					// Update submission audit
					const audit = [
						...((sub.audit as unknown[]) ?? []),
						{ at: now, event: "replied", actor: "guest" },
					];
					await ctx.storage.submissions!.put(input.submissionId, {
						...sub,
						status: "open", // Reopen on user reply
						audit,
					});

					// Notify admin about user's reply
					const settingsItem = await ctx.storage.settings!.get("global");
					const settings = (settingsItem ?? {}) as Record<string, unknown>;
					const adminEmail = (settings.notificationEmail as string) ?? "";

					if (adminEmail && EMAIL_RE.test(adminEmail)) {
						const formName = (sub.formName as string) ?? "Form";
						const trackingCode = (sub.trackingCode as string) ?? "";

						const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#2271b1,#1a5a8e);padding:24px;border-radius:12px 12px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">New User Reply</h2>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">${formName} — ${trackingCode}</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
    <div style="background:#fff7ed;padding:16px;border-radius:8px;border-left:4px solid #f59e0b;margin-bottom:16px">
      <p style="font-size:12px;color:#6b7280;margin:0 0 4px">From: ${input.email}</p>
      <p style="color:#374151;font-size:14px;margin:0;white-space:pre-wrap">${bodyResult.value}</p>
    </div>
  </div>
  <div style="background:#f9fafb;padding:16px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">Sent by EmDash Forms</p>
  </div>
</div>`.trim();

						dispatchAll(
							[
								{
									channel: "email",
									to: adminEmail,
									subject: `User reply: ${formName} [${trackingCode}]`,
									body: `New reply from ${input.email}:\n\n${bodyResult.value}`,
									htmlBody: html,
								},
							],
							{ log: ctx.log },
						);
					}

					ctx.log.info(`Guest reply added to submission ${input.submissionId}`);
					return { success: true, messageId };
				},
			},

			// ── Portal: Resend Access Link (public) ──────────────────────────
			"portal.resendLink": {
				input: portalResendLinkSchema,
				public: true,
				handler: async (ctx) => {
					const input = ctx.input as z.infer<typeof portalResendLinkSchema>;
					const email = input.email.trim().toLowerCase();

					if (!EMAIL_RE.test(email)) {
						return { error: "INVALID_EMAIL" };
					}

					if (ctx.email) {
						registerEmailChannel((msg) => ctx.email!.send(msg));
					}

					// Delete old tokens for this email
					const oldTokens = await ctx.storage.portal_tokens!.query({
						where: { email },
						limit: 10,
					});
					for (const item of oldTokens.items) {
						const id = (item as { id: string }).id;
						await ctx.storage.portal_tokens!.delete(id);
					}

					// Create fresh token
					const tokenId = `ptk_${Date.now()}`;
					const token = generatePortalToken();
					const now = nowIso();

					await ctx.storage.portal_tokens!.put(tokenId, {
						tokenId,
						email,
						token,
						createdAt: now,
						expiresAt: null,
						activated: false,
						activatedAt: null,
					} satisfies PortalToken);

					// Build portal URL for email link
					const baseUrl = ctx.site?.url ?? "";
					const resendSettingsItem = await ctx.storage.settings!.get("global");
					const resendSettings = (resendSettingsItem ?? {}) as Record<string, unknown>;
					const resendPortalPath = (resendSettings.portalPagePath as string) ?? "";
					const portalUrl = buildPortalUrl(baseUrl, token, resendPortalPath);

					const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#2271b1,#1a5a8e);padding:24px;border-radius:12px 12px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">New Access Link</h2>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
    <p style="color:#374151;font-size:14px;margin:0 0 20px">Here's your new access link to view your submissions:</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${portalUrl}" style="display:inline-block;background:#2271b1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Open Portal</a>
    </div>
  </div>
  <div style="background:#f9fafb;padding:16px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">Sent by EmDash Forms</p>
  </div>
</div>`.trim();

					dispatchAll(
						[
							{
								channel: "email",
								to: email,
								subject: "Your New Portal Access Link",
								body: `Access your submissions: ${portalUrl}`,
								htmlBody: html,
							},
						],
						{ log: ctx.log },
					);

					return { success: true };
				},
			},

			// ── Portal: Get Settings (public, for portal page rendering) ─────
			"portal.settings": {
				public: true,
				handler: async (ctx) => {
					const settingsItem = await ctx.storage.settings!.get("global");
					const settings = (settingsItem ?? {}) as Record<string, unknown>;
					const tier = (settings.planTier as string) ?? "free";
					return {
						portalEnabled: (settings.portalEnabled as boolean) ?? true,
						portalTitle: (settings.portalTitle as string) ?? "Support Portal",
						portalWelcomeMessage: (settings.portalWelcomeMessage as string) ?? "",
						portalDefaultLocale: (settings.portalDefaultLocale as string) ?? "en",
						portalBrandColor: (settings.portalBrandColor as string) ?? "",
						portalLoginDescription: (settings.portalLoginDescription as string) ?? "",
						planTier: tier,
						branding:
							tier === "pro"
								? null
								: {
										text: `Powered by ${PLUGIN_DISPLAY_NAME} · made by ${BRAND_TEAM}`,
										pluginName: PLUGIN_DISPLAY_NAME,
										pluginUrl: PLUGIN_URL,
										teamName: BRAND_TEAM,
										teamUrl: BRAND_URL,
									},
					};
				},
			},
		},
	};
	return definePlugin(def);
}

// Default export for runtime entry point
export default createPlugin;

// Named re-exports for consumers
export type { FormDefinitionV1, SubmissionV1, PortalToken } from "./types.js";
export { validateFormDefinition } from "./validation.js";
export { convertLegacyEfb } from "./legacy-converter.js";
export { getAllTemplates, getTemplate } from "./templates.js";
export { getBuilderGroups, getFieldMeta } from "./field-registry.js";
export { generateTrackingCode } from "./notification-engine.js";
export { dispatchAll, registerEmailChannel, registerChannel } from "./notification-dispatch.js";
