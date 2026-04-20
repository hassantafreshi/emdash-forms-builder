/**
 * Forms Builder Plugin — Validation
 *
 * Zod-based validators for form definitions, submissions, and API inputs.
 * Following the OWASP-aligned security patterns from AGENTS.md.
 */

import { z } from "zod";

import type {
	FieldType,
	FormDefinitionV1,
	SubmissionV1,
	CreateFormInput,
	ReplyToSubmissionInput,
	UpdateSubmissionStatusInput,
} from "./types.js";

// =============================================================================
// Constants
// =============================================================================

const FIELD_TYPES: FieldType[] = [
	"text",
	"name",
	"password",
	"email",
	"tel",
	"mobile",
	"number",
	"textarea",
	"date",
	"url",
	"hidden",
	"select",
	"multiselect",
	"radio",
	"checkbox",
	"yes_no",
	"toggle",
	"rating",
	"rating_star",
	"five_point",
	"five_point_scale",
	"nps",
	"file",
	"file_upload",
	"signature",
	"location_picker",
	"range",
	"color_picker",
	"prcfld",
	"input_price",
	"ttlprc",
	"total_price",
	"divider",
	"step",
	"group",
];

const CHOICE_FIELD_TYPES = new Set<FieldType>([
	"select",
	"multiselect",
	"radio",
	"checkbox",
	"yes_no",
]);

const MAX_FIELD_COUNT = 100;
const MAX_STEP_COUNT = 20;
const MAX_FORM_NAME_LENGTH = 200;
const MAX_LABEL_LENGTH = 500;
const MAX_OPTION_COUNT = 200;

// =============================================================================
// Field Option
// =============================================================================

const fieldOptionSchema = z.object({
	id: z.string().min(1).max(100),
	label: z.string().min(1).max(200),
	value: z.string().min(1).max(500),
});

// =============================================================================
// Field Style
// =============================================================================

const formFieldStyleSchema = z.object({
	marginTop: z.string().max(50).optional(),
	marginBottom: z.string().max(50).optional(),
	padding: z.string().max(50).optional(),
	borderRadius: z.string().max(50).optional(),
	backgroundColor: z.string().max(50).optional(),
	labelFontSize: z.string().max(50).optional(),
	labelFontWeight: z.string().max(50).optional(),
	inputFontSize: z.string().max(50).optional(),
	placeholderColor: z.string().max(50).optional(),
	borderStyle: z.string().max(50).optional(),
	focusBorderColor: z.string().max(50).optional(),
	errorBorderColor: z.string().max(50).optional(),
});

// =============================================================================
// Field Object
// =============================================================================

const fieldUiSchema = z.object({
	placeholder: z.string().max(500).default(""),
	width: z.enum(["full", "half", "third"]).default("full"),
	labelPosition: z.enum(["top", "left", "hidden"]).default("top"),
	helpText: z.string().max(1000).default(""),
	style: formFieldStyleSchema.optional(),
});

const fieldValidationSchema = z.object({
	required: z.boolean().default(false),
	minLength: z.number().int().min(0).optional(),
	maxLength: z.number().int().min(0).max(50000).optional(),
	min: z.number().optional(),
	max: z.number().optional(),
	pattern: z.string().max(500).optional(),
	format: z.enum(["email", "url", "phone"]).optional(),
	allowedExtensions: z.array(z.string().max(20)).max(50).optional(),
	maxFileSizeMb: z.number().min(0).max(100).optional(),
});

const fieldVisibilitySchema = z.object({
	hidden: z.boolean().default(false),
	disabled: z.boolean().default(false),
});

const logicConditionSchema = z.object({
	fieldId: z.string().min(1).max(100),
	operator: z.enum(["equals", "not_equals", "contains", "is_empty", "is_not_empty"]),
	value: z.string().max(1000),
});

const fieldLogicSchema = z.object({
	conditions: z.array(logicConditionSchema).max(20).default([]),
	action: z.enum(["show", "hide"]).optional(),
	relation: z.enum(["and", "or"]).optional(),
});

const fieldIntegrationsSchema = z.object({
	mapsToNotificationRecipient: z.boolean().default(false),
});

const formFieldSchema = z
	.object({
		id: z.string().regex(/^fld_[a-z0-9_]+$/, "Field ID must start with 'fld_'"),
		type: z.enum(FIELD_TYPES as [FieldType, ...FieldType[]]),
		name: z
			.string()
			.min(1)
			.max(200)
			.regex(/^[a-z][a-z0-9_]*$/, "Field name must be lowercase alphanumeric"),
		label: z.string().min(1).max(MAX_LABEL_LENGTH),
		defaultValue: z.string().max(5000).default(""),
		ui: fieldUiSchema,
		validation: fieldValidationSchema,
		visibility: fieldVisibilitySchema,
		logic: fieldLogicSchema,
		data: z.record(z.string(), z.unknown()).default({}),
		integrations: fieldIntegrationsSchema,
		options: z.array(fieldOptionSchema).max(MAX_OPTION_COUNT).optional(),
	})
	.superRefine((field, ctx) => {
		// Choice types require at least one option
		if (
			CHOICE_FIELD_TYPES.has(field.type as FieldType) &&
			(!field.options || field.options.length === 0)
		) {
			ctx.addIssue(`Field type '${field.type}' requires at least one option`);
		}
	});

// =============================================================================
// Steps
// =============================================================================

const formStepSchema = z.object({
	id: z.string().regex(/^stp_[a-z0-9_]+$/, "Step ID must start with 'stp_'"),
	title: z.string().min(1).max(200),
	order: z.number().int().min(1),
	fields: z.array(z.string()).max(MAX_FIELD_COUNT),
});

// =============================================================================
// Form Definition
// =============================================================================

const trackingConfigSchema = z.object({
	enabled: z.boolean().default(true),
	style: z.enum(["date_en_mix", "sequential", "uuid"]).default("date_en_mix"),
});

const thankYouConfigSchema = z.object({
	mode: z.enum(["message", "redirect"]),
	message: z.string().max(2000).default("Thank you for your submission."),
	includeTrackingCode: z.boolean().default(true),
	redirectUrl: z.string().url().nullable().default(null),
});

const formWorkflowSchema = z.object({
	submissionMode: z.enum(["standard", "survey", "payment", "login"]).default("standard"),
	tracking: trackingConfigSchema,
	thankYou: thankYouConfigSchema,
});

const notificationTemplateSchema = z.object({
	subject: z.string().min(1).max(500),
	body: z.string().max(10000),
});

const formNotificationsSchema = z.object({
	admin: z.object({
		enabled: z.boolean().default(false),
		recipients: z.array(z.string().email()).max(20).default([]),
	}),
	user: z.object({
		enabled: z.boolean().default(false),
		recipientFieldId: z.string().nullable().default(null),
	}),
	template: notificationTemplateSchema,
});

const formIntegrationsSchema = z.object({
	sms: z.object({
		enabled: z.boolean().default(false),
		provider: z.string().nullable().default(null),
		configRef: z.string().nullable().default(null),
	}),
	telegram: z.object({
		enabled: z.boolean().default(false),
		botRef: z.string().nullable().default(null),
		chatRefs: z.array(z.string()).max(10).default([]),
	}),
	payments: z.object({
		enabled: z.boolean().default(false),
		provider: z.string().nullable().default(null),
		currency: z.string().length(3).default("USD"),
	}),
});

// =============================================================================
// Submit Button
// =============================================================================

const formSubmitButtonSchema = z.object({
	label: z.string().max(200),
	size: z.enum(["sm", "md", "lg"]),
	align: z.enum(["left", "center", "right", "full"]),
	variant: z.enum(["filled", "outline", "ghost"]),
	backgroundColor: z.string().max(50).optional(),
	textColor: z.string().max(50).optional(),
	borderRadius: z.string().max(50).optional(),
	borderColor: z.string().max(50).optional(),
	fontSize: z.string().max(50).optional(),
	fontWeight: z.string().max(50).optional(),
	paddingX: z.string().max(50).optional(),
	paddingY: z.string().max(50).optional(),
	loadingText: z.string().max(200).optional(),
	successText: z.string().max(200).optional(),
	showReset: z.boolean().optional(),
	resetLabel: z.string().max(200).optional(),
	customClass: z.string().max(200).optional(),
});

export const formDefinitionV1Schema = z
	.object({
		schemaVersion: z.literal("1.0.0"),
		formId: z.string().regex(/^frm_[a-z0-9]+$/, "Form ID must start with 'frm_'"),
		meta: z.object({
			name: z.string().min(1).max(MAX_FORM_NAME_LENGTH),
			slug: z
				.string()
				.min(1)
				.max(100)
				.regex(/^[a-z][a-z0-9-]*$/, "Slug must be lowercase alphanumeric with hyphens"),
			description: z.string().max(2000).default(""),
			status: z.enum(["draft", "published", "archived"]).default("draft"),
			createdAt: z.string().datetime(),
			updatedAt: z.string().datetime(),
			createdBy: z.string().min(1),
		}),
		ui: z.object({
			theme: z.string().max(100).default("default"),
			layout: z.enum(["single-column", "two-column"]).default("single-column"),
			density: z.enum(["comfortable", "compact"]).default("comfortable"),
		}),
		workflow: formWorkflowSchema,
		notifications: formNotificationsSchema,
		integrations: formIntegrationsSchema,
		steps: z.array(formStepSchema).min(1).max(MAX_STEP_COUNT),
		fields: z.record(z.string(), formFieldSchema),
		submitButton: formSubmitButtonSchema.optional(),
		migrationMeta: z
			.object({
				source: z.literal("easy-form-builder"),
				sourceVersion: z.string(),
				migratedAt: z.string().datetime(),
				warnings: z.array(z.string()),
			})
			.optional(),
	})
	.superRefine((form, ctx) => {
		// Field count limit
		if (Object.keys(form.fields).length > MAX_FIELD_COUNT) {
			ctx.addIssue(`Form may not exceed ${MAX_FIELD_COUNT} fields`);
		}
		// All field refs in steps must resolve to existing fields
		for (const step of form.steps) {
			for (const fieldId of step.fields) {
				if (!(fieldId in form.fields)) {
					ctx.addIssue(`Step '${step.id}' references unknown field '${fieldId}'`);
				}
			}
		}
		// User notification recipientFieldId must be an email field
		const { recipientFieldId } = form.notifications.user;
		if (recipientFieldId !== null) {
			const field = form.fields[recipientFieldId];
			if (!field) {
				ctx.addIssue(`User notification recipientFieldId '${recipientFieldId}' not found`);
			} else if ((field as { type?: string }).type !== "email") {
				ctx.addIssue(`User notification recipientFieldId must reference an email field`);
			}
		}
	});

// =============================================================================
// Submission
// =============================================================================

export const submissionV1Schema = z.object({
	submissionId: z.string().min(1).max(100),
	formId: z.string().min(1).max(100),
	trackingCode: z.string().min(1).max(50),
	status: z.enum(["open", "closed", "read"]).default("open"),
	submittedAt: z.string().datetime(),
	submittedBy: z.object({
		type: z.enum(["guest", "user"]),
		userId: z.string().nullable(),
	}),
	meta: z.object({
		ipHash: z.string().max(128),
		userAgent: z.string().max(500),
		locale: z.string().max(20).default("en-US"),
	}),
	answers: z.array(
		z.object({
			fieldId: z.string().min(1).max(100),
			type: z.enum(FIELD_TYPES as [FieldType, ...FieldType[]]),
			value: z.unknown(),
		}),
	),
	attachments: z.array(z.string()).max(20),
	audit: z.array(
		z.object({
			at: z.string().datetime(),
			event: z.enum(["submitted", "read", "replied", "closed", "exported", "deleted"]),
			actor: z.string().max(100),
		}),
	),
});

// =============================================================================
// API Input Schemas
// =============================================================================

export const createFormInputSchema = z.object({
	name: z.string().min(1).max(MAX_FORM_NAME_LENGTH),
	description: z.string().max(2000).optional(),
	templateId: z.string().optional(),
}) satisfies z.ZodType<CreateFormInput>;

export const updateFormInputSchema = z.object({
	definition: formDefinitionV1Schema,
});

export const submitFormInputSchema = z.object({
	formId: z.string().min(1).max(100),
	answers: z.array(
		z.object({
			fieldId: z.string().min(1).max(100),
			value: z.unknown(),
		}),
	),
	locale: z.string().max(20).optional(),
});

export const replyToSubmissionInputSchema = z.object({
	submissionId: z.string().min(1).max(100),
	body: z.string().min(1).max(10000),
}) satisfies z.ZodType<ReplyToSubmissionInput>;

export const updateSubmissionStatusInputSchema = z.object({
	submissionId: z.string().min(1).max(100),
	status: z.enum(["open", "closed", "read"]),
}) satisfies z.ZodType<UpdateSubmissionStatusInput>;

// =============================================================================
// Validate helpers
// =============================================================================

export function validateFormDefinition(value: unknown):
	| {
			success: true;
			data: FormDefinitionV1;
	  }
	| {
			success: false;
			error: string;
	  } {
	const result = formDefinitionV1Schema.safeParse(value);
	if (result.success) return { success: true, data: result.data as FormDefinitionV1 };
	return { success: false, error: result.error.issues.map((i) => i.message).join("; ") };
}

export function validateSubmission(value: unknown):
	| {
			success: true;
			data: SubmissionV1;
	  }
	| {
			success: false;
			error: string;
	  } {
	const result = submissionV1Schema.safeParse(value);
	if (result.success) return { success: true, data: result.data as SubmissionV1 };
	return { success: false, error: result.error.issues.map((i) => i.message).join("; ") };
}
