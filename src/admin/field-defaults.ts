/**
 * Forms Builder — Field Defaults & Configuration
 *
 * Default values for every field property, and factory functions
 * to create new canvas fields with sensible defaults.
 */

import type {
	AddressFieldConfig,
	CanvasField,
	DateFieldConfig,
	FieldAdvancedConfig,
	FieldLogicConfig,
	FieldOption,
	FieldStyleConfig,
	FieldValidationConfig,
	FileFieldConfig,
	GroupConfig,
	MultiselectFieldConfig,
	NumberFieldConfig,
	RatingFieldConfig,
	SignatureFieldConfig,
	StepConfig,
	TextFieldConfig,
} from "./types.js";

// =============================================================================
// Default sub-configs
// =============================================================================

export function defaultValidation(): FieldValidationConfig {
	return {
		requiredMessage: "",
		customErrorMessage: "",
		minLength: undefined,
		maxLength: undefined,
		minValue: undefined,
		maxValue: undefined,
		pattern: undefined,
		patternMessage: undefined,
		inputMask: undefined,
		trimInput: true,
		emailValidation: false,
		phoneValidation: false,
		urlValidation: false,
		numericOnly: false,
		integerOnly: false,
		decimalAllowed: true,
	};
}

export function defaultLogic(): FieldLogicConfig {
	return {
		enabled: false,
		action: "show",
		relation: "and",
		conditions: [],
	};
}

export function defaultStyle(): FieldStyleConfig {
	return {
		marginTop: "",
		marginBottom: "",
		padding: "",
		borderRadius: "",
		backgroundColor: "",
		labelFontSize: "",
		labelFontWeight: "",
		inputFontSize: "",
		placeholderColor: "",
		borderStyle: "",
		focusBorderColor: "",
		errorBorderColor: "",
	};
}

export function defaultAdvanced(): FieldAdvancedConfig {
	return {
		databaseKey: "",
		apiMappingKey: "",
		exportLabel: "",
		ariaLabel: "",
		ariaDescribedBy: "",
		tabIndex: undefined,
		autocomplete: "",
		includeInEmail: true,
		includeInExport: true,
		includeInPdf: true,
		sanitizeInput: true,
		encryptField: false,
		doNotStore: false,
		customMetaKey: "",
		onChangeAction: "",
		onFocusAction: "",
		onBlurAction: "",
	};
}

export function defaultTextConfig(): TextFieldConfig {
	return {
		inputType: "text",
		prefix: "",
		suffix: "",
		rows: 4,
		showCharCount: false,
		showPasswordToggle: false,
		resizable: true,
		passwordStrengthMeter: false,
	};
}

export function defaultFileConfig(): FileFieldConfig {
	return {
		allowedTypes: "",
		allowedMimeTypes: "",
		maxSizeMb: 10,
		maxFiles: 1,
		multiple: false,
		showPreview: true,
		dragDropArea: true,
		showProgressBar: true,
		renameOnUpload: false,
	};
}

export function defaultDateConfig(): DateFieldConfig {
	return {
		dateFormat: "YYYY-MM-DD",
		timeFormat: "HH:mm",
		minDate: "",
		maxDate: "",
		disablePast: false,
		disableFuture: false,
		disableWeekends: false,
		disableSpecificDays: "",
		dateRangeSupport: false,
		timeIntervalMinutes: 15,
	};
}

export function defaultNumberConfig(): NumberFieldConfig {
	return {
		step: 1,
		decimalPrecision: 2,
		currency: "",
		showThousandSeparator: false,
		allowNegative: true,
		formulaExpression: "",
	};
}

export function defaultRatingConfig(): RatingFieldConfig {
	return {
		maxRating: 5,
		iconType: "star",
		allowHalf: false,
	};
}

export function defaultAddressConfig(): AddressFieldConfig {
	return {
		showCountry: true,
		showState: true,
		showCity: true,
		showPostalCode: true,
		showStreet: true,
		showApartment: false,
		enableAutocomplete: false,
	};
}

export function defaultSignatureConfig(): SignatureFieldConfig {
	return {
		mode: "draw",
		showClearButton: true,
	};
}

export function defaultMultiselectConfig(): MultiselectFieldConfig {
	return {
		maxSelections: 0,
	};
}

export function defaultStepConfig(): StepConfig {
	return {
		showStepNumber: true,
		showStepTitle: true,
		description: "",
		showProgressBar: true,
		nextButtonLabel: "Next",
		prevButtonLabel: "Previous",
		collapsible: false,
		initiallyCollapsed: false,
	};
}

export function defaultGroupConfig(): GroupConfig {
	return {
		showBorder: true,
		showTitle: true,
		description: "",
		collapsible: false,
		initiallyCollapsed: false,
		columns: 1,
	};
}

// =============================================================================
// Default options for choice fields
// =============================================================================

function defaultOptionsForType(fieldType: string): FieldOption[] {
	switch (fieldType) {
		case "radio":
			return [
				{ id: "opt_1", label: "Option 1", value: "option_1" },
				{ id: "opt_2", label: "Option 2", value: "option_2" },
				{ id: "opt_3", label: "Option 3", value: "option_3" },
			];
		case "checkbox":
			return [
				{ id: "opt_1", label: "Choice A", value: "choice_a" },
				{ id: "opt_2", label: "Choice B", value: "choice_b" },
				{ id: "opt_3", label: "Choice C", value: "choice_c" },
			];
		case "select":
		case "multiselect":
			return [
				{ id: "opt_1", label: "Select one...", value: "" },
				{ id: "opt_2", label: "Option A", value: "option_a" },
				{ id: "opt_3", label: "Option B", value: "option_b" },
				{ id: "opt_4", label: "Option C", value: "option_c" },
			];
		case "yesNo":
		case "yes_no":
			return [
				{ id: "opt_1", label: "Yes", value: "yes" },
				{ id: "opt_2", label: "No", value: "no" },
			];
		default:
			return [];
	}
}

// =============================================================================
// Field Type Metadata (for the palette)
// =============================================================================

export interface FieldTypeMeta {
	type: string;
	label: string;
	category: "basic" | "payment" | "advanced" | "structural";
	hasOptions: boolean;
	aliases: string[];
}

export const FIELD_TYPE_REGISTRY: FieldTypeMeta[] = [
	// Basic
	{
		type: "text",
		label: "Text",
		category: "basic",
		hasOptions: false,
		aliases: ["input", "single line", "short text"],
	},
	{
		type: "name",
		label: "Name",
		category: "basic",
		hasOptions: false,
		aliases: ["full name", "first name", "last name"],
	},
	{
		type: "password",
		label: "Password",
		category: "basic",
		hasOptions: false,
		aliases: ["passcode", "login"],
	},
	{
		type: "email",
		label: "Email",
		category: "basic",
		hasOptions: false,
		aliases: ["mail", "email address"],
	},
	{
		type: "number",
		label: "Number",
		category: "basic",
		hasOptions: false,
		aliases: ["numeric", "count", "quantity"],
	},
	{
		type: "textarea",
		label: "Paragraph",
		category: "basic",
		hasOptions: false,
		aliases: ["long text", "message", "textarea"],
	},
	{
		type: "checkbox",
		label: "Checkbox",
		category: "basic",
		hasOptions: true,
		aliases: ["check box", "multi choice"],
	},
	{
		type: "radio",
		label: "Radio",
		category: "basic",
		hasOptions: true,
		aliases: ["radio button", "single choice"],
	},
	{
		type: "select",
		label: "Dropdown",
		category: "basic",
		hasOptions: true,
		aliases: ["select", "menu", "picker"],
	},
	{
		type: "multiselect",
		label: "Multi-Select",
		category: "basic",
		hasOptions: true,
		aliases: ["tags", "multi dropdown"],
	},
	{
		type: "tel",
		label: "Phone",
		category: "basic",
		hasOptions: false,
		aliases: ["telephone", "phone number"],
	},
	{
		type: "date",
		label: "Date",
		category: "basic",
		hasOptions: false,
		aliases: ["calendar", "date picker"],
	},
/* 	{
		type: "file",
		label: "File Upload",
		category: "basic",
		hasOptions: false,
		aliases: ["upload", "attachment"],
	}, */
	{
		type: "range",
		label: "Range / Slider",
		category: "basic",
		hasOptions: false,
		aliases: ["slider", "scale"],
	},
	{
		type: "toggle",
		label: "Toggle",
		category: "basic",
		hasOptions: false,
		aliases: ["switch", "on off", "boolean"],
	},
	/* 	{
		type: "yesNo",
		label: "Yes / No",
		category: "basic",
		hasOptions: true,
		aliases: ["yes no", "binary choice"],
	}, */
	// Payment
/* 	{
		type: "prcfld",
		label: "Price",
		category: "payment",
		hasOptions: false,
		aliases: ["amount", "cost", "fee"],
	}, */
/* 	{
		type: "ttlprc",
		label: "Total",
		category: "payment",
		hasOptions: false,
		aliases: ["sum", "grand total"],
	}, */
	/* {
		type: "stripe",
		label: "Stripe",
		category: "payment",
		hasOptions: false,
		aliases: ["card payment", "gateway"],
	},
	{
		type: "paypal",
		label: "PayPal",
		category: "payment",
		hasOptions: false,
		aliases: ["payment gateway", "wallet"],
	}, */
	// Advanced
	/* 	{
		type: "address",
		label: "Address",
		category: "advanced",
		hasOptions: false,
		aliases: ["street", "postal", "location"],
	}, */
	{
		type: "url",
		label: "Website / URL",
		category: "advanced",
		hasOptions: false,
		aliases: ["link", "web address"],
	},
	/* 	{
		type: "countries_dd",
		label: "Country",
		category: "advanced",
		hasOptions: true,
		aliases: ["nation", "country list"],
	}, */
	/* 	{
		type: "state_dd",
		label: "State / Province",
		category: "advanced",
		hasOptions: true,
		aliases: ["region", "province"],
	}, */
/* 	{
		type: "signature",
		label: "Signature",
		category: "advanced",
		hasOptions: false,
		aliases: ["sign", "e-sign"],
	}, */
	{
		type: "rating",
		label: "Star Rating",
		category: "advanced",
		hasOptions: false,
		aliases: ["stars", "review"],
	},
	/* 	{
		type: "nps",
		label: "NPS Score",
		category: "advanced",
		hasOptions: false,
		aliases: ["net promoter", "score"],
	}, */
	{
		type: "five_point",
		label: "5-Point Scale",
		category: "advanced",
		hasOptions: false,
		aliases: ["likert", "five point"],
	},
	/* 	{
		type: "heading",
		label: "Heading",
		category: "advanced",
		hasOptions: false,
		aliases: ["title", "header", "section"],
	}, */
	/* 	{
		type: "html_code",
		label: "Custom HTML",
		category: "advanced",
		hasOptions: false,
		aliases: ["html", "embed", "code"],
	}, */
	{
		type: "color_picker",
		label: "Color Picker",
		category: "advanced",
		hasOptions: false,
		aliases: ["color", "palette", "hex"],
	},
	/* 	{
		type: "imgRadio",
		label: "Image Choice",
		category: "advanced",
		hasOptions: true,
		aliases: ["image picker", "visual choice"],
	}, */
	/* 	{
		type: "terms",
		label: "Terms & Conditions",
		category: "advanced",
		hasOptions: false,
		aliases: ["consent", "agreement", "privacy"],
	}, */
	/* 	{
		type: "table_matrix",
		label: "Matrix / Table",
		category: "advanced",
		hasOptions: true,
		aliases: ["grid", "table", "matrix"],
	}, */
	{
		type: "hidden",
		label: "Hidden Field",
		category: "advanced",
		hasOptions: false,
		aliases: ["invisible", "hidden input"],
	},
	{
		type: "divider",
		label: "Divider",
		category: "advanced",
		hasOptions: false,
		aliases: ["separator", "line", "hr"],
	},
	// Structural / Layout
/* 	{
		type: "step",
		label: "Step",
		category: "structural",
		hasOptions: false,
		aliases: ["wizard", "multi-step", "page break", "section"],
	},
	{
		type: "group",
		label: "Field Group",
		category: "structural",
		hasOptions: false,
		aliases: ["fieldset", "section", "container", "panel", "box"],
	}, */
];

// =============================================================================
// Create a new canvas field with defaults
// =============================================================================

let fieldCounter = 0;

export function createCanvasField(fieldType: string, label?: string): CanvasField {
	fieldCounter++;
	const meta = FIELD_TYPE_REGISTRY.find((f) => f.type === fieldType);
	const displayLabel = label ?? meta?.label ?? fieldType;
	const fieldName = `${fieldType}_${fieldCounter}`;

	return {
		instanceId: `${fieldType}_${Date.now()}_${fieldCounter}`,
		fieldType,
		label: displayLabel,
		name: fieldName,
		placeholder: "",
		defaultValue: "",
		helpText: "",
		tooltip: "",
		required: false,
		disabled: false,
		readOnly: false,
		hidden: false,
		width: "full",
		labelPosition: "top",
		cssClass: "",
		customId: "",
		iconBefore: "",
		iconAfter: "",
		descriptionPosition: "below-input",

		validation: defaultValidation(),
		options: defaultOptionsForType(fieldType),
		logic: defaultLogic(),
		style: defaultStyle(),
		advanced: defaultAdvanced(),

		textConfig: defaultTextConfig(),
		fileConfig: defaultFileConfig(),
		dateConfig: defaultDateConfig(),
		numberConfig: defaultNumberConfig(),
		ratingConfig: defaultRatingConfig(),
		addressConfig: defaultAddressConfig(),
		signatureConfig: defaultSignatureConfig(),
		multiselectConfig: defaultMultiselectConfig(),
		stepConfig: defaultStepConfig(),
		groupConfig: defaultGroupConfig(),
	};
}

// =============================================================================
// Field type checks
// =============================================================================

const CHOICE_FIELD_TYPES = new Set([
	"radio",
	"checkbox",
	"select",
	"multiselect",
	"yesNo",
	"yes_no",
	"countries_dd",
	"state_dd",
	"cities_dd",
	"imgRadio",
	"table_matrix",
]);

const TEXT_FIELD_TYPES = new Set([
	"text",
	"name",
	"email",
	"password",
	"tel",
	"mobile",
	"url",
	"textarea",
	"number",
]);

const FILE_FIELD_TYPES = new Set(["file", "dadfile"]);
const DATE_FIELD_TYPES = new Set(["date", "jalali_date", "hijri_date"]);
const NUMBER_FIELD_TYPES = new Set(["number", "range", "prcfld", "ttlprc"]);
const RATING_FIELD_TYPES = new Set(["rating", "rating_star", "five_point", "nps"]);
const STRUCTURAL_FIELD_TYPES = new Set(["heading", "divider", "html_code", "step", "group"]);

export function isChoiceField(type: string): boolean {
	return CHOICE_FIELD_TYPES.has(type);
}
export function isTextField(type: string): boolean {
	return TEXT_FIELD_TYPES.has(type);
}
export function isFileField(type: string): boolean {
	return FILE_FIELD_TYPES.has(type);
}
export function isDateField(type: string): boolean {
	return DATE_FIELD_TYPES.has(type);
}
export function isNumberField(type: string): boolean {
	return NUMBER_FIELD_TYPES.has(type);
}
export function isRatingField(type: string): boolean {
	return RATING_FIELD_TYPES.has(type);
}
export function isStructuralField(type: string): boolean {
	return STRUCTURAL_FIELD_TYPES.has(type);
}
export function isStepField(type: string): boolean {
	return type === "step";
}
export function isGroupField(type: string): boolean {
	return type === "group";
}

// =============================================================================
// Initial fields for templates
// =============================================================================

export function getTemplateFields(templateId: string): CanvasField[] {
	switch (templateId) {
		case "contact":
		case "contact-template":
			return [
				createCanvasField("name", "Name"),
				createCanvasField("email", "Email"),
				createCanvasField("textarea", "Message"),
			];
		case "support":
			return [
				createCanvasField("name", "Your Name"),
				createCanvasField("email", "Email"),
				createCanvasField("select", "Priority"),
				createCanvasField("textarea", "Description"),
			];
		case "survey":
		case "feedback":
			return [
				createCanvasField("rating", "Overall Rating"),
				createCanvasField("nps", "NPS Score"),
				createCanvasField("textarea", "Comments"),
			];
		case "payment":
		case "order":
			return [
				createCanvasField("name", "Full Name"),
				createCanvasField("email", "Email"),
				createCanvasField("prcfld", "Amount"),
			];
		case "signin":
			return [createCanvasField("email", "Email"), createCanvasField("password", "Password")];
		default:
			return [];
	}
}
