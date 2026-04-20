/**
 * Forms Builder Plugin — Domain Contracts
 *
 * Normalized form/field/submission/notification schemas for EFB migration.
 * Designed per Section I of the EFB implementation spec.
 */

// =============================================================================
// Form Definition V1
// =============================================================================

export const SCHEMA_VERSION = "1.0.0";

export type FormStatus = "draft" | "published" | "archived";
export type FormLayout = "single-column" | "two-column";
export type FormDensity = "comfortable" | "compact";
export type SubmissionMode = "standard" | "survey" | "payment" | "login";

export interface FormMeta {
	name: string;
	slug: string;
	description: string;
	status: FormStatus;
	createdAt: string; // ISO 8601
	updatedAt: string;
	createdBy: string; // user ID
}

export interface FormUi {
	theme: string;
	layout: FormLayout;
	density: FormDensity;
}

export interface TrackingConfig {
	enabled: boolean;
	style: "date_en_mix" | "sequential" | "uuid";
}

export type ThankYouMode = "message" | "redirect";

export interface ThankYouConfig {
	mode: ThankYouMode;
	message: string;
	includeTrackingCode: boolean;
	redirectUrl: string | null;
}

export interface FormWorkflow {
	submissionMode: SubmissionMode;
	tracking: TrackingConfig;
	thankYou: ThankYouConfig;
}

export interface AdminNotificationConfig {
	enabled: boolean;
	recipients: string[];
}

export interface UserNotificationConfig {
	enabled: boolean;
	recipientFieldId: string | null;
}

export interface NotificationTemplate {
	subject: string;
	body: string;
}

export interface FormNotifications {
	admin: AdminNotificationConfig;
	user: UserNotificationConfig;
	template: NotificationTemplate;
}

export interface SmsIntegration {
	enabled: boolean;
	provider: string | null;
	configRef: string | null;
}

export interface TelegramIntegration {
	enabled: boolean;
	botRef: string | null;
	chatRefs: string[];
}

export interface PaymentsIntegration {
	enabled: boolean;
	provider: string | null;
	currency: string;
}

export interface FormIntegrations {
	sms: SmsIntegration;
	telegram: TelegramIntegration;
	payments: PaymentsIntegration;
}

// =============================================================================
// Steps
// =============================================================================

export interface FormStep {
	id: string;
	title: string;
	order: number;
	fields: string[]; // ordered list of field IDs
}

// =============================================================================
// Field Types Registry
// =============================================================================

export type FieldCategory =
	| "basic_input"
	| "choice"
	| "survey"
	| "advanced"
	| "commerce"
	| "structural";

export type FieldType =
	// Basic
	| "text"
	| "name"
	| "password"
	| "email"
	| "tel"
	| "mobile"
	| "number"
	| "textarea"
	| "date"
	| "url"
	| "hidden"
	// Choice
	| "select"
	| "multiselect"
	| "radio"
	| "checkbox"
	| "yes_no"
	| "toggle"
	// Survey
	| "rating"
	| "rating_star"
	| "five_point"
	| "five_point_scale"
	| "nps"
	// Advanced
	| "file"
	| "file_upload"
	| "signature"
	| "location_picker"
	| "range"
	| "color_picker"
	// Commerce
	| "prcfld"
	| "input_price"
	| "ttlprc"
	| "total_price"
	// Layout
	| "divider"
	// Structural
	| "step"
	| "group";

// =============================================================================
// Field Object
// =============================================================================

export interface FieldOption {
	id: string;
	label: string;
	value: string;
}

export interface FieldUi {
	placeholder: string;
	width: "full" | "half" | "third";
	labelPosition: "top" | "left" | "hidden";
	helpText: string;
	/** Field-level style overrides (persisted from admin builder) */
	style?: FormFieldStyle;
}

/** Persisted field-level style overrides */
export interface FormFieldStyle {
	marginTop?: string;
	marginBottom?: string;
	padding?: string;
	borderRadius?: string;
	backgroundColor?: string;
	labelFontSize?: string;
	labelFontWeight?: string;
	inputFontSize?: string;
	placeholderColor?: string;
	borderStyle?: string;
	focusBorderColor?: string;
	errorBorderColor?: string;
}

export interface FieldValidation {
	required: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
	pattern?: string;
	format?: "email" | "url" | "phone";
	allowedExtensions?: string[];
	maxFileSizeMb?: number;
}

export interface FieldVisibility {
	hidden: boolean;
	disabled: boolean;
}

export interface LogicCondition {
	fieldId: string;
	operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";
	value: string;
}

export interface FieldLogic {
	conditions: LogicCondition[];
	action?: "show" | "hide";
	relation?: "and" | "or";
}

export interface FieldIntegrations {
	mapsToNotificationRecipient: boolean;
}

/** Persisted rating config for the embed */
export interface FormRatingConfig {
	maxRating: number;
	iconType: "star" | "heart" | "emoji" | "number";
	allowHalf: boolean;
}

/** Persisted file upload config for the embed */
export interface FormFileConfig {
	allowedTypes: string;
	maxSizeMb: number;
	maxFiles: number;
	multiple: boolean;
	showPreview: boolean;
	dragDropArea: boolean;
}

/** Persisted signature config for the embed */
export interface FormSignatureConfig {
	mode: "draw" | "type" | "upload" | "all";
	showClearButton: boolean;
}

/** Persisted multiselect config for the embed */
export interface FormMultiselectConfig {
	maxSelections: number;
}

export interface FormField {
	id: string;
	type: FieldType;
	name: string;
	label: string;
	defaultValue: string;
	ui: FieldUi;
	validation: FieldValidation;
	visibility: FieldVisibility;
	logic: FieldLogic;
	data: Record<string, unknown>;
	integrations: FieldIntegrations;
	/** Populated for choice field types */
	options?: FieldOption[];
	/** Populated for rating field types */
	ratingConfig?: FormRatingConfig;
	/** Populated for file upload field types */
	fileConfig?: FormFileConfig;
	/** Populated for signature field types */
	signatureConfig?: FormSignatureConfig;
	/** Populated for multiselect field types */
	multiselectConfig?: FormMultiselectConfig;
}

// =============================================================================
// Complete Form Definition V1
// =============================================================================

export interface FormDefinitionV1 {
	schemaVersion: typeof SCHEMA_VERSION;
	formId: string;
	meta: FormMeta;
	ui: FormUi;
	workflow: FormWorkflow;
	notifications: FormNotifications;
	integrations: FormIntegrations;
	steps: FormStep[];
	/** Map from fieldId -> field object */
	fields: Record<string, FormField>;
	/** Submit button configuration */
	submitButton?: FormSubmitButton;
	/** Migration metadata — only present on imported legacy forms */
	migrationMeta?: MigrationMeta;
}

/** Persisted submit button configuration */
export interface FormSubmitButton {
	label: string;
	size: "sm" | "md" | "lg";
	align: "left" | "center" | "right" | "full";
	variant: "filled" | "outline" | "ghost";
	backgroundColor?: string;
	textColor?: string;
	borderRadius?: string;
	borderColor?: string;
	fontSize?: string;
	fontWeight?: string;
	paddingX?: string;
	paddingY?: string;
	loadingText?: string;
	successText?: string;
	showReset?: boolean;
	resetLabel?: string;
	customClass?: string;
}

export interface MigrationMeta {
	source: "easy-form-builder";
	sourceVersion: string;
	migratedAt: string;
	warnings: string[];
}

// =============================================================================
// Submission V1
// =============================================================================

export type SubmissionStatus = "open" | "closed" | "read";

export interface SubmissionAnswer {
	fieldId: string;
	type: FieldType;
	value: unknown;
}

export interface SubmissionAuditEntry {
	at: string;
	event: "submitted" | "read" | "replied" | "closed" | "exported" | "deleted";
	actor: string;
}

export interface SubmissionV1 {
	submissionId: string;
	formId: string;
	trackingCode: string;
	status: SubmissionStatus;
	submittedAt: string;
	submittedBy: { type: "guest" | "user"; userId: string | null };
	meta: {
		ipHash: string;
		userAgent: string;
		locale: string;
	};
	answers: SubmissionAnswer[];
	attachments: string[];
	audit: SubmissionAuditEntry[];
}

// =============================================================================
// Response Thread
// =============================================================================

export interface ResponseMessage {
	messageId: string;
	submissionId: string;
	from: "admin" | "guest";
	body: string;
	sentAt: string;
	authorId: string | null;
}

// =============================================================================
// Notification Config V1
// =============================================================================

export interface NotificationConfigV1 {
	formId: string;
	admin: AdminNotificationConfig;
	user: UserNotificationConfig;
	template: NotificationTemplate;
}

// =============================================================================
// Field Registry Metadata
// =============================================================================

export interface FieldRegistryRecord {
	type: FieldType;
	version: number;
	category: FieldCategory;
	supports: {
		required: boolean;
		placeholder: boolean;
		defaultValue: boolean;
		helpText: boolean;
		width: boolean;
		validation: string[];
		conditionalLogic: boolean;
		computedValue: boolean;
		options: boolean;
		multiple: boolean;
	};
	builder: {
		displayName: string;
		icon: string;
		group: string;
	};
}

// =============================================================================
// API Input/Output Shapes
// =============================================================================

export interface CreateFormInput {
	name: string;
	description?: string;
	templateId?: string;
}

export interface UpdateFormInput {
	definition: FormDefinitionV1;
}

export interface SubmitFormInput {
	formId: string;
	answers: Array<{ fieldId: string; value: unknown }>;
	locale?: string;
}

export interface ReplyToSubmissionInput {
	submissionId: string;
	body: string;
}

export interface UpdateSubmissionStatusInput {
	submissionId: string;
	status: SubmissionStatus;
}

export interface ListFormsOutput {
	items: FormListItem[];
	nextCursor?: string;
}

export interface FormListItem {
	formId: string;
	name: string;
	status: FormStatus;
	submissionCount: number;
	lastSubmissionAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ListSubmissionsOutput {
	items: SubmissionListItem[];
	nextCursor?: string;
}

export interface SubmissionListItem {
	submissionId: string;
	formId: string;
	formName: string;
	trackingCode: string;
	status: SubmissionStatus;
	submittedAt: string;
}

export interface TrackingLookupOutput {
	trackingCode: string;
	formName: string;
	status: SubmissionStatus;
	submittedAt: string;
}

// =============================================================================
// Portal Token (Magic Link Authentication)
// =============================================================================

export interface PortalToken {
	tokenId: string;
	email: string;
	token: string;
	/** ISO 8601 timestamp when this token was created */
	createdAt: string;
	/** ISO 8601 timestamp when this token expires (null = never until first use) */
	expiresAt: string | null;
	/** Whether the token has been used (clicked) at least once */
	activated: boolean;
	/** ISO 8601 timestamp of first activation */
	activatedAt: string | null;
}

// =============================================================================
// Portal Settings (configurable by admin in Settings tab)
// =============================================================================

export interface PortalSettings {
	/** Whether the public portal is enabled */
	enabled: boolean;
	/** Portal page title */
	title: string;
	/** Portal welcome message (shown on login page) */
	welcomeMessage: string;
	/** Default language for the portal */
	defaultLocale: string;
	/** Available languages */
	availableLocales: string[];
	/** Custom branding color */
	brandColor: string;
	/** Portal login form description */
	loginDescription: string;
}

// =============================================================================
// Notification Channel (Extensible notification system)
// =============================================================================

export type NotificationChannel = "email" | "sms" | "whatsapp" | "webhook";

export interface NotificationPayload {
	channel: NotificationChannel;
	to: string;
	subject?: string;
	body: string;
	htmlBody?: string;
	metadata?: Record<string, string>;
}

export interface NotificationResult {
	channel: NotificationChannel;
	success: boolean;
	error?: string;
}
