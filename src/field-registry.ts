/**
 * Forms Builder Plugin — Field Registry
 *
 * Canonical registry of supported field types.
 * Both the builder UI and the server-side renderer use this as the source of truth.
 */

import type { FieldRegistryRecord, FieldType } from "./types.js";

// =============================================================================
// Registry
// =============================================================================

const REGISTRY: FieldRegistryRecord[] = [
	// ── Basic Input ──────────────────────────────────────────────────────────
	{
		type: "text",
		version: 1,
		category: "basic_input",
		supports: {
			required: true,
			placeholder: true,
			defaultValue: true,
			helpText: true,
			width: true,
			validation: ["minLength", "maxLength", "pattern"],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Text", icon: "text-t", group: "Basic Fields" },
	},
	{
		type: "name",
		version: 1,
		category: "basic_input",
		supports: {
			required: true,
			placeholder: true,
			defaultValue: true,
			helpText: true,
			width: true,
			validation: ["minLength", "maxLength"],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Name", icon: "user", group: "Basic Fields" },
	},
	{
		type: "email",
		version: 1,
		category: "basic_input",
		supports: {
			required: true,
			placeholder: true,
			defaultValue: true,
			helpText: true,
			width: true,
			validation: ["format"],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Email", icon: "envelope", group: "Basic Fields" },
	},
	{
		type: "tel",
		version: 1,
		category: "basic_input",
		supports: {
			required: true,
			placeholder: true,
			defaultValue: true,
			helpText: true,
			width: true,
			validation: ["pattern"],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Phone", icon: "phone", group: "Basic Fields" },
	},
	{
		type: "mobile",
		version: 1,
		category: "basic_input",
		supports: {
			required: true,
			placeholder: true,
			defaultValue: true,
			helpText: true,
			width: true,
			validation: ["pattern"],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Mobile", icon: "device-mobile", group: "Basic Fields" },
	},
	{
		type: "number",
		version: 1,
		category: "basic_input",
		supports: {
			required: true,
			placeholder: true,
			defaultValue: true,
			helpText: true,
			width: true,
			validation: ["min", "max"],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Number", icon: "hash", group: "Basic Fields" },
	},
	{
		type: "textarea",
		version: 1,
		category: "basic_input",
		supports: {
			required: true,
			placeholder: true,
			defaultValue: true,
			helpText: true,
			width: true,
			validation: ["minLength", "maxLength"],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Long Text", icon: "text-align-left", group: "Basic Fields" },
	},
	{
		type: "date",
		version: 1,
		category: "basic_input",
		supports: {
			required: true,
			placeholder: false,
			defaultValue: true,
			helpText: true,
			width: true,
			validation: [],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Date", icon: "calendar", group: "Basic Fields" },
	},
	{
		type: "password",
		version: 1,
		category: "basic_input",
		supports: {
			required: true,
			placeholder: true,
			defaultValue: false,
			helpText: true,
			width: true,
			validation: ["minLength", "maxLength", "pattern"],
			conditionalLogic: false,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Password", icon: "lock", group: "Basic Fields" },
	},
	// ── Choice ───────────────────────────────────────────────────────────────
	{
		type: "select",
		version: 1,
		category: "choice",
		supports: {
			required: true,
			placeholder: true,
			defaultValue: true,
			helpText: true,
			width: true,
			validation: [],
			conditionalLogic: true,
			computedValue: false,
			options: true,
			multiple: false,
		},
		builder: { displayName: "Dropdown", icon: "caret-down", group: "Choice Fields" },
	},
	{
		type: "multiselect",
		version: 1,
		category: "choice",
		supports: {
			required: true,
			placeholder: true,
			defaultValue: false,
			helpText: true,
			width: true,
			validation: [],
			conditionalLogic: true,
			computedValue: false,
			options: true,
			multiple: true,
		},
		builder: { displayName: "Multi-select", icon: "list-checks", group: "Choice Fields" },
	},
	{
		type: "radio",
		version: 1,
		category: "choice",
		supports: {
			required: true,
			placeholder: false,
			defaultValue: true,
			helpText: true,
			width: true,
			validation: [],
			conditionalLogic: true,
			computedValue: false,
			options: true,
			multiple: false,
		},
		builder: { displayName: "Radio", icon: "radio-button", group: "Choice Fields" },
	},
	{
		type: "checkbox",
		version: 1,
		category: "choice",
		supports: {
			required: true,
			placeholder: false,
			defaultValue: false,
			helpText: true,
			width: true,
			validation: [],
			conditionalLogic: true,
			computedValue: false,
			options: true,
			multiple: true,
		},
		builder: { displayName: "Checkbox", icon: "check-square", group: "Choice Fields" },
	},
	{
		type: "yes_no",
		version: 1,
		category: "choice",
		supports: {
			required: true,
			placeholder: false,
			defaultValue: true,
			helpText: true,
			width: true,
			validation: [],
			conditionalLogic: true,
			computedValue: false,
			options: true,
			multiple: false,
		},
		builder: { displayName: "Yes / No", icon: "toggle-left", group: "Choice Fields" },
	},
	// ── Survey ───────────────────────────────────────────────────────────────
	{
		type: "rating_star",
		version: 1,
		category: "survey",
		supports: {
			required: true,
			placeholder: false,
			defaultValue: false,
			helpText: true,
			width: true,
			validation: [],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Star Rating", icon: "star", group: "Survey Fields" },
	},
	{
		type: "five_point_scale",
		version: 1,
		category: "survey",
		supports: {
			required: true,
			placeholder: false,
			defaultValue: false,
			helpText: true,
			width: true,
			validation: [],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "5-Point Scale", icon: "chart-bar", group: "Survey Fields" },
	},
	{
		type: "nps",
		version: 1,
		category: "survey",
		supports: {
			required: true,
			placeholder: false,
			defaultValue: false,
			helpText: true,
			width: true,
			validation: [],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "NPS Score", icon: "gauge", group: "Survey Fields" },
	},
	// ── Advanced ─────────────────────────────────────────────────────────────
	{
		type: "file_upload",
		version: 1,
		category: "advanced",
		supports: {
			required: true,
			placeholder: false,
			defaultValue: false,
			helpText: true,
			width: true,
			validation: ["allowedExtensions", "maxFileSizeMb"],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "File Upload", icon: "upload", group: "Advanced" },
	},
	{
		type: "signature",
		version: 1,
		category: "advanced",
		supports: {
			required: true,
			placeholder: false,
			defaultValue: false,
			helpText: true,
			width: true,
			validation: [],
			conditionalLogic: false,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Signature", icon: "pen-nib", group: "Advanced" },
	},
	{
		type: "location_picker",
		version: 1,
		category: "advanced",
		supports: {
			required: false,
			placeholder: false,
			defaultValue: false,
			helpText: true,
			width: true,
			validation: [],
			conditionalLogic: false,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Location", icon: "map-pin", group: "Advanced" },
	},
	// ── Commerce ─────────────────────────────────────────────────────────────
	{
		type: "input_price",
		version: 1,
		category: "commerce",
		supports: {
			required: true,
			placeholder: true,
			defaultValue: true,
			helpText: true,
			width: true,
			validation: ["min", "max"],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Price Input", icon: "currency-dollar", group: "Commerce" },
	},
	{
		type: "total_price",
		version: 1,
		category: "commerce",
		supports: {
			required: false,
			placeholder: false,
			defaultValue: false,
			helpText: true,
			width: true,
			validation: [],
			conditionalLogic: false,
			computedValue: true,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Total Price", icon: "receipt", group: "Commerce" },
	},
	// ── Structural ───────────────────────────────────────────────────────────
	{
		type: "step",
		version: 1,
		category: "structural",
		supports: {
			required: false,
			placeholder: false,
			defaultValue: false,
			helpText: false,
			width: true,
			validation: [],
			conditionalLogic: false,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Step", icon: "rows", group: "Layout" },
	},
	{
		type: "group",
		version: 1,
		category: "structural",
		supports: {
			required: false,
			placeholder: false,
			defaultValue: false,
			helpText: false,
			width: true,
			validation: [],
			conditionalLogic: false,
			computedValue: false,
			options: false,
			multiple: false,
		},
		builder: { displayName: "Field Group", icon: "arrows-left-right", group: "Layout" },
	},
];

// =============================================================================
// Lookup helpers
// =============================================================================

const _byType = new Map<FieldType, FieldRegistryRecord>(REGISTRY.map((r) => [r.type, r]));

export function getFieldMeta(type: FieldType): FieldRegistryRecord | undefined {
	return _byType.get(type);
}

export function isKnownFieldType(type: string): type is FieldType {
	return _byType.has(type as FieldType);
}

export function getFieldsByCategory(
	category: FieldRegistryRecord["category"],
): FieldRegistryRecord[] {
	return REGISTRY.filter((r) => r.category === category);
}

export function getAllFields(): FieldRegistryRecord[] {
	return REGISTRY;
}

/** Groups ordered for the builder palette */
export function getBuilderGroups(): Array<{
	group: string;
	fields: FieldRegistryRecord[];
}> {
	const groups = new Map<string, FieldRegistryRecord[]>();
	for (const field of REGISTRY) {
		let bucket = groups.get(field.builder.group);
		if (!bucket) {
			bucket = [];
			groups.set(field.builder.group, bucket);
		}
		bucket.push(field);
	}
	return Array.from(groups.entries(), ([group, fields]) => ({ group, fields }));
}
