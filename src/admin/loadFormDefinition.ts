/**
 * Forms Builder — FormDefinitionV1 → CanvasField[] converter
 *
 * Reverse of buildFormDefinition: takes a stored form definition and
 * reconstructs the admin UI canvas fields so the builder can edit them.
 */

import type { FormDefinitionV1, FormField } from "../types.js";
import { createCanvasField } from "./field-defaults.js";
import type { AfterSubmitConfig, CanvasField, FieldOption } from "./types.js";

function mapWidthBack(w: "full" | "half" | "third"): CanvasField["width"] {
	return w;
}

function mapLabelPositionBack(pos: "top" | "left" | "hidden"): CanvasField["labelPosition"] {
	return pos;
}

function formFieldToCanvasField(field: FormField, _index: number): CanvasField {
	// Start from defaults for this field type so all config objects exist
	const canvas = createCanvasField(field.type, field.label);

	// Overwrite with stored values
	canvas.name = field.name;
	canvas.label = field.label;
	canvas.defaultValue = field.defaultValue || "";
	canvas.placeholder = field.ui?.placeholder || "";
	canvas.helpText = field.ui?.helpText || "";
	canvas.width = mapWidthBack(field.ui?.width || "full");
	canvas.labelPosition = mapLabelPositionBack(field.ui?.labelPosition || "top");
	canvas.required = field.validation?.required ?? false;
	canvas.hidden = field.visibility?.hidden ?? false;
	canvas.disabled = field.visibility?.disabled ?? false;

	// Validation
	if (field.validation) {
		canvas.validation = {
			...canvas.validation,
			minLength: field.validation.minLength,
			maxLength: field.validation.maxLength,
			minValue: field.validation.min,
			maxValue: field.validation.max,
			pattern: field.validation.pattern,
		};
	}

	// Style
	if (field.ui?.style) {
		canvas.style = { ...canvas.style, ...field.ui.style };
	}

	// Options
	if (field.options && field.options.length > 0) {
		canvas.options = field.options.map(
			(o): FieldOption => ({
				id: o.id,
				label: o.label,
				value: o.value,
			}),
		);
	}

	// Rating config
	if (field.ratingConfig) {
		canvas.ratingConfig = { ...canvas.ratingConfig, ...field.ratingConfig };
	}

	// File config
	if (field.fileConfig) {
		canvas.fileConfig = { ...canvas.fileConfig, ...field.fileConfig };
	}

	// Signature config
	if (field.signatureConfig) {
		canvas.signatureConfig = { ...canvas.signatureConfig, ...field.signatureConfig };
	}

	// Multiselect config
	if (field.multiselectConfig) {
		canvas.multiselectConfig = { ...canvas.multiselectConfig, ...field.multiselectConfig };
	}

	return canvas;
}

export interface LoadedFormData {
	formId: string;
	name: string;
	description: string;
	fields: CanvasField[];
	afterSubmit?: AfterSubmitConfig;
}

/**
 * Convert a stored FormDefinitionV1 into the data the form builder needs.
 */
export function loadFormDefinition(def: FormDefinitionV1): LoadedFormData {
	// Collect field IDs in step order so we preserve ordering
	const orderedFieldIds: string[] = [];
	if (def.steps && def.steps.length > 0) {
		for (const step of def.steps) {
			if (step.fields) {
				for (const fid of step.fields) {
					orderedFieldIds.push(fid);
				}
			}
		}
	}

	// If no steps or empty, fall back to iterating the fields map
	const fieldEntries =
		orderedFieldIds.length > 0
			? orderedFieldIds
					.map((fid, i) => {
						const field = def.fields[fid];
						return field ? ([fid, field, i] as const) : null;
					})
					.filter((e): e is [string, FormField, number] => e !== null)
			: Object.entries(def.fields).map(([fid, field], i) => [fid, field, i] as const);

	const fields = fieldEntries.map(([_fid, field, index]) => formFieldToCanvasField(field, index));

	// Extract after-submit config from workflow
	let afterSubmit: AfterSubmitConfig | undefined;
	if (def.workflow) {
		const wf = def.workflow;
		afterSubmit = {
			thankYouMode: wf.thankYou?.mode ?? "message",
			thankYouMessage: wf.thankYou?.message ?? "Thank you! Your submission has been received.",
			redirectUrl: wf.thankYou?.redirectUrl ?? "",
			showTrackingCode: wf.thankYou?.includeTrackingCode ?? true,
			submissionMode: (wf.submissionMode as AfterSubmitConfig["submissionMode"]) ?? "standard",
		};
	}

	return {
		formId: def.formId,
		name: def.meta?.name || "Untitled Form",
		description: def.meta?.description || "",
		fields,
		afterSubmit,
	};
}
