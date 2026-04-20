import { PluginDescriptor, ResolvedPlugin } from "emdash";
import { z } from "zod";

//#region src/types.d.ts
/**
 * Forms Builder Plugin — Domain Contracts
 *
 * Normalized form/field/submission/notification schemas for EFB migration.
 * Designed per Section I of the EFB implementation spec.
 */
declare const SCHEMA_VERSION = "1.0.0";
type FormStatus = "draft" | "published" | "archived";
type FormLayout = "single-column" | "two-column";
type FormDensity = "comfortable" | "compact";
type SubmissionMode = "standard" | "survey" | "payment" | "login";
interface FormMeta {
  name: string;
  slug: string;
  description: string;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
interface FormUi {
  theme: string;
  layout: FormLayout;
  density: FormDensity;
}
interface TrackingConfig {
  enabled: boolean;
  style: "date_en_mix" | "sequential" | "uuid";
}
type ThankYouMode = "message" | "redirect";
interface ThankYouConfig {
  mode: ThankYouMode;
  message: string;
  includeTrackingCode: boolean;
  redirectUrl: string | null;
}
interface FormWorkflow {
  submissionMode: SubmissionMode;
  tracking: TrackingConfig;
  thankYou: ThankYouConfig;
}
interface AdminNotificationConfig {
  enabled: boolean;
  recipients: string[];
}
interface UserNotificationConfig {
  enabled: boolean;
  recipientFieldId: string | null;
}
interface NotificationTemplate {
  subject: string;
  body: string;
}
interface FormNotifications {
  admin: AdminNotificationConfig;
  user: UserNotificationConfig;
  template: NotificationTemplate;
}
interface SmsIntegration {
  enabled: boolean;
  provider: string | null;
  configRef: string | null;
}
interface TelegramIntegration {
  enabled: boolean;
  botRef: string | null;
  chatRefs: string[];
}
interface PaymentsIntegration {
  enabled: boolean;
  provider: string | null;
  currency: string;
}
interface FormIntegrations {
  sms: SmsIntegration;
  telegram: TelegramIntegration;
  payments: PaymentsIntegration;
}
interface FormStep {
  id: string;
  title: string;
  order: number;
  fields: string[];
}
type FieldCategory = "basic_input" | "choice" | "survey" | "advanced" | "commerce" | "structural";
type FieldType = "text" | "name" | "password" | "email" | "tel" | "mobile" | "number" | "textarea" | "date" | "url" | "hidden" | "select" | "multiselect" | "radio" | "checkbox" | "yes_no" | "toggle" | "rating" | "rating_star" | "five_point" | "five_point_scale" | "nps" | "file" | "file_upload" | "signature" | "location_picker" | "range" | "color_picker" | "prcfld" | "input_price" | "ttlprc" | "total_price" | "divider" | "step" | "group";
interface FieldOption {
  id: string;
  label: string;
  value: string;
}
interface FieldUi {
  placeholder: string;
  width: "full" | "half" | "third";
  labelPosition: "top" | "left" | "hidden";
  helpText: string;
  /** Field-level style overrides (persisted from admin builder) */
  style?: FormFieldStyle;
}
/** Persisted field-level style overrides */
interface FormFieldStyle {
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
interface FieldValidation {
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
interface FieldVisibility {
  hidden: boolean;
  disabled: boolean;
}
interface LogicCondition {
  fieldId: string;
  operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";
  value: string;
}
interface FieldLogic {
  conditions: LogicCondition[];
  action?: "show" | "hide";
  relation?: "and" | "or";
}
interface FieldIntegrations {
  mapsToNotificationRecipient: boolean;
}
/** Persisted rating config for the embed */
interface FormRatingConfig {
  maxRating: number;
  iconType: "star" | "heart" | "emoji" | "number";
  allowHalf: boolean;
}
/** Persisted file upload config for the embed */
interface FormFileConfig {
  allowedTypes: string;
  maxSizeMb: number;
  maxFiles: number;
  multiple: boolean;
  showPreview: boolean;
  dragDropArea: boolean;
}
/** Persisted signature config for the embed */
interface FormSignatureConfig {
  mode: "draw" | "type" | "upload" | "all";
  showClearButton: boolean;
}
/** Persisted multiselect config for the embed */
interface FormMultiselectConfig {
  maxSelections: number;
}
interface FormField {
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
interface FormDefinitionV1 {
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
interface FormSubmitButton {
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
interface MigrationMeta {
  source: "easy-form-builder";
  sourceVersion: string;
  migratedAt: string;
  warnings: string[];
}
type SubmissionStatus = "open" | "closed" | "read";
interface SubmissionAnswer {
  fieldId: string;
  type: FieldType;
  value: unknown;
}
interface SubmissionAuditEntry {
  at: string;
  event: "submitted" | "read" | "replied" | "closed" | "exported" | "deleted";
  actor: string;
}
interface SubmissionV1 {
  submissionId: string;
  formId: string;
  trackingCode: string;
  status: SubmissionStatus;
  submittedAt: string;
  submittedBy: {
    type: "guest" | "user";
    userId: string | null;
  };
  meta: {
    ipHash: string;
    userAgent: string;
    locale: string;
  };
  answers: SubmissionAnswer[];
  attachments: string[];
  audit: SubmissionAuditEntry[];
}
interface FieldRegistryRecord {
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
interface PortalToken {
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
type NotificationChannel = "email" | "sms" | "whatsapp" | "webhook";
interface NotificationPayload {
  channel: NotificationChannel;
  to: string;
  subject?: string;
  body: string;
  htmlBody?: string;
  metadata?: Record<string, string>;
}
//#endregion
//#region src/validation.d.ts
declare function validateFormDefinition(value: unknown): {
  success: true;
  data: FormDefinitionV1;
} | {
  success: false;
  error: string;
};
//#endregion
//#region src/legacy-converter.d.ts
interface ConversionResult {
  form: FormDefinitionV1;
  warnings: string[];
}
declare function convertLegacyEfb(rawArray: unknown, options?: {
  sourceVersion?: string;
  nowIso?: string;
  createdBy?: string;
}): ConversionResult;
//#endregion
//#region src/templates.d.ts
interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  definition: Omit<FormDefinitionV1, "formId" | "meta">;
}
declare function getAllTemplates(): FormTemplate[];
declare function getTemplate(id: string): FormTemplate | undefined;
//#endregion
//#region src/field-registry.d.ts
declare function getFieldMeta(type: FieldType): FieldRegistryRecord | undefined;
/** Groups ordered for the builder palette */
declare function getBuilderGroups(): Array<{
  group: string;
  fields: FieldRegistryRecord[];
}>;
//#endregion
//#region src/notification-engine.d.ts
/**
 * Generate a tracking code in 'date_en_mix' style: YYMMDD + 5 random alphanums.
 * Example: 260418A1B2C
 */
declare function generateTrackingCode(): string;
//#endregion
//#region src/notification-dispatch.d.ts
/**
 * A channel handler sends a notification through a specific channel.
 * Implementations should throw on failure — the dispatcher catches and logs.
 */
type ChannelHandler = (payload: NotificationPayload) => Promise<void>;
/**
 * Register a handler for a notification channel.
 * Only one handler per channel; last registration wins.
 */
declare function registerChannel(channel: NotificationChannel, handler: ChannelHandler): void;
/**
 * Create and register an email channel handler using the plugin's email access.
 * Called once during plugin initialization when ctx.email is available.
 */
declare function registerEmailChannel(emailSend: (msg: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => Promise<void>): void;
interface DispatchOptions {
  /** Logger for errors — defaults to console */
  log?: {
    warn: (msg: string) => void;
    info: (msg: string) => void;
  };
}
/**
 * Dispatch multiple notifications in parallel (fire-and-forget).
 * Errors are logged but never thrown — the caller does not wait for delivery.
 *
 * This is the main entry point for sending notifications after form events.
 */
declare function dispatchAll(payloads: NotificationPayload[], opts?: DispatchOptions): void;
//#endregion
//#region src/index.d.ts
declare function formsBuilderPlugin(): PluginDescriptor;
declare function createPlugin(): ResolvedPlugin;
//#endregion
export { type FormDefinitionV1, type PortalToken, type SubmissionV1, convertLegacyEfb, createPlugin, createPlugin as default, dispatchAll, formsBuilderPlugin, generateTrackingCode, getAllTemplates, getBuilderGroups, getFieldMeta, getTemplate, registerChannel, registerEmailChannel, validateFormDefinition };
//# sourceMappingURL=index.d.mts.map