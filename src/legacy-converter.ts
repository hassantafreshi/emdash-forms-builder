/**
 * Forms Builder Plugin — Legacy EFB Converter
 *
 * Migrates the legacy Easy Form Builder flat-array JSON format to FormDefinitionV1.
 * Section I.7 of the EFB implementation spec.
 *
 * Security: no eval, no dynamic SQL, no arbitrary code execution.
 * All identifiers are validated and sanitized before use.
 */

import { ulid } from "ulidx";

import { isKnownFieldType } from "./field-registry.js";
import type {
	FormDefinitionV1,
	FormField,
	FormStep,
	FieldOption,
	FieldType,
	FieldUi,
	FieldValidation,
	MigrationMeta,
} from "./types.js";
import { SCHEMA_VERSION } from "./types.js";

// =============================================================================
// Legacy Type Stubs
// =============================================================================

/** A single item in the legacy EFB flat array */
interface LegacyItem {
	type?: string;
	id_?: string | number;
	title?: string;
	required?: string | boolean;
	milen?: string | number;
	mlen?: string | number;
	placeholder?: string;
	hint?: string;
	parent?: string | number;
	label?: string;
	value?: string;
	width?: string;
	disable?: string | boolean;
	hiden?: string | boolean;
	// form-level fields
	form_name?: string;
	form_slug?: string;
	status?: string;
	step?: number;
	amount?: number;
	// notification fields
	email_admin?: string | boolean;
	email_user?: string | boolean;
	admin_email?: string;
	user_email_field?: string | number;
	// template fields
	subject?: string;
	message?: string;
	// misc
	[key: string]: unknown;
}

// =============================================================================
// Legacy → canonical field type map
// =============================================================================

const LEGACY_TYPE_MAP: Record<string, FieldType> = {
	text: "text",
	email: "email",
	tel: "tel",
	phone: "tel",
	mobile: "mobile",
	number: "number",
	textarea: "textarea",
	long_text: "textarea",
	date: "date",
	select: "select",
	multiselect: "multiselect",
	radio: "radio",
	radio_button: "radio",
	checkbox: "checkbox",
	yes_no: "yes_no",
	yesNo: "yes_no",
	rating: "rating_star",
	rating_star: "rating_star",
	five_point_scale: "five_point_scale",
	fivePointScale: "five_point_scale",
	nps: "nps",
	file: "file_upload",
	file_upload: "file_upload",
	esign: "signature",
	signature: "signature",
	location: "location_picker",
	location_picker: "location_picker",
	price: "input_price",
	input_price: "input_price",
	total: "total_price",
	total_price: "total_price",
	name: "name",
	password: "password",
};

// =============================================================================
// Helpers
// =============================================================================

function toBool(val: unknown): boolean {
	if (typeof val === "boolean") return val;
	if (val === "1" || val === "true" || val === 1) return true;
	return false;
}

function toStr(val: unknown): string {
	if (val === null || val === undefined) return "";
	if (typeof val === "string") return val;
	if (typeof val === "number" || typeof val === "boolean" || typeof val === "bigint")
		return String(val);
	if (typeof val === "object") return JSON.stringify(val);
	return "";
}

function toInt(val: unknown): number | undefined {
	const n = Number(val);
	return isNaN(n) ? undefined : Math.floor(n);
}

const SAFE_NAME_CLEAN = /[^a-z0-9]+/g;
const SAFE_NAME_TRIM = /^_+|_+$/g;
const SLUGIFY_CLEAN = /[^a-z0-9]+/g;
const SLUGIFY_TRIM = /^-+|-+$/g;
const EMAIL_QUICK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeName(label: string): string {
	return (
		label.toLowerCase().replace(SAFE_NAME_CLEAN, "_").replace(SAFE_NAME_TRIM, "").slice(0, 60) ||
		"field"
	);
}

function slugify(name: string): string {
	return (
		name.toLowerCase().replace(SLUGIFY_CLEAN, "-").replace(SLUGIFY_TRIM, "").slice(0, 100) ||
		"untitled-form"
	);
}

/** Generate a deterministic-looking prefix-based ID */
function makeId(prefix: string): string {
	return `${prefix}${ulid().toLowerCase()}`;
}

// =============================================================================
// Main converter
// =============================================================================

export interface ConversionResult {
	form: FormDefinitionV1;
	warnings: string[];
}

export function convertLegacyEfb(
	rawArray: unknown,
	options: {
		sourceVersion?: string;
		nowIso?: string;
		createdBy?: string;
	} = {},
): ConversionResult {
	const warnings: string[] = [];
	const now = options.nowIso ?? new Date().toISOString();
	const sourceVersion = options.sourceVersion ?? "unknown";
	const createdBy = options.createdBy ?? "system";

	// ── 1. Validate input is an array ────────────────────────────────────────
	if (!Array.isArray(rawArray) || rawArray.length === 0) {
		throw new Error("Legacy EFB input must be a non-empty array");
	}

	const items = rawArray as LegacyItem[];

	// ── 2. Classify items by type ────────────────────────────────────────────
	const formItem = items[0]; // form object is always index 0
	if (!formItem) {
		throw new Error("Input array is empty — no form item found");
	}
	const stepItems: LegacyItem[] = [];
	const fieldItems: LegacyItem[] = [];
	const optionItems: LegacyItem[] = [];

	for (let i = 0; i < items.length; i++) {
		const item = items[i]!;
		const t = toStr(item.type).toLowerCase();
		if (i === 0) continue; // form object handled separately
		if (t === "step") {
			stepItems.push(item);
		} else if (t === "option") {
			optionItems.push(item);
		} else if (t in LEGACY_TYPE_MAP || isKnownFieldType(t)) {
			fieldItems.push(item);
		} else {
			warnings.push(`Unknown item type '${t}' at index ${i} — skipped`);
		}
	}

	// ── 3. Build ID maps ──────────────────────────────────────────────────────
	/** legacy id_ → canonical fld_ id */
	const fieldIdMap = new Map<string, string>();
	/** legacy id_ → canonical stp_ id */
	const stepIdMap = new Map<string, string>();

	for (const field of fieldItems) {
		const legacyId = toStr(field.id_);
		const canonical = `fld_${legacyId || makeId("").slice(0, 16)}`;
		fieldIdMap.set(legacyId, canonical);
	}

	for (const step of stepItems) {
		const legacyId = toStr(step.id_);
		const canonical = `stp_${legacyId || makeId("").slice(0, 16)}`;
		stepIdMap.set(legacyId, canonical);
	}

	// ── 4. Build options map by parent id ─────────────────────────────────────
	const optionsByParent = new Map<string, FieldOption[]>();
	for (const opt of optionItems) {
		const parentKey = toStr(opt.parent);
		if (!parentKey) {
			warnings.push(`Option '${opt.label}' has no parent — skipped`);
			continue;
		}
		const targetFieldId = fieldIdMap.get(parentKey) ?? `fld_${parentKey}`;
		const list = optionsByParent.get(targetFieldId) ?? [];
		list.push({
			id: `opt_${makeId("").slice(0, 12)}`,
			label: toStr(opt.label || opt.title),
			value: toStr(opt.value || opt.label || opt.title),
		});
		optionsByParent.set(targetFieldId, list);
	}

	// ── 5. Build canonical field objects ──────────────────────────────────────
	const fieldObjects: Record<string, FormField> = {};
	const nameTracker = new Map<string, number>();

	for (const legacy of fieldItems) {
		const legacyId = toStr(legacy.id_);
		const canonicalId = fieldIdMap.get(legacyId)!;
		const rawType = toStr(legacy.type).toLowerCase();
		const canonicalType: FieldType = LEGACY_TYPE_MAP[rawType] ?? "text";

		if (!LEGACY_TYPE_MAP[rawType]) {
			warnings.push(`Field type '${rawType}' not in type map — defaulting to 'text'`);
		}

		const rawLabel = toStr(legacy.title || legacy.label || rawType);
		let baseName = safeName(rawLabel);

		// Ensure unique name within form
		const count = nameTracker.get(baseName) ?? 0;
		const finalName = count === 0 ? baseName : `${baseName}_${count}`;
		nameTracker.set(baseName, count + 1);

		const ui: FieldUi = {
			placeholder: toStr(legacy.placeholder),
			width: legacy.width === "half" ? "half" : legacy.width === "third" ? "third" : "full",
			labelPosition: "top",
			helpText: toStr(legacy.hint),
		};

		const validation: FieldValidation = {
			required: toBool(legacy.required),
		};
		const minLen = toInt(legacy.milen);
		if (minLen !== undefined) validation.minLength = minLen;
		const maxLen = toInt(legacy.mlen);
		if (maxLen !== undefined) validation.maxLength = maxLen;
		if (canonicalType === "email") validation.format = "email";

		const field: FormField = {
			id: canonicalId,
			type: canonicalType,
			name: finalName,
			label: rawLabel,
			defaultValue: toStr(legacy.value),
			ui,
			validation,
			visibility: {
				hidden: toBool(legacy.hiden),
				disabled: toBool(legacy.disable),
			},
			logic: { conditions: [] },
			data: {},
			integrations: { mapsToNotificationRecipient: canonicalType === "email" },
		};

		const opts = optionsByParent.get(canonicalId);
		if (opts && opts.length > 0) {
			field.options = opts;
		}

		fieldObjects[canonicalId] = field;
	}

	// ── 6. Build steps ────────────────────────────────────────────────────────
	let steps: FormStep[];

	if (stepItems.length === 0) {
		// No explicit steps — put all fields in a single default step
		const stepId = makeId("stp_");
		steps = [
			{
				id: stepId,
				title: "Step 1",
				order: 1,
				fields: Object.keys(fieldObjects),
			},
		];
	} else {
		// Build step→field assignment from field's `step` index property
		const stepFieldMap = new Map<string, string[]>();
		for (const step of stepItems) {
			const canonicalStepId = stepIdMap.get(toStr(step.id_))!;
			stepFieldMap.set(canonicalStepId, []);
		}

		// Default step for fields with no step reference
		const firstStepId = stepIdMap.values().next().value;

		for (const legacy of fieldItems) {
			const legacyId = toStr(legacy.id_);
			const canonicalFieldId = fieldIdMap.get(legacyId)!;
			const legacyStepIndex = toInt(legacy.step);

			let assignedStep: string | undefined;
			if (legacyStepIndex !== undefined) {
				const stepEntry = stepItems[legacyStepIndex - 1];
				if (stepEntry) {
					assignedStep = stepIdMap.get(toStr(stepEntry.id_));
				}
			}
			const targetStepId = assignedStep ?? firstStepId;
			if (targetStepId) {
				const list = stepFieldMap.get(targetStepId) ?? [];
				list.push(canonicalFieldId);
				stepFieldMap.set(targetStepId, list);
			}
		}

		steps = stepItems.map((s, idx) => {
			const canonicalStepId = stepIdMap.get(toStr(s.id_))!;
			return {
				id: canonicalStepId,
				title: toStr(s.title || `Step ${idx + 1}`),
				order: idx + 1,
				fields: stepFieldMap.get(canonicalStepId) ?? [],
			};
		});
	}

	// Ensure at least one step
	if (steps.length === 0) {
		warnings.push("No steps found — creating default step");
		steps = [
			{
				id: makeId("stp_"),
				title: "Step 1",
				order: 1,
				fields: Object.keys(fieldObjects),
			},
		];
	}

	// ── 7. Map form-level settings ────────────────────────────────────────────
	const formName = toStr(formItem.form_name || formItem.title || "Imported Form");
	const rawSlug = toStr(formItem.form_slug || formName);

	// Notification settings
	const adminEmailEnabled = toBool(formItem.email_admin);
	const rawAdminEmail = toStr(formItem.admin_email);
	const adminRecipients: string[] = rawAdminEmail
		? rawAdminEmail
				.split(",")
				.map((e) => e.trim())
				.filter((e) => EMAIL_QUICK.test(e))
		: [];
	const userEmailEnabled = toBool(formItem.email_user);
	const legacyUserEmailFieldId = toStr(formItem.user_email_field);
	const userRecipientFieldId = legacyUserEmailFieldId
		? (fieldIdMap.get(legacyUserEmailFieldId) ?? null)
		: null;

	const migrationMeta: MigrationMeta = {
		source: "easy-form-builder",
		sourceVersion,
		migratedAt: now,
		warnings,
	};

	// ── 8. Assemble FormDefinitionV1 ─────────────────────────────────────────
	const form: FormDefinitionV1 = {
		schemaVersion: SCHEMA_VERSION,
		formId: makeId("frm_"),
		meta: {
			name: formName,
			slug: slugify(rawSlug),
			description: "",
			status: "draft",
			createdAt: now,
			updatedAt: now,
			createdBy,
		},
		ui: {
			theme: "default",
			layout: "single-column",
			density: "comfortable",
		},
		workflow: {
			submissionMode: "standard",
			tracking: { enabled: true, style: "date_en_mix" },
			thankYou: {
				mode: "message",
				message: "Thank you for your submission.",
				includeTrackingCode: true,
				redirectUrl: null,
			},
		},
		notifications: {
			admin: {
				enabled: adminEmailEnabled,
				recipients: adminRecipients,
			},
			user: {
				enabled: userEmailEnabled,
				recipientFieldId: userRecipientFieldId,
			},
			template: {
				subject: toStr(formItem.subject || "[website_name] New submission [confirmation_code]"),
				body: toStr(formItem.message || "A new form submission has been received. [link_response]"),
			},
		},
		integrations: {
			sms: { enabled: false, provider: null, configRef: null },
			telegram: { enabled: false, botRef: null, chatRefs: [] },
			payments: { enabled: false, provider: null, currency: "USD" },
		},
		steps,
		fields: fieldObjects,
		migrationMeta,
	};

	return { form, warnings };
}
