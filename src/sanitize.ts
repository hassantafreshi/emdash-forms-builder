/**
 * Forms Builder Plugin — Sanitization & Validation
 *
 * Field-type-aware sanitizer for form submissions, settings, and user messages.
 * Strips dangerous HTML, validates formats (email, phone, URL), enforces
 * length limits, and returns structured errors per field.
 */

import type { FieldType } from "./types.js";

// =============================================================================
// Result Types
// =============================================================================

export interface SanitizeSuccess<T = unknown> {
	success: true;
	value: T;
}

export interface SanitizeError {
	success: false;
	error: {
		code: SanitizeErrorCode;
		message: string;
		field?: string;
	};
}

export type SanitizeResult<T = unknown> = SanitizeSuccess<T> | SanitizeError;

export type SanitizeErrorCode =
	| "INVALID_TYPE"
	| "REQUIRED"
	| "TOO_SHORT"
	| "TOO_LONG"
	| "INVALID_EMAIL"
	| "INVALID_PHONE"
	| "INVALID_URL"
	| "INVALID_DATE"
	| "INVALID_NUMBER"
	| "OUT_OF_RANGE"
	| "INVALID_PATTERN"
	| "DANGEROUS_CONTENT"
	| "INVALID_OPTION";

// =============================================================================
// HTML Sanitization
// =============================================================================

/** HTML entity map for escaping dangerous characters. */
const HTML_ESCAPE_MAP: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#x27;",
	"/": "&#x2F;",
	"`": "&#96;",
};

const HTML_ESCAPE_RE = /[&<>"'`/]/g;

/** Escape HTML entities to prevent XSS. */
export function escapeHtml(input: string): string {
	return input.replace(HTML_ESCAPE_RE, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

/** Strip all HTML tags from a string. */
export function stripHtml(input: string): string {
	return input.replace(/<[^>]*>/g, "");
}

/**
 * Remove dangerous patterns:
 * - `javascript:` / `vbscript:` / `data:` URIs
 * - `on*` event attributes
 * - Control characters (except \t \n \r)
 */
export function stripDangerousContent(input: string): string {
	let s = input;
	// Strip script-like protocol prefixes (case-insensitive, allows whitespace tricks)
	s = s.replace(/\b(javascript|vbscript|data)\s*:/gi, "");
	// Strip on-event patterns like onclick=, onload=
	s = s.replace(/\bon[a-z]+\s*=/gi, "");
	// Strip control chars except tab, newline, carriage return
	// eslint-disable-next-line no-control-regex
	s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
	return s;
}

// =============================================================================
// Format Validators
// =============================================================================

/**
 * RFC 5322 simplified email regex.
 * Allows standard email addresses; does not allow IP literals.
 */
const EMAIL_RE =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/** E.164-ish phone: optional +, digits, spaces, hyphens, parens. 7-20 chars of digits. */
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;

/** Digits only for phone (used to count digit length). */
const PHONE_DIGITS_RE = /\d/g;

export function isValidEmail(value: string): boolean {
	if (value.length > 254) return false;
	return EMAIL_RE.test(value);
}

export function isValidPhone(value: string): boolean {
	if (!PHONE_RE.test(value)) return false;
	const digits = value.match(PHONE_DIGITS_RE);
	return digits !== null && digits.length >= 7 && digits.length <= 15;
}

export function isValidUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

export function isValidDate(value: string): boolean {
	const d = new Date(value);
	return !isNaN(d.getTime());
}

// =============================================================================
// Text Sanitizer (core building block)
// =============================================================================

export interface SanitizeTextOptions {
	maxLength?: number;
	minLength?: number;
	stripTags?: boolean;
	escapeEntities?: boolean;
	trim?: boolean;
	pattern?: RegExp;
	patternMessage?: string;
}

/**
 * Sanitize a text value: trim, strip HTML, escape entities, enforce length.
 */
export function sanitizeText(
	input: unknown,
	options: SanitizeTextOptions = {},
): SanitizeResult<string> {
	const {
		maxLength = 10000,
		minLength = 0,
		stripTags = true,
		escapeEntities = false,
		trim = true,
		pattern,
		patternMessage,
	} = options;

	if (input === null || input === undefined) {
		return { success: true, value: "" };
	}

	if (typeof input !== "string") {
		return { success: false, error: { code: "INVALID_TYPE", message: "Expected a text value" } };
	}

	let value = input;
	if (trim) value = value.trim();

	// Remove dangerous content first
	value = stripDangerousContent(value);

	if (stripTags) {
		value = stripHtml(value);
	}

	if (escapeEntities) {
		value = escapeHtml(value);
	}

	if (value.length < minLength) {
		return {
			success: false,
			error: { code: "TOO_SHORT", message: `Must be at least ${minLength} characters` },
		};
	}

	if (value.length > maxLength) {
		return {
			success: false,
			error: { code: "TOO_LONG", message: `Must be at most ${maxLength} characters` },
		};
	}

	if (pattern && !pattern.test(value)) {
		return {
			success: false,
			error: { code: "INVALID_PATTERN", message: patternMessage ?? "Invalid format" },
		};
	}

	return { success: true, value };
}

// =============================================================================
// Field-Type Sanitizers
// =============================================================================

export interface SanitizeFieldOptions {
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
	pattern?: string;
	format?: "email" | "url" | "phone";
	allowedValues?: string[];
}

/**
 * Sanitize and validate a single field value based on its FieldType.
 * Returns a discriminated union: `{ success, value }` or `{ success: false, error }`.
 */
export function sanitizeFieldValue(
	fieldType: FieldType,
	value: unknown,
	options: SanitizeFieldOptions = {},
): SanitizeResult {
	// Handle required check first
	const isEmpty = value === null || value === undefined || value === "";
	if (isEmpty) {
		if (options.required) {
			return { success: false, error: { code: "REQUIRED", message: "This field is required" } };
		}
		return { success: true, value: fieldType === "number" ? null : "" };
	}

	switch (fieldType) {
		case "email":
			return sanitizeEmail(value, options);
		case "tel":
		case "mobile":
			return sanitizePhone(value, options);
		case "number":
		case "input_price":
		case "total_price":
			return sanitizeNumber(value, options);
		case "date":
			return sanitizeDateValue(value);
		case "textarea":
			return sanitizeText(value, {
				maxLength: options.maxLength ?? 50000,
				minLength: options.minLength,
				stripTags: true,
			});
		case "password":
			return sanitizeText(value, {
				maxLength: options.maxLength ?? 200,
				minLength: options.minLength ?? 1,
				stripTags: false,
				escapeEntities: true,
			});
		case "select":
		case "radio":
		case "yes_no":
			return sanitizeChoice(value, options);
		case "multiselect":
		case "checkbox":
			return sanitizeMultiChoice(value, options);
		case "rating_star":
		case "five_point_scale":
			return sanitizeRating(value, fieldType);
		case "nps":
			return sanitizeNps(value);
		case "text":
		case "name":
		default:
			return sanitizeText(value, {
				maxLength: options.maxLength ?? 1000,
				minLength: options.minLength,
				pattern: options.pattern ? new RegExp(options.pattern) : undefined,
			});
	}
}

// =============================================================================
// Per-Type Sanitizers
// =============================================================================

function sanitizeEmail(value: unknown, options: SanitizeFieldOptions): SanitizeResult<string> {
	if (typeof value !== "string") {
		return { success: false, error: { code: "INVALID_TYPE", message: "Expected a text value" } };
	}

	const trimmed = value.trim().toLowerCase();

	if (trimmed.length > 254) {
		return {
			success: false,
			error: { code: "TOO_LONG", message: "Email must be at most 254 characters" },
		};
	}

	// Strip dangerous content but don't strip HTML entities that might be in the email
	const cleaned = stripDangerousContent(trimmed);

	if (!isValidEmail(cleaned)) {
		return {
			success: false,
			error: { code: "INVALID_EMAIL", message: "Invalid email address" },
		};
	}

	if (options.maxLength && cleaned.length > options.maxLength) {
		return {
			success: false,
			error: { code: "TOO_LONG", message: `Must be at most ${options.maxLength} characters` },
		};
	}

	return { success: true, value: cleaned };
}

function sanitizePhone(value: unknown, options: SanitizeFieldOptions): SanitizeResult<string> {
	if (typeof value !== "string") {
		return { success: false, error: { code: "INVALID_TYPE", message: "Expected a text value" } };
	}

	const trimmed = value.trim();
	const cleaned = stripDangerousContent(stripHtml(trimmed));

	if (!isValidPhone(cleaned)) {
		return {
			success: false,
			error: { code: "INVALID_PHONE", message: "Invalid phone number" },
		};
	}

	if (options.maxLength && cleaned.length > options.maxLength) {
		return {
			success: false,
			error: { code: "TOO_LONG", message: `Must be at most ${options.maxLength} characters` },
		};
	}

	return { success: true, value: cleaned };
}

function sanitizeNumber(value: unknown, options: SanitizeFieldOptions): SanitizeResult<number> {
	let num: number;

	if (typeof value === "number") {
		num = value;
	} else if (typeof value === "string") {
		num = Number(value.trim());
	} else {
		return {
			success: false,
			error: { code: "INVALID_TYPE", message: "Expected a numeric value" },
		};
	}

	if (isNaN(num) || !isFinite(num)) {
		return {
			success: false,
			error: { code: "INVALID_NUMBER", message: "Invalid number" },
		};
	}

	if (options.min !== undefined && num < options.min) {
		return {
			success: false,
			error: { code: "OUT_OF_RANGE", message: `Must be at least ${options.min}` },
		};
	}

	if (options.max !== undefined && num > options.max) {
		return {
			success: false,
			error: { code: "OUT_OF_RANGE", message: `Must be at most ${options.max}` },
		};
	}

	return { success: true, value: num };
}

function sanitizeDateValue(value: unknown): SanitizeResult<string> {
	if (typeof value !== "string") {
		return { success: false, error: { code: "INVALID_TYPE", message: "Expected a date string" } };
	}

	const trimmed = value.trim();

	if (!isValidDate(trimmed)) {
		return {
			success: false,
			error: { code: "INVALID_DATE", message: "Invalid date" },
		};
	}

	// Normalize to ISO string
	return { success: true, value: new Date(trimmed).toISOString() };
}

function sanitizeChoice(value: unknown, options: SanitizeFieldOptions): SanitizeResult<string> {
	if (typeof value !== "string") {
		return { success: false, error: { code: "INVALID_TYPE", message: "Expected a text value" } };
	}

	const cleaned = stripDangerousContent(stripHtml(value.trim()));

	if (options.allowedValues && !options.allowedValues.includes(cleaned)) {
		return {
			success: false,
			error: { code: "INVALID_OPTION", message: "Selected value is not a valid option" },
		};
	}

	return { success: true, value: cleaned };
}

function sanitizeMultiChoice(
	value: unknown,
	options: SanitizeFieldOptions,
): SanitizeResult<string[]> {
	const values = Array.isArray(value) ? value : typeof value === "string" ? [value] : null;

	if (!values) {
		return {
			success: false,
			error: { code: "INVALID_TYPE", message: "Expected an array of values" },
		};
	}

	const cleaned: string[] = [];
	for (const v of values) {
		if (typeof v !== "string") {
			return {
				success: false,
				error: { code: "INVALID_TYPE", message: "Each selected value must be text" },
			};
		}
		const item = stripDangerousContent(stripHtml(v.trim()));
		if (options.allowedValues && !options.allowedValues.includes(item)) {
			return {
				success: false,
				error: { code: "INVALID_OPTION", message: `'${escapeHtml(item)}' is not a valid option` },
			};
		}
		cleaned.push(item);
	}

	return { success: true, value: cleaned };
}

function sanitizeRating(
	value: unknown,
	fieldType: "rating_star" | "five_point_scale",
): SanitizeResult<number> {
	const max = fieldType === "rating_star" ? 5 : 5;
	return sanitizeNumber(value, { min: 1, max });
}

function sanitizeNps(value: unknown): SanitizeResult<number> {
	return sanitizeNumber(value, { min: 0, max: 10 });
}

// =============================================================================
// Bulk Sanitizer — Sanitize All Submission Answers
// =============================================================================

export interface FieldDescriptor {
	fieldId: string;
	type: FieldType;
	label: string;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
	pattern?: string;
	format?: "email" | "url" | "phone";
	options?: Array<{ value: string }>;
}

export interface SanitizedAnswer {
	fieldId: string;
	type: FieldType;
	value: unknown;
}

export interface SanitizeAnswersSuccess {
	success: true;
	answers: SanitizedAnswer[];
}

export interface SanitizeAnswersError {
	success: false;
	errors: Array<{
		fieldId: string;
		label: string;
		code: SanitizeErrorCode;
		message: string;
	}>;
}

export type SanitizeAnswersResult = SanitizeAnswersSuccess | SanitizeAnswersError;

/**
 * Sanitize and validate all answers for a form submission.
 * Maps each answer to its field descriptor, applies per-type sanitization,
 * and collects all errors (not just the first).
 */
export function sanitizeAnswers(
	answers: Array<{ fieldId: string; value: unknown }>,
	fields: FieldDescriptor[],
): SanitizeAnswersResult {
	const fieldMap = new Map(fields.map((f) => [f.fieldId, f]));
	const errors: SanitizeAnswersError["errors"] = [];
	const sanitized: SanitizedAnswer[] = [];

	// Check every known field (not just submitted answers) so required-but-missing is caught
	for (const field of fields) {
		const answer = answers.find((a) => a.fieldId === field.fieldId);
		const rawValue = answer?.value ?? null;

		const result = sanitizeFieldValue(field.type, rawValue, {
			required: field.required,
			minLength: field.minLength,
			maxLength: field.maxLength,
			min: field.min,
			max: field.max,
			pattern: field.pattern,
			format: field.format,
			allowedValues: field.options?.map((o) => o.value),
		});

		if (!result.success) {
			errors.push({
				fieldId: field.fieldId,
				label: field.label,
				code: result.error.code,
				message: result.error.message,
			});
		} else {
			sanitized.push({ fieldId: field.fieldId, type: field.type, value: result.value });
		}
	}

	if (errors.length > 0) {
		return { success: false, errors };
	}

	return { success: true, answers: sanitized };
}

// =============================================================================
// Settings Sanitizer
// =============================================================================

export interface SettingsInput {
	notificationEmail?: unknown;
	trackingStyle?: unknown;
	autoDeleteDays?: unknown;
	captchaEnabled?: unknown;
}

export interface SanitizedSettings {
	notificationEmail: string;
	trackingStyle: "date_en_mix" | "sequential" | "uuid";
	autoDeleteDays: number;
	captchaEnabled: boolean;
}

const VALID_TRACKING_STYLES = new Set(["date_en_mix", "sequential", "uuid"]);

/**
 * Sanitize plugin settings input.
 */
export function sanitizeSettings(input: SettingsInput): SanitizeResult<SanitizedSettings> {
	// Email
	const emailResult = sanitizeEmail(input.notificationEmail ?? "", {});
	if (typeof input.notificationEmail === "string" && input.notificationEmail.trim() !== "") {
		if (!emailResult.success) {
			return {
				success: false,
				error: { ...emailResult.error, field: "notificationEmail" },
			};
		}
	}

	// Tracking style
	const trackingRaw =
		typeof input.trackingStyle === "string" ? input.trackingStyle.trim() : "date_en_mix";
	if (!VALID_TRACKING_STYLES.has(trackingRaw)) {
		return {
			success: false,
			error: {
				code: "INVALID_OPTION",
				message: "Invalid tracking style",
				field: "trackingStyle",
			},
		};
	}

	// Auto-delete days
	const daysResult = sanitizeNumber(input.autoDeleteDays ?? 0, { min: 0, max: 3650 });
	if (!daysResult.success) {
		return {
			success: false,
			error: { ...daysResult.error, field: "autoDeleteDays" },
		};
	}

	// Captcha enabled
	const captcha = input.captchaEnabled === true || input.captchaEnabled === "true";

	return {
		success: true,
		value: {
			notificationEmail: emailResult.success ? emailResult.value : "",
			trackingStyle: trackingRaw as SanitizedSettings["trackingStyle"],
			autoDeleteDays: daysResult.value,
			captchaEnabled: captcha,
		},
	};
}

// =============================================================================
// Message / Reply Sanitizer
// =============================================================================

/**
 * Sanitize a user message or admin reply body.
 */
export function sanitizeMessage(body: unknown): SanitizeResult<string> {
	return sanitizeText(body, {
		maxLength: 10000,
		minLength: 1,
		stripTags: true,
		trim: true,
	});
}
