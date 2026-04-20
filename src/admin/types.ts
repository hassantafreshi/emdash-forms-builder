/**
 * Forms Builder — Admin UI Types
 *
 * Comprehensive type definitions for the drag-and-drop form builder.
 */

// =============================================================================
// UI State Types
// =============================================================================

export type PreviewMode = "desktop" | "tablet" | "mobile";
export type SettingsTab = "general" | "validation" | "options" | "logic" | "style" | "advanced";
export type WidthOption = "full" | "half" | "third" | "quarter";
export type LabelPosition = "top" | "left" | "right" | "hidden";
export type FieldCategoryTab = "all" | "basic" | "payment" | "advanced";

// =============================================================================
// Conditional Logic
// =============================================================================

export type LogicAction = "show" | "hide" | "enable" | "disable" | "require" | "set_value";
export type LogicRelation = "and" | "or";
export type ConditionOperator =
	| "equals"
	| "not_equals"
	| "contains"
	| "not_contains"
	| "is_empty"
	| "is_not_empty"
	| "greater_than"
	| "less_than"
	| "starts_with"
	| "ends_with";

export interface LogicCondition {
	id: string;
	fieldId: string;
	operator: ConditionOperator;
	value: string;
}

export interface FieldLogicConfig {
	enabled: boolean;
	action: LogicAction;
	relation: LogicRelation;
	conditions: LogicCondition[];
}

// =============================================================================
// Field Options (for choice fields)
// =============================================================================

export interface FieldOption {
	id: string;
	label: string;
	value: string;
	icon?: string;
	image?: string;
}

// =============================================================================
// Field Validation Config
// =============================================================================

export interface FieldValidationConfig {
	requiredMessage: string;
	customErrorMessage: string;
	minLength?: number;
	maxLength?: number;
	minValue?: number;
	maxValue?: number;
	pattern?: string;
	patternMessage?: string;
	inputMask?: string;
	trimInput: boolean;
	emailValidation: boolean;
	phoneValidation: boolean;
	urlValidation: boolean;
	numericOnly: boolean;
	integerOnly: boolean;
	decimalAllowed: boolean;
}

// =============================================================================
// Field Style Config
// =============================================================================

export interface FieldStyleConfig {
	marginTop: string;
	marginBottom: string;
	padding: string;
	borderRadius: string;
	backgroundColor: string;
	labelFontSize: string;
	labelFontWeight: string;
	inputFontSize: string;
	placeholderColor: string;
	borderStyle: string;
	focusBorderColor: string;
	errorBorderColor: string;
}

// =============================================================================
// Field Advanced Config
// =============================================================================

export interface FieldAdvancedConfig {
	databaseKey: string;
	apiMappingKey: string;
	exportLabel: string;
	ariaLabel: string;
	ariaDescribedBy: string;
	tabIndex?: number;
	autocomplete: string;
	includeInEmail: boolean;
	includeInExport: boolean;
	includeInPdf: boolean;
	sanitizeInput: boolean;
	encryptField: boolean;
	doNotStore: boolean;
	customMetaKey: string;
	onChangeAction: string;
	onFocusAction: string;
	onBlurAction: string;
}

// =============================================================================
// Type-Specific Configs
// =============================================================================

export interface TextFieldConfig {
	inputType: string;
	prefix: string;
	suffix: string;
	rows: number;
	showCharCount: boolean;
	showPasswordToggle: boolean;
	resizable: boolean;
	passwordStrengthMeter: boolean;
}

export interface FileFieldConfig {
	allowedTypes: string;
	allowedMimeTypes: string;
	maxSizeMb: number;
	maxFiles: number;
	multiple: boolean;
	showPreview: boolean;
	dragDropArea: boolean;
	showProgressBar: boolean;
	renameOnUpload: boolean;
}

export interface DateFieldConfig {
	dateFormat: string;
	timeFormat: string;
	minDate: string;
	maxDate: string;
	disablePast: boolean;
	disableFuture: boolean;
	disableWeekends: boolean;
	disableSpecificDays: string;
	dateRangeSupport: boolean;
	timeIntervalMinutes: number;
}

export interface NumberFieldConfig {
	step: number;
	decimalPrecision: number;
	currency: string;
	showThousandSeparator: boolean;
	allowNegative: boolean;
	formulaExpression: string;
}

export interface RatingFieldConfig {
	maxRating: number;
	iconType: "star" | "heart" | "emoji" | "number";
	allowHalf: boolean;
}

export interface AddressFieldConfig {
	showCountry: boolean;
	showState: boolean;
	showCity: boolean;
	showPostalCode: boolean;
	showStreet: boolean;
	showApartment: boolean;
	enableAutocomplete: boolean;
}

export interface SignatureFieldConfig {
	mode: "draw" | "type" | "upload" | "all";
	showClearButton: boolean;
}

export interface MultiselectFieldConfig {
	maxSelections: number;
}

export interface StepConfig {
	showStepNumber: boolean;
	showStepTitle: boolean;
	description: string;
	showProgressBar: boolean;
	nextButtonLabel: string;
	prevButtonLabel: string;
	collapsible: boolean;
	initiallyCollapsed: boolean;
}

export interface GroupConfig {
	showBorder: boolean;
	showTitle: boolean;
	description: string;
	collapsible: boolean;
	initiallyCollapsed: boolean;
	columns: 1 | 2 | 3;
}

// =============================================================================
// Canvas Field (complete field state)
// =============================================================================

export interface CanvasField {
	instanceId: string;
	fieldType: string;
	label: string;
	name: string;
	placeholder: string;
	defaultValue: string;
	helpText: string;
	tooltip: string;
	required: boolean;
	disabled: boolean;
	readOnly: boolean;
	hidden: boolean;
	width: WidthOption;
	labelPosition: LabelPosition;
	cssClass: string;
	customId: string;
	iconBefore: string;
	iconAfter: string;
	descriptionPosition: "below-label" | "below-input";

	validation: FieldValidationConfig;
	options: FieldOption[];
	logic: FieldLogicConfig;
	style: FieldStyleConfig;
	advanced: FieldAdvancedConfig;

	textConfig: TextFieldConfig;
	fileConfig: FileFieldConfig;
	dateConfig: DateFieldConfig;
	numberConfig: NumberFieldConfig;
	ratingConfig: RatingFieldConfig;
	addressConfig: AddressFieldConfig;
	signatureConfig: SignatureFieldConfig;
	multiselectConfig: MultiselectFieldConfig;
	stepConfig: StepConfig;
	groupConfig: GroupConfig;

	/** Multi-step: which step this field belongs to */
	stepId?: string;
	/** Group: which group this field belongs to */
	groupId?: string;
}

// =============================================================================
// History Entry (for undo/redo)
// =============================================================================

export interface HistoryEntry {
	fields: CanvasField[];
	selectedFieldId: string | null;
	timestamp: number;
}

// =============================================================================
// Submit Button Config
// =============================================================================

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonAlign = "left" | "center" | "right" | "full";
export type ButtonVariant = "filled" | "outline" | "ghost";

export interface SubmitButtonConfig {
	label: string;
	size: ButtonSize;
	align: ButtonAlign;
	variant: ButtonVariant;
	backgroundColor: string;
	textColor: string;
	borderRadius: string;
	borderColor: string;
	fontSize: string;
	fontWeight: string;
	paddingX: string;
	paddingY: string;
	icon: string;
	iconPosition: "before" | "after";
	loadingText: string;
	successText: string;
	disableAfterSubmit: boolean;
	showReset: boolean;
	resetLabel: string;
	customClass: string;
}

export interface NextButtonConfig {
	label: string;
	size: ButtonSize;
	align: ButtonAlign;
	variant: ButtonVariant;
	backgroundColor: string;
	textColor: string;
	borderRadius: string;
	borderColor: string;
	fontSize: string;
	fontWeight: string;
	paddingX: string;
	paddingY: string;
	showPrev: boolean;
	prevLabel: string;
	customClass: string;
}

// =============================================================================
// After-Submission Config (thank-you / tracking / redirect)
// =============================================================================

export type ThankYouMode = "message" | "redirect";
export type SubmissionMode = "standard" | "survey" | "payment" | "login" | "register";

export interface AfterSubmitConfig {
	/** What to show after submission: a message or redirect to a URL */
	thankYouMode: ThankYouMode;
	/** Custom thank-you message shown after submission */
	thankYouMessage: string;
	/** URL to redirect to after submission (when mode = "redirect") */
	redirectUrl: string;
	/** Whether to display the tracking code to the user */
	showTrackingCode: boolean;
	/** Form purpose / submission mode — extensible for future form types */
	submissionMode: SubmissionMode;
}

// =============================================================================
// Form Builder State
// =============================================================================

export interface FormBuilderState {
	fields: CanvasField[];
	selectedFieldId: string | null;
	clipboard: CanvasField | null;
	undoStack: HistoryEntry[];
	redoStack: HistoryEntry[];
	isDirty: boolean;
	formName: string;
	formDescription: string;
	previewMode: PreviewMode;
	submitButton: SubmitButtonConfig;
	nextButton: NextButtonConfig;
	afterSubmit: AfterSubmitConfig;
}
