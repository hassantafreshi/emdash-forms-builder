/**
 * Forms Builder — CanvasField[] → FormDefinitionV1 converter
 *
 * Transforms the rich admin UI state into the normalized domain schema
 * expected by the backend validation and storage layer.
 */

import type {
	FieldType,
	FormDefinitionV1,
	FormField,
	FormFieldStyle,
	FormFileConfig,
	FormMultiselectConfig,
	FormRatingConfig,
	FormSignatureConfig,
	FormSubmitButton,
} from "../types.js";
import { SCHEMA_VERSION } from "../types.js";
import type { CanvasField, AfterSubmitConfig, SubmitButtonConfig } from "./types.js";

const SLUG_CLEAN = /[^a-z0-9]+/g;
const SLUG_TRIM = /^-+|-+$/g;

const RATING_TYPES = new Set(["rating", "rating_star"]);
const FILE_TYPES = new Set(["file", "file_upload"]);
const SIGNATURE_TYPES = new Set(["signature"]);

function isRatingType(t: string): boolean {
	return RATING_TYPES.has(t);
}
function isFileType(t: string): boolean {
	return FILE_TYPES.has(t);
}
function isSignatureType(t: string): boolean {
	return SIGNATURE_TYPES.has(t);
}

function toSlug(name: string): string {
	return name.toLowerCase().replace(SLUG_CLEAN, "-").replace(SLUG_TRIM, "").slice(0, 100) || "form";
}

function mapWidth(w: string): "full" | "half" | "third" {
	if (w === "half") return "half";
	if (w === "third" || w === "quarter") return "third";
	return "full";
}

function mapLabelPosition(pos: string): "top" | "left" | "hidden" {
	if (pos === "left") return "left";
	if (pos === "hidden") return "hidden";
	return "top";
}

/** Only include non-empty style values in the persisted definition */
function buildFieldStyle(f: CanvasField): FormFieldStyle | undefined {
	const s = f.style;
	const result: FormFieldStyle = {};
	let hasAny = false;
	for (const key of Object.keys(s) as (keyof typeof s)[]) {
		const val = s[key];
		if (val) {
			(result as Record<string, string>)[key] = val;
			hasAny = true;
		}
	}
	return hasAny ? result : undefined;
}

/** Map admin SubmitButtonConfig → persisted FormSubmitButton */
function buildSubmitButton(btn: SubmitButtonConfig): FormSubmitButton {
	return {
		label: btn.label,
		size: btn.size,
		align: btn.align,
		variant: btn.variant,
		...(btn.backgroundColor ? { backgroundColor: btn.backgroundColor } : {}),
		...(btn.textColor ? { textColor: btn.textColor } : {}),
		...(btn.borderRadius ? { borderRadius: btn.borderRadius } : {}),
		...(btn.borderColor ? { borderColor: btn.borderColor } : {}),
		...(btn.fontSize ? { fontSize: btn.fontSize } : {}),
		...(btn.fontWeight ? { fontWeight: btn.fontWeight } : {}),
		...(btn.paddingX ? { paddingX: btn.paddingX } : {}),
		...(btn.paddingY ? { paddingY: btn.paddingY } : {}),
		...(btn.loadingText ? { loadingText: btn.loadingText } : {}),
		...(btn.successText ? { successText: btn.successText } : {}),
		...(btn.showReset ? { showReset: btn.showReset } : {}),
		...(btn.resetLabel ? { resetLabel: btn.resetLabel } : {}),
		...(btn.customClass ? { customClass: btn.customClass } : {}),
	};
}

export function buildFormDefinition(
	formId: string,
	formName: string,
	formDescription: string,
	fields: CanvasField[],
	submitButton?: SubmitButtonConfig,
	afterSubmit?: AfterSubmitConfig,
): FormDefinitionV1 {
	const now = new Date().toISOString();
	const slug = toSlug(formName);

	const fieldMap: Record<string, FormField> = {};
	const fieldIds: string[] = [];

	for (const [i, f] of fields.entries()) {
		if (f.fieldType === "step" || f.fieldType === "group") continue;

		const fieldId = `fld_${f.name || f.fieldType + "_" + i}`;
		fieldIds.push(fieldId);

		fieldMap[fieldId] = {
			id: fieldId,
			type: f.fieldType as FieldType,
			name: f.name || `${f.fieldType}_${i}`,
			label: f.label,
			defaultValue: f.defaultValue || "",
			ui: {
				placeholder: f.placeholder || "",
				width: mapWidth(f.width),
				labelPosition: mapLabelPosition(f.labelPosition),
				helpText: f.helpText || "",
				style: buildFieldStyle(f),
			},
			validation: {
				required: f.required,
				minLength: f.validation.minLength,
				maxLength: f.validation.maxLength,
				min: f.validation.minValue,
				max: f.validation.maxValue,
				pattern: f.validation.pattern,
			},
			visibility: {
				hidden: f.hidden,
				disabled: f.disabled,
			},
			logic: { conditions: [] },
			data: {},
			integrations: { mapsToNotificationRecipient: false },
			options:
				f.options.length > 0
					? f.options.map((o) => ({ id: o.id, label: o.label, value: o.value }))
					: undefined,
			...(isRatingType(f.fieldType)
				? {
						ratingConfig: {
							maxRating: f.ratingConfig.maxRating,
							iconType: f.ratingConfig.iconType,
							allowHalf: f.ratingConfig.allowHalf,
						} satisfies FormRatingConfig,
					}
				: {}),
			...(isFileType(f.fieldType)
				? {
						fileConfig: {
							allowedTypes: f.fileConfig.allowedTypes,
							maxSizeMb: f.fileConfig.maxSizeMb,
							maxFiles: f.fileConfig.maxFiles,
							multiple: f.fileConfig.multiple,
							showPreview: f.fileConfig.showPreview,
							dragDropArea: f.fileConfig.dragDropArea,
						} satisfies FormFileConfig,
					}
				: {}),
			...(isSignatureType(f.fieldType)
				? {
						signatureConfig: {
							mode: f.signatureConfig.mode,
							showClearButton: f.signatureConfig.showClearButton,
						} satisfies FormSignatureConfig,
					}
				: {}),
			...(f.fieldType === "multiselect"
				? {
						multiselectConfig: {
							maxSelections: f.multiselectConfig.maxSelections,
						} satisfies FormMultiselectConfig,
					}
				: {}),
		};
	}

	return {
		schemaVersion: SCHEMA_VERSION,
		formId,
		meta: {
			name: formName,
			slug,
			description: formDescription,
			status: "draft",
			createdAt: now,
			updatedAt: now,
			createdBy: "admin",
		},
		ui: { theme: "default", layout: "single-column", density: "comfortable" },
		workflow: {
			submissionMode: afterSubmit?.submissionMode ?? "standard",
			tracking: { enabled: afterSubmit?.showTrackingCode ?? true, style: "date_en_mix" },
			thankYou: {
				mode: afterSubmit?.thankYouMode ?? "message",
				message: afterSubmit?.thankYouMessage ?? "Thank you for your submission.",
				includeTrackingCode: afterSubmit?.showTrackingCode ?? true,
				redirectUrl:
					afterSubmit?.thankYouMode === "redirect" ? afterSubmit.redirectUrl || null : null,
			},
		},
		notifications: {
			admin: { enabled: false, recipients: [] },
			user: { enabled: false, recipientFieldId: null },
			template: {
				subject: "New form submission",
				body: "A new submission was received.",
			},
		},
		integrations: {
			sms: { enabled: false, provider: null, configRef: null },
			telegram: { enabled: false, botRef: null, chatRefs: [] },
			payments: { enabled: false, provider: null, currency: "USD" },
		},
		steps: [{ id: "stp_main", title: "Main", order: 1, fields: fieldIds }],
		fields: fieldMap,
		...(submitButton ? { submitButton: buildSubmitButton(submitButton) } : {}),
	};
}
