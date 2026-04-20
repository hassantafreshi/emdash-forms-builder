/**
 * Forms Builder Plugin — Starter Templates
 *
 * Pre-built form templates displayed on the Create New Form landing page.
 * Migrated/rewritten from legacy forms-efb.js template library.
 * Section F.2 + C.1 of the EFB implementation spec.
 */

import type { FormDefinitionV1 } from "./types.js";
import { SCHEMA_VERSION } from "./types.js";

// =============================================================================
// Template catalog
// =============================================================================

export interface FormTemplate {
	id: string;
	name: string;
	description: string;
	category: string;
	icon: string;
	definition: Omit<FormDefinitionV1, "formId" | "meta">;
}

// ── Contact Form ──────────────────────────────────────────────────────────────

const contactForm: FormTemplate = {
	id: "tpl_contact",
	name: "Contact Form",
	description: "Simple contact form with name, email, and message.",
	category: "General",
	icon: "envelope",
	definition: {
		schemaVersion: SCHEMA_VERSION,
		ui: { theme: "default", layout: "single-column", density: "comfortable" },
		workflow: {
			submissionMode: "standard",
			tracking: { enabled: true, style: "date_en_mix" },
			thankYou: {
				mode: "message",
				message: "Thank you for reaching out! We will get back to you soon.",
				includeTrackingCode: true,
				redirectUrl: null,
			},
		},
		notifications: {
			admin: {
				enabled: true,
				recipients: [],
			},
			user: {
				enabled: true,
				recipientFieldId: "fld_contact_email",
			},
			template: {
				subject: "[website_name] New contact form submission [confirmation_code]",
				body: "Hello,\n\nA new contact form submission was received.\n\nTracking code: [confirmation_code]\n\nView submission: [link_response]",
			},
		},
		integrations: {
			sms: { enabled: false, provider: null, configRef: null },
			telegram: { enabled: false, botRef: null, chatRefs: [] },
			payments: { enabled: false, provider: null, currency: "USD" },
		},
		steps: [
			{
				id: "stp_contact_step1",
				title: "Contact",
				order: 1,
				fields: ["fld_contact_name", "fld_contact_email", "fld_contact_message"],
			},
		],
		fields: {
			fld_contact_name: {
				id: "fld_contact_name",
				type: "name",
				name: "name",
				label: "Name",
				defaultValue: "",
				ui: {
					placeholder: "Your full name",
					width: "full",
					labelPosition: "top",
					helpText: "",
				},
				validation: { required: true, minLength: 1, maxLength: 120 },
				visibility: { hidden: false, disabled: false },
				logic: { conditions: [] },
				data: {},
				integrations: { mapsToNotificationRecipient: false },
			},
			fld_contact_email: {
				id: "fld_contact_email",
				type: "email",
				name: "email",
				label: "Email",
				defaultValue: "",
				ui: {
					placeholder: "you@example.com",
					width: "full",
					labelPosition: "top",
					helpText: "",
				},
				validation: { required: true, format: "email" },
				visibility: { hidden: false, disabled: false },
				logic: { conditions: [] },
				data: {},
				integrations: { mapsToNotificationRecipient: true },
			},
			fld_contact_message: {
				id: "fld_contact_message",
				type: "textarea",
				name: "message",
				label: "Message",
				defaultValue: "",
				ui: {
					placeholder: "How can we help you?",
					width: "full",
					labelPosition: "top",
					helpText: "",
				},
				validation: { required: true, minLength: 10, maxLength: 5000 },
				visibility: { hidden: false, disabled: false },
				logic: { conditions: [] },
				data: {},
				integrations: { mapsToNotificationRecipient: false },
			},
		},
	},
};

// ── Support Ticket ────────────────────────────────────────────────────────────

const supportTicketForm: FormTemplate = {
	id: "tpl_support",
	name: "Support Ticket",
	description: "Capture support requests with priority and subject.",
	category: "Support",
	icon: "lifebuoy",
	definition: {
		schemaVersion: SCHEMA_VERSION,
		ui: { theme: "default", layout: "single-column", density: "comfortable" },
		workflow: {
			submissionMode: "standard",
			tracking: { enabled: true, style: "date_en_mix" },
			thankYou: {
				mode: "message",
				message:
					"Your support ticket has been received. Use tracking code [confirmation_code] to follow up.",
				includeTrackingCode: true,
				redirectUrl: null,
			},
		},
		notifications: {
			admin: { enabled: true, recipients: [] },
			user: { enabled: true, recipientFieldId: "fld_support_email" },
			template: {
				subject: "[website_name] Support ticket [confirmation_code] received",
				body: "Your support request has been logged.\nTracking code: [confirmation_code]\nView: [link_response]",
			},
		},
		integrations: {
			sms: { enabled: false, provider: null, configRef: null },
			telegram: { enabled: false, botRef: null, chatRefs: [] },
			payments: { enabled: false, provider: null, currency: "USD" },
		},
		steps: [
			{
				id: "stp_support_step1",
				title: "Ticket Details",
				order: 1,
				fields: [
					"fld_support_name",
					"fld_support_email",
					"fld_support_priority",
					"fld_support_subject",
					"fld_support_description",
				],
			},
		],
		fields: {
			fld_support_name: {
				id: "fld_support_name",
				type: "name",
				name: "name",
				label: "Your Name",
				defaultValue: "",
				ui: {
					placeholder: "Your full name",
					width: "full",
					labelPosition: "top",
					helpText: "",
				},
				validation: { required: true, maxLength: 120 },
				visibility: { hidden: false, disabled: false },
				logic: { conditions: [] },
				data: {},
				integrations: { mapsToNotificationRecipient: false },
			},
			fld_support_email: {
				id: "fld_support_email",
				type: "email",
				name: "email",
				label: "Email",
				defaultValue: "",
				ui: {
					placeholder: "you@example.com",
					width: "full",
					labelPosition: "top",
					helpText: "We will reply to this address",
				},
				validation: { required: true, format: "email" },
				visibility: { hidden: false, disabled: false },
				logic: { conditions: [] },
				data: {},
				integrations: { mapsToNotificationRecipient: true },
			},
			fld_support_priority: {
				id: "fld_support_priority",
				type: "select",
				name: "priority",
				label: "Priority",
				defaultValue: "normal",
				ui: {
					placeholder: "Select priority",
					width: "half",
					labelPosition: "top",
					helpText: "",
				},
				validation: { required: true },
				visibility: { hidden: false, disabled: false },
				logic: { conditions: [] },
				data: {},
				integrations: { mapsToNotificationRecipient: false },
				options: [
					{ id: "opt_priority_low", label: "Low", value: "low" },
					{ id: "opt_priority_normal", label: "Normal", value: "normal" },
					{ id: "opt_priority_high", label: "High", value: "high" },
					{ id: "opt_priority_urgent", label: "Urgent", value: "urgent" },
				],
			},
			fld_support_subject: {
				id: "fld_support_subject",
				type: "text",
				name: "subject",
				label: "Subject",
				defaultValue: "",
				ui: {
					placeholder: "Brief description of the issue",
					width: "full",
					labelPosition: "top",
					helpText: "",
				},
				validation: { required: true, maxLength: 300 },
				visibility: { hidden: false, disabled: false },
				logic: { conditions: [] },
				data: {},
				integrations: { mapsToNotificationRecipient: false },
			},
			fld_support_description: {
				id: "fld_support_description",
				type: "textarea",
				name: "description",
				label: "Description",
				defaultValue: "",
				ui: {
					placeholder: "Detailed description of the issue",
					width: "full",
					labelPosition: "top",
					helpText: "",
				},
				validation: { required: true, minLength: 20, maxLength: 10000 },
				visibility: { hidden: false, disabled: false },
				logic: { conditions: [] },
				data: {},
				integrations: { mapsToNotificationRecipient: false },
			},
		},
	},
};

// ── Customer Satisfaction Survey ──────────────────────────────────────────────

const satisfactionSurvey: FormTemplate = {
	id: "tpl_satisfaction",
	name: "Customer Satisfaction",
	description: "Rate your experience with a star rating and comment.",
	category: "Survey",
	icon: "star",
	definition: {
		schemaVersion: SCHEMA_VERSION,
		ui: { theme: "default", layout: "single-column", density: "comfortable" },
		workflow: {
			submissionMode: "survey",
			tracking: { enabled: true, style: "date_en_mix" },
			thankYou: {
				mode: "message",
				message: "Thank you for your feedback! It helps us improve.",
				includeTrackingCode: false,
				redirectUrl: null,
			},
		},
		notifications: {
			admin: { enabled: true, recipients: [] },
			user: { enabled: false, recipientFieldId: null },
			template: {
				subject: "[website_name] New satisfaction survey [confirmation_code]",
				body: "A new satisfaction survey was submitted. Rating: [field:rating]\nView: [link_response]",
			},
		},
		integrations: {
			sms: { enabled: false, provider: null, configRef: null },
			telegram: { enabled: false, botRef: null, chatRefs: [] },
			payments: { enabled: false, provider: null, currency: "USD" },
		},
		steps: [
			{
				id: "stp_satisfaction_step1",
				title: "Your Experience",
				order: 1,
				fields: ["fld_survey_rating", "fld_survey_recommend", "fld_survey_comment"],
			},
		],
		fields: {
			fld_survey_rating: {
				id: "fld_survey_rating",
				type: "rating_star",
				name: "rating",
				label: "Overall Rating",
				defaultValue: "",
				ui: {
					placeholder: "",
					width: "full",
					labelPosition: "top",
					helpText: "Rate your overall experience",
				},
				validation: { required: true },
				visibility: { hidden: false, disabled: false },
				logic: { conditions: [] },
				data: {},
				integrations: { mapsToNotificationRecipient: false },
			},
			fld_survey_recommend: {
				id: "fld_survey_recommend",
				type: "nps",
				name: "recommend",
				label: "How likely are you to recommend us?",
				defaultValue: "",
				ui: {
					placeholder: "",
					width: "full",
					labelPosition: "top",
					helpText: "0 = Not at all, 10 = Extremely likely",
				},
				validation: { required: false },
				visibility: { hidden: false, disabled: false },
				logic: { conditions: [] },
				data: {},
				integrations: { mapsToNotificationRecipient: false },
			},
			fld_survey_comment: {
				id: "fld_survey_comment",
				type: "textarea",
				name: "comment",
				label: "Additional Comments",
				defaultValue: "",
				ui: {
					placeholder: "Any other thoughts?",
					width: "full",
					labelPosition: "top",
					helpText: "",
				},
				validation: { required: false, maxLength: 2000 },
				visibility: { hidden: false, disabled: false },
				logic: { conditions: [] },
				data: {},
				integrations: { mapsToNotificationRecipient: false },
			},
		},
	},
};

// ── Blank Form ────────────────────────────────────────────────────────────────

const blankForm: FormTemplate = {
	id: "tpl_blank",
	name: "Blank Form",
	description: "Start from scratch with an empty form.",
	category: "General",
	icon: "file-plus",
	definition: {
		schemaVersion: SCHEMA_VERSION,
		ui: { theme: "default", layout: "single-column", density: "comfortable" },
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
			admin: { enabled: false, recipients: [] },
			user: { enabled: false, recipientFieldId: null },
			template: {
				subject: "[website_name] New submission [confirmation_code]",
				body: "A new submission was received. [link_response]",
			},
		},
		integrations: {
			sms: { enabled: false, provider: null, configRef: null },
			telegram: { enabled: false, botRef: null, chatRefs: [] },
			payments: { enabled: false, provider: null, currency: "USD" },
		},
		steps: [
			{
				id: "stp_blank_step1",
				title: "Step 1",
				order: 1,
				fields: [],
			},
		],
		fields: {},
	},
};

// =============================================================================
// Template registry
// =============================================================================

const ALL_TEMPLATES: FormTemplate[] = [
	blankForm,
	contactForm,
	supportTicketForm,
	satisfactionSurvey,
];

export function getAllTemplates(): FormTemplate[] {
	return ALL_TEMPLATES;
}

export function getTemplate(id: string): FormTemplate | undefined {
	return ALL_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(): Array<{
	category: string;
	templates: FormTemplate[];
}> {
	const map = new Map<string, FormTemplate[]>();
	for (const t of ALL_TEMPLATES) {
		const bucket = map.get(t.category) ?? [];
		bucket.push(t);
		map.set(t.category, bucket);
	}
	return Array.from(map.entries(), ([category, templates]) => ({
		category,
		templates,
	}));
}
