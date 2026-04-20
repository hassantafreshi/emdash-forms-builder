import { definePlugin } from "emdash";
import { z } from "zod";
import { ulid } from "ulidx";

//#region src/field-registry.ts
const REGISTRY = [
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
			validation: [
				"minLength",
				"maxLength",
				"pattern"
			],
			conditionalLogic: true,
			computedValue: false,
			options: false,
			multiple: false
		},
		builder: {
			displayName: "Text",
			icon: "text-t",
			group: "Basic Fields"
		}
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
			multiple: false
		},
		builder: {
			displayName: "Name",
			icon: "user",
			group: "Basic Fields"
		}
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
			multiple: false
		},
		builder: {
			displayName: "Email",
			icon: "envelope",
			group: "Basic Fields"
		}
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
			multiple: false
		},
		builder: {
			displayName: "Phone",
			icon: "phone",
			group: "Basic Fields"
		}
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
			multiple: false
		},
		builder: {
			displayName: "Mobile",
			icon: "device-mobile",
			group: "Basic Fields"
		}
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
			multiple: false
		},
		builder: {
			displayName: "Number",
			icon: "hash",
			group: "Basic Fields"
		}
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
			multiple: false
		},
		builder: {
			displayName: "Long Text",
			icon: "text-align-left",
			group: "Basic Fields"
		}
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
			multiple: false
		},
		builder: {
			displayName: "Date",
			icon: "calendar",
			group: "Basic Fields"
		}
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
			validation: [
				"minLength",
				"maxLength",
				"pattern"
			],
			conditionalLogic: false,
			computedValue: false,
			options: false,
			multiple: false
		},
		builder: {
			displayName: "Password",
			icon: "lock",
			group: "Basic Fields"
		}
	},
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
			multiple: false
		},
		builder: {
			displayName: "Dropdown",
			icon: "caret-down",
			group: "Choice Fields"
		}
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
			multiple: true
		},
		builder: {
			displayName: "Multi-select",
			icon: "list-checks",
			group: "Choice Fields"
		}
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
			multiple: false
		},
		builder: {
			displayName: "Radio",
			icon: "radio-button",
			group: "Choice Fields"
		}
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
			multiple: true
		},
		builder: {
			displayName: "Checkbox",
			icon: "check-square",
			group: "Choice Fields"
		}
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
			multiple: false
		},
		builder: {
			displayName: "Yes / No",
			icon: "toggle-left",
			group: "Choice Fields"
		}
	},
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
			multiple: false
		},
		builder: {
			displayName: "Star Rating",
			icon: "star",
			group: "Survey Fields"
		}
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
			multiple: false
		},
		builder: {
			displayName: "5-Point Scale",
			icon: "chart-bar",
			group: "Survey Fields"
		}
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
			multiple: false
		},
		builder: {
			displayName: "NPS Score",
			icon: "gauge",
			group: "Survey Fields"
		}
	},
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
			multiple: false
		},
		builder: {
			displayName: "File Upload",
			icon: "upload",
			group: "Advanced"
		}
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
			multiple: false
		},
		builder: {
			displayName: "Signature",
			icon: "pen-nib",
			group: "Advanced"
		}
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
			multiple: false
		},
		builder: {
			displayName: "Location",
			icon: "map-pin",
			group: "Advanced"
		}
	},
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
			multiple: false
		},
		builder: {
			displayName: "Price Input",
			icon: "currency-dollar",
			group: "Commerce"
		}
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
			multiple: false
		},
		builder: {
			displayName: "Total Price",
			icon: "receipt",
			group: "Commerce"
		}
	},
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
			multiple: false
		},
		builder: {
			displayName: "Step",
			icon: "rows",
			group: "Layout"
		}
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
			multiple: false
		},
		builder: {
			displayName: "Field Group",
			icon: "arrows-left-right",
			group: "Layout"
		}
	}
];
const _byType = new Map(REGISTRY.map((r) => [r.type, r]));
function getFieldMeta(type) {
	return _byType.get(type);
}
function isKnownFieldType(type) {
	return _byType.has(type);
}
/** Groups ordered for the builder palette */
function getBuilderGroups() {
	const groups = /* @__PURE__ */ new Map();
	for (const field of REGISTRY) {
		let bucket = groups.get(field.builder.group);
		if (!bucket) {
			bucket = [];
			groups.set(field.builder.group, bucket);
		}
		bucket.push(field);
	}
	return Array.from(groups.entries(), ([group, fields]) => ({
		group,
		fields
	}));
}

//#endregion
//#region src/types.ts
/**
* Forms Builder Plugin — Domain Contracts
*
* Normalized form/field/submission/notification schemas for EFB migration.
* Designed per Section I of the EFB implementation spec.
*/
const SCHEMA_VERSION = "1.0.0";

//#endregion
//#region src/legacy-converter.ts
/**
* Forms Builder Plugin — Legacy EFB Converter
*
* Migrates the legacy Easy Form Builder flat-array JSON format to FormDefinitionV1.
* Section I.7 of the EFB implementation spec.
*
* Security: no eval, no dynamic SQL, no arbitrary code execution.
* All identifiers are validated and sanitized before use.
*/
const LEGACY_TYPE_MAP = {
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
	password: "password"
};
function toBool(val) {
	if (typeof val === "boolean") return val;
	if (val === "1" || val === "true" || val === 1) return true;
	return false;
}
function toStr(val) {
	if (val === null || val === void 0) return "";
	if (typeof val === "string") return val;
	if (typeof val === "number" || typeof val === "boolean" || typeof val === "bigint") return String(val);
	if (typeof val === "object") return JSON.stringify(val);
	return "";
}
function toInt(val) {
	const n = Number(val);
	return isNaN(n) ? void 0 : Math.floor(n);
}
const SAFE_NAME_CLEAN = /[^a-z0-9]+/g;
const SAFE_NAME_TRIM = /^_+|_+$/g;
const SLUGIFY_CLEAN = /[^a-z0-9]+/g;
const SLUGIFY_TRIM = /^-+|-+$/g;
const EMAIL_QUICK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function safeName(label) {
	return label.toLowerCase().replace(SAFE_NAME_CLEAN, "_").replace(SAFE_NAME_TRIM, "").slice(0, 60) || "field";
}
function slugify(name) {
	return name.toLowerCase().replace(SLUGIFY_CLEAN, "-").replace(SLUGIFY_TRIM, "").slice(0, 100) || "untitled-form";
}
/** Generate a deterministic-looking prefix-based ID */
function makeId(prefix) {
	return `${prefix}${ulid().toLowerCase()}`;
}
function convertLegacyEfb(rawArray, options = {}) {
	const warnings = [];
	const now = options.nowIso ?? (/* @__PURE__ */ new Date()).toISOString();
	const sourceVersion = options.sourceVersion ?? "unknown";
	const createdBy = options.createdBy ?? "system";
	if (!Array.isArray(rawArray) || rawArray.length === 0) throw new Error("Legacy EFB input must be a non-empty array");
	const items = rawArray;
	const formItem = items[0];
	if (!formItem) throw new Error("Input array is empty — no form item found");
	const stepItems = [];
	const fieldItems = [];
	const optionItems = [];
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const t = toStr(item.type).toLowerCase();
		if (i === 0) continue;
		if (t === "step") stepItems.push(item);
		else if (t === "option") optionItems.push(item);
		else if (t in LEGACY_TYPE_MAP || isKnownFieldType(t)) fieldItems.push(item);
		else warnings.push(`Unknown item type '${t}' at index ${i} — skipped`);
	}
	/** legacy id_ → canonical fld_ id */
	const fieldIdMap = /* @__PURE__ */ new Map();
	/** legacy id_ → canonical stp_ id */
	const stepIdMap = /* @__PURE__ */ new Map();
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
	const optionsByParent = /* @__PURE__ */ new Map();
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
			value: toStr(opt.value || opt.label || opt.title)
		});
		optionsByParent.set(targetFieldId, list);
	}
	const fieldObjects = {};
	const nameTracker = /* @__PURE__ */ new Map();
	for (const legacy of fieldItems) {
		const legacyId = toStr(legacy.id_);
		const canonicalId = fieldIdMap.get(legacyId);
		const rawType = toStr(legacy.type).toLowerCase();
		const canonicalType = LEGACY_TYPE_MAP[rawType] ?? "text";
		if (!LEGACY_TYPE_MAP[rawType]) warnings.push(`Field type '${rawType}' not in type map — defaulting to 'text'`);
		const rawLabel = toStr(legacy.title || legacy.label || rawType);
		let baseName = safeName(rawLabel);
		const count = nameTracker.get(baseName) ?? 0;
		const finalName = count === 0 ? baseName : `${baseName}_${count}`;
		nameTracker.set(baseName, count + 1);
		const ui = {
			placeholder: toStr(legacy.placeholder),
			width: legacy.width === "half" ? "half" : legacy.width === "third" ? "third" : "full",
			labelPosition: "top",
			helpText: toStr(legacy.hint)
		};
		const validation = { required: toBool(legacy.required) };
		const minLen = toInt(legacy.milen);
		if (minLen !== void 0) validation.minLength = minLen;
		const maxLen = toInt(legacy.mlen);
		if (maxLen !== void 0) validation.maxLength = maxLen;
		if (canonicalType === "email") validation.format = "email";
		const field = {
			id: canonicalId,
			type: canonicalType,
			name: finalName,
			label: rawLabel,
			defaultValue: toStr(legacy.value),
			ui,
			validation,
			visibility: {
				hidden: toBool(legacy.hiden),
				disabled: toBool(legacy.disable)
			},
			logic: { conditions: [] },
			data: {},
			integrations: { mapsToNotificationRecipient: canonicalType === "email" }
		};
		const opts = optionsByParent.get(canonicalId);
		if (opts && opts.length > 0) field.options = opts;
		fieldObjects[canonicalId] = field;
	}
	let steps;
	if (stepItems.length === 0) steps = [{
		id: makeId("stp_"),
		title: "Step 1",
		order: 1,
		fields: Object.keys(fieldObjects)
	}];
	else {
		const stepFieldMap = /* @__PURE__ */ new Map();
		for (const step of stepItems) {
			const canonicalStepId = stepIdMap.get(toStr(step.id_));
			stepFieldMap.set(canonicalStepId, []);
		}
		const firstStepId = stepIdMap.values().next().value;
		for (const legacy of fieldItems) {
			const legacyId = toStr(legacy.id_);
			const canonicalFieldId = fieldIdMap.get(legacyId);
			const legacyStepIndex = toInt(legacy.step);
			let assignedStep;
			if (legacyStepIndex !== void 0) {
				const stepEntry = stepItems[legacyStepIndex - 1];
				if (stepEntry) assignedStep = stepIdMap.get(toStr(stepEntry.id_));
			}
			const targetStepId = assignedStep ?? firstStepId;
			if (targetStepId) {
				const list = stepFieldMap.get(targetStepId) ?? [];
				list.push(canonicalFieldId);
				stepFieldMap.set(targetStepId, list);
			}
		}
		steps = stepItems.map((s, idx) => {
			const canonicalStepId = stepIdMap.get(toStr(s.id_));
			return {
				id: canonicalStepId,
				title: toStr(s.title || `Step ${idx + 1}`),
				order: idx + 1,
				fields: stepFieldMap.get(canonicalStepId) ?? []
			};
		});
	}
	if (steps.length === 0) {
		warnings.push("No steps found — creating default step");
		steps = [{
			id: makeId("stp_"),
			title: "Step 1",
			order: 1,
			fields: Object.keys(fieldObjects)
		}];
	}
	const formName = toStr(formItem.form_name || formItem.title || "Imported Form");
	const rawSlug = toStr(formItem.form_slug || formName);
	const adminEmailEnabled = toBool(formItem.email_admin);
	const rawAdminEmail = toStr(formItem.admin_email);
	const adminRecipients = rawAdminEmail ? rawAdminEmail.split(",").map((e) => e.trim()).filter((e) => EMAIL_QUICK.test(e)) : [];
	const userEmailEnabled = toBool(formItem.email_user);
	const legacyUserEmailFieldId = toStr(formItem.user_email_field);
	const userRecipientFieldId = legacyUserEmailFieldId ? fieldIdMap.get(legacyUserEmailFieldId) ?? null : null;
	const migrationMeta = {
		source: "easy-form-builder",
		sourceVersion,
		migratedAt: now,
		warnings
	};
	return {
		form: {
			schemaVersion: SCHEMA_VERSION,
			formId: makeId("frm_"),
			meta: {
				name: formName,
				slug: slugify(rawSlug),
				description: "",
				status: "draft",
				createdAt: now,
				updatedAt: now,
				createdBy
			},
			ui: {
				theme: "default",
				layout: "single-column",
				density: "comfortable"
			},
			workflow: {
				submissionMode: "standard",
				tracking: {
					enabled: true,
					style: "date_en_mix"
				},
				thankYou: {
					mode: "message",
					message: "Thank you for your submission.",
					includeTrackingCode: true,
					redirectUrl: null
				}
			},
			notifications: {
				admin: {
					enabled: adminEmailEnabled,
					recipients: adminRecipients
				},
				user: {
					enabled: userEmailEnabled,
					recipientFieldId: userRecipientFieldId
				},
				template: {
					subject: toStr(formItem.subject || "[website_name] New submission [confirmation_code]"),
					body: toStr(formItem.message || "A new form submission has been received. [link_response]")
				}
			},
			integrations: {
				sms: {
					enabled: false,
					provider: null,
					configRef: null
				},
				telegram: {
					enabled: false,
					botRef: null,
					chatRefs: []
				},
				payments: {
					enabled: false,
					provider: null,
					currency: "USD"
				}
			},
			steps,
			fields: fieldObjects,
			migrationMeta
		},
		warnings
	};
}

//#endregion
//#region src/notification-dispatch.ts
const channelHandlers = /* @__PURE__ */ new Map();
/**
* Register a handler for a notification channel.
* Only one handler per channel; last registration wins.
*/
function registerChannel(channel, handler) {
	channelHandlers.set(channel, handler);
}
/**
* Create and register an email channel handler using the plugin's email access.
* Called once during plugin initialization when ctx.email is available.
*/
function registerEmailChannel(emailSend) {
	registerChannel("email", async (payload) => {
		await emailSend({
			to: payload.to,
			subject: payload.subject ?? "",
			text: payload.body,
			html: payload.htmlBody
		});
	});
}
/**
* Dispatch a single notification. Returns the result synchronously.
*/
async function dispatchNotification(payload, opts) {
	const log = opts?.log ?? console;
	const handler = channelHandlers.get(payload.channel);
	if (!handler) {
		const msg = `No handler registered for channel: ${payload.channel}`;
		log.warn(msg);
		return {
			channel: payload.channel,
			success: false,
			error: msg
		};
	}
	try {
		await handler(payload);
		return {
			channel: payload.channel,
			success: true
		};
	} catch (err) {
		const errMsg = err instanceof Error ? err.message : String(err);
		log.warn(`Notification dispatch failed [${payload.channel}]: ${errMsg}`);
		return {
			channel: payload.channel,
			success: false,
			error: errMsg
		};
	}
}
/**
* Dispatch multiple notifications in parallel (fire-and-forget).
* Errors are logged but never thrown — the caller does not wait for delivery.
*
* This is the main entry point for sending notifications after form events.
*/
function dispatchAll(payloads, opts) {
	if (payloads.length === 0) return;
	Promise.allSettled(payloads.map((p) => dispatchNotification(p, opts)));
}

//#endregion
//#region src/notification-engine.ts
/**
* Generate a tracking code in 'date_en_mix' style: YYMMDD + 5 random alphanums.
* Example: 260418A1B2C
*/
function generateTrackingCode() {
	const d = /* @__PURE__ */ new Date();
	const yy = String(d.getUTCFullYear()).slice(-2);
	const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
	const dd = String(d.getUTCDate()).padStart(2, "0");
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let suffix = "";
	const bytes = crypto.getRandomValues(new Uint8Array(5));
	for (const b of bytes) suffix += chars[b % 32];
	return `${yy}${mm}${dd}${suffix}`;
}

//#endregion
//#region src/sanitize.ts
/** HTML entity map for escaping dangerous characters. */
const HTML_ESCAPE_MAP = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#x27;",
	"/": "&#x2F;",
	"`": "&#96;"
};
const HTML_ESCAPE_RE = /[&<>"'`/]/g;
/** Escape HTML entities to prevent XSS. */
function escapeHtml(input) {
	return input.replace(HTML_ESCAPE_RE, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}
/** Strip all HTML tags from a string. */
function stripHtml(input) {
	return input.replace(/<[^>]*>/g, "");
}
/**
* Remove dangerous patterns:
* - `javascript:` / `vbscript:` / `data:` URIs
* - `on*` event attributes
* - Control characters (except \t \n \r)
*/
function stripDangerousContent(input) {
	let s = input;
	s = s.replace(/\b(javascript|vbscript|data)\s*:/gi, "");
	s = s.replace(/\bon[a-z]+\s*=/gi, "");
	s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
	return s;
}
/**
* RFC 5322 simplified email regex.
* Allows standard email addresses; does not allow IP literals.
*/
const EMAIL_RE$1 = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
/** E.164-ish phone: optional +, digits, spaces, hyphens, parens. 7-20 chars of digits. */
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
/** Digits only for phone (used to count digit length). */
const PHONE_DIGITS_RE = /\d/g;
function isValidEmail(value) {
	if (value.length > 254) return false;
	return EMAIL_RE$1.test(value);
}
function isValidPhone(value) {
	if (!PHONE_RE.test(value)) return false;
	const digits = value.match(PHONE_DIGITS_RE);
	return digits !== null && digits.length >= 7 && digits.length <= 15;
}
function isValidDate(value) {
	const d = new Date(value);
	return !isNaN(d.getTime());
}
/**
* Sanitize a text value: trim, strip HTML, escape entities, enforce length.
*/
function sanitizeText(input, options = {}) {
	const { maxLength = 1e4, minLength = 0, stripTags = true, escapeEntities = false, trim = true, pattern, patternMessage } = options;
	if (input === null || input === void 0) return {
		success: true,
		value: ""
	};
	if (typeof input !== "string") return {
		success: false,
		error: {
			code: "INVALID_TYPE",
			message: "Expected a text value"
		}
	};
	let value = input;
	if (trim) value = value.trim();
	value = stripDangerousContent(value);
	if (stripTags) value = stripHtml(value);
	if (escapeEntities) value = escapeHtml(value);
	if (value.length < minLength) return {
		success: false,
		error: {
			code: "TOO_SHORT",
			message: `Must be at least ${minLength} characters`
		}
	};
	if (value.length > maxLength) return {
		success: false,
		error: {
			code: "TOO_LONG",
			message: `Must be at most ${maxLength} characters`
		}
	};
	if (pattern && !pattern.test(value)) return {
		success: false,
		error: {
			code: "INVALID_PATTERN",
			message: patternMessage ?? "Invalid format"
		}
	};
	return {
		success: true,
		value
	};
}
/**
* Sanitize and validate a single field value based on its FieldType.
* Returns a discriminated union: `{ success, value }` or `{ success: false, error }`.
*/
function sanitizeFieldValue(fieldType, value, options = {}) {
	if (value === null || value === void 0 || value === "") {
		if (options.required) return {
			success: false,
			error: {
				code: "REQUIRED",
				message: "This field is required"
			}
		};
		return {
			success: true,
			value: fieldType === "number" ? null : ""
		};
	}
	switch (fieldType) {
		case "email": return sanitizeEmail(value, options);
		case "tel":
		case "mobile": return sanitizePhone(value, options);
		case "number":
		case "input_price":
		case "total_price": return sanitizeNumber(value, options);
		case "date": return sanitizeDateValue(value);
		case "textarea": return sanitizeText(value, {
			maxLength: options.maxLength ?? 5e4,
			minLength: options.minLength,
			stripTags: true
		});
		case "password": return sanitizeText(value, {
			maxLength: options.maxLength ?? 200,
			minLength: options.minLength ?? 1,
			stripTags: false,
			escapeEntities: true
		});
		case "select":
		case "radio":
		case "yes_no": return sanitizeChoice(value, options);
		case "multiselect":
		case "checkbox": return sanitizeMultiChoice(value, options);
		case "rating_star":
		case "five_point_scale": return sanitizeRating(value, fieldType);
		case "nps": return sanitizeNps(value);
		default: return sanitizeText(value, {
			maxLength: options.maxLength ?? 1e3,
			minLength: options.minLength,
			pattern: options.pattern ? new RegExp(options.pattern) : void 0
		});
	}
}
function sanitizeEmail(value, options) {
	if (typeof value !== "string") return {
		success: false,
		error: {
			code: "INVALID_TYPE",
			message: "Expected a text value"
		}
	};
	const trimmed = value.trim().toLowerCase();
	if (trimmed.length > 254) return {
		success: false,
		error: {
			code: "TOO_LONG",
			message: "Email must be at most 254 characters"
		}
	};
	const cleaned = stripDangerousContent(trimmed);
	if (!isValidEmail(cleaned)) return {
		success: false,
		error: {
			code: "INVALID_EMAIL",
			message: "Invalid email address"
		}
	};
	if (options.maxLength && cleaned.length > options.maxLength) return {
		success: false,
		error: {
			code: "TOO_LONG",
			message: `Must be at most ${options.maxLength} characters`
		}
	};
	return {
		success: true,
		value: cleaned
	};
}
function sanitizePhone(value, options) {
	if (typeof value !== "string") return {
		success: false,
		error: {
			code: "INVALID_TYPE",
			message: "Expected a text value"
		}
	};
	const cleaned = stripDangerousContent(stripHtml(value.trim()));
	if (!isValidPhone(cleaned)) return {
		success: false,
		error: {
			code: "INVALID_PHONE",
			message: "Invalid phone number"
		}
	};
	if (options.maxLength && cleaned.length > options.maxLength) return {
		success: false,
		error: {
			code: "TOO_LONG",
			message: `Must be at most ${options.maxLength} characters`
		}
	};
	return {
		success: true,
		value: cleaned
	};
}
function sanitizeNumber(value, options) {
	let num;
	if (typeof value === "number") num = value;
	else if (typeof value === "string") num = Number(value.trim());
	else return {
		success: false,
		error: {
			code: "INVALID_TYPE",
			message: "Expected a numeric value"
		}
	};
	if (isNaN(num) || !isFinite(num)) return {
		success: false,
		error: {
			code: "INVALID_NUMBER",
			message: "Invalid number"
		}
	};
	if (options.min !== void 0 && num < options.min) return {
		success: false,
		error: {
			code: "OUT_OF_RANGE",
			message: `Must be at least ${options.min}`
		}
	};
	if (options.max !== void 0 && num > options.max) return {
		success: false,
		error: {
			code: "OUT_OF_RANGE",
			message: `Must be at most ${options.max}`
		}
	};
	return {
		success: true,
		value: num
	};
}
function sanitizeDateValue(value) {
	if (typeof value !== "string") return {
		success: false,
		error: {
			code: "INVALID_TYPE",
			message: "Expected a date string"
		}
	};
	const trimmed = value.trim();
	if (!isValidDate(trimmed)) return {
		success: false,
		error: {
			code: "INVALID_DATE",
			message: "Invalid date"
		}
	};
	return {
		success: true,
		value: new Date(trimmed).toISOString()
	};
}
function sanitizeChoice(value, options) {
	if (typeof value !== "string") return {
		success: false,
		error: {
			code: "INVALID_TYPE",
			message: "Expected a text value"
		}
	};
	const cleaned = stripDangerousContent(stripHtml(value.trim()));
	if (options.allowedValues && !options.allowedValues.includes(cleaned)) return {
		success: false,
		error: {
			code: "INVALID_OPTION",
			message: "Selected value is not a valid option"
		}
	};
	return {
		success: true,
		value: cleaned
	};
}
function sanitizeMultiChoice(value, options) {
	const values = Array.isArray(value) ? value : typeof value === "string" ? [value] : null;
	if (!values) return {
		success: false,
		error: {
			code: "INVALID_TYPE",
			message: "Expected an array of values"
		}
	};
	const cleaned = [];
	for (const v of values) {
		if (typeof v !== "string") return {
			success: false,
			error: {
				code: "INVALID_TYPE",
				message: "Each selected value must be text"
			}
		};
		const item = stripDangerousContent(stripHtml(v.trim()));
		if (options.allowedValues && !options.allowedValues.includes(item)) return {
			success: false,
			error: {
				code: "INVALID_OPTION",
				message: `'${escapeHtml(item)}' is not a valid option`
			}
		};
		cleaned.push(item);
	}
	return {
		success: true,
		value: cleaned
	};
}
function sanitizeRating(value, fieldType) {
	return sanitizeNumber(value, {
		min: 1,
		max: fieldType === "rating_star" ? 5 : 5
	});
}
function sanitizeNps(value) {
	return sanitizeNumber(value, {
		min: 0,
		max: 10
	});
}
/**
* Sanitize and validate all answers for a form submission.
* Maps each answer to its field descriptor, applies per-type sanitization,
* and collects all errors (not just the first).
*/
function sanitizeAnswers(answers, fields) {
	new Map(fields.map((f) => [f.fieldId, f]));
	const errors = [];
	const sanitized = [];
	for (const field of fields) {
		const rawValue = answers.find((a) => a.fieldId === field.fieldId)?.value ?? null;
		const result = sanitizeFieldValue(field.type, rawValue, {
			required: field.required,
			minLength: field.minLength,
			maxLength: field.maxLength,
			min: field.min,
			max: field.max,
			pattern: field.pattern,
			format: field.format,
			allowedValues: field.options?.map((o) => o.value)
		});
		if (!result.success) errors.push({
			fieldId: field.fieldId,
			label: field.label,
			code: result.error.code,
			message: result.error.message
		});
		else sanitized.push({
			fieldId: field.fieldId,
			type: field.type,
			value: result.value
		});
	}
	if (errors.length > 0) return {
		success: false,
		errors
	};
	return {
		success: true,
		answers: sanitized
	};
}
/**
* Sanitize a user message or admin reply body.
*/
function sanitizeMessage(body) {
	return sanitizeText(body, {
		maxLength: 1e4,
		minLength: 1,
		stripTags: true,
		trim: true
	});
}

//#endregion
//#region src/templates.ts
const ALL_TEMPLATES = [
	{
		id: "tpl_blank",
		name: "Blank Form",
		description: "Start from scratch with an empty form.",
		category: "General",
		icon: "file-plus",
		definition: {
			schemaVersion: SCHEMA_VERSION,
			ui: {
				theme: "default",
				layout: "single-column",
				density: "comfortable"
			},
			workflow: {
				submissionMode: "standard",
				tracking: {
					enabled: true,
					style: "date_en_mix"
				},
				thankYou: {
					mode: "message",
					message: "Thank you for your submission.",
					includeTrackingCode: true,
					redirectUrl: null
				}
			},
			notifications: {
				admin: {
					enabled: false,
					recipients: []
				},
				user: {
					enabled: false,
					recipientFieldId: null
				},
				template: {
					subject: "[website_name] New submission [confirmation_code]",
					body: "A new submission was received. [link_response]"
				}
			},
			integrations: {
				sms: {
					enabled: false,
					provider: null,
					configRef: null
				},
				telegram: {
					enabled: false,
					botRef: null,
					chatRefs: []
				},
				payments: {
					enabled: false,
					provider: null,
					currency: "USD"
				}
			},
			steps: [{
				id: "stp_blank_step1",
				title: "Step 1",
				order: 1,
				fields: []
			}],
			fields: {}
		}
	},
	{
		id: "tpl_contact",
		name: "Contact Form",
		description: "Simple contact form with name, email, and message.",
		category: "General",
		icon: "envelope",
		definition: {
			schemaVersion: SCHEMA_VERSION,
			ui: {
				theme: "default",
				layout: "single-column",
				density: "comfortable"
			},
			workflow: {
				submissionMode: "standard",
				tracking: {
					enabled: true,
					style: "date_en_mix"
				},
				thankYou: {
					mode: "message",
					message: "Thank you for reaching out! We will get back to you soon.",
					includeTrackingCode: true,
					redirectUrl: null
				}
			},
			notifications: {
				admin: {
					enabled: true,
					recipients: []
				},
				user: {
					enabled: true,
					recipientFieldId: "fld_contact_email"
				},
				template: {
					subject: "[website_name] New contact form submission [confirmation_code]",
					body: "Hello,\n\nA new contact form submission was received.\n\nTracking code: [confirmation_code]\n\nView submission: [link_response]"
				}
			},
			integrations: {
				sms: {
					enabled: false,
					provider: null,
					configRef: null
				},
				telegram: {
					enabled: false,
					botRef: null,
					chatRefs: []
				},
				payments: {
					enabled: false,
					provider: null,
					currency: "USD"
				}
			},
			steps: [{
				id: "stp_contact_step1",
				title: "Contact",
				order: 1,
				fields: [
					"fld_contact_name",
					"fld_contact_email",
					"fld_contact_message"
				]
			}],
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
						helpText: ""
					},
					validation: {
						required: true,
						minLength: 1,
						maxLength: 120
					},
					visibility: {
						hidden: false,
						disabled: false
					},
					logic: { conditions: [] },
					data: {},
					integrations: { mapsToNotificationRecipient: false }
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
						helpText: ""
					},
					validation: {
						required: true,
						format: "email"
					},
					visibility: {
						hidden: false,
						disabled: false
					},
					logic: { conditions: [] },
					data: {},
					integrations: { mapsToNotificationRecipient: true }
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
						helpText: ""
					},
					validation: {
						required: true,
						minLength: 10,
						maxLength: 5e3
					},
					visibility: {
						hidden: false,
						disabled: false
					},
					logic: { conditions: [] },
					data: {},
					integrations: { mapsToNotificationRecipient: false }
				}
			}
		}
	},
	{
		id: "tpl_support",
		name: "Support Ticket",
		description: "Capture support requests with priority and subject.",
		category: "Support",
		icon: "lifebuoy",
		definition: {
			schemaVersion: SCHEMA_VERSION,
			ui: {
				theme: "default",
				layout: "single-column",
				density: "comfortable"
			},
			workflow: {
				submissionMode: "standard",
				tracking: {
					enabled: true,
					style: "date_en_mix"
				},
				thankYou: {
					mode: "message",
					message: "Your support ticket has been received. Use tracking code [confirmation_code] to follow up.",
					includeTrackingCode: true,
					redirectUrl: null
				}
			},
			notifications: {
				admin: {
					enabled: true,
					recipients: []
				},
				user: {
					enabled: true,
					recipientFieldId: "fld_support_email"
				},
				template: {
					subject: "[website_name] Support ticket [confirmation_code] received",
					body: "Your support request has been logged.\nTracking code: [confirmation_code]\nView: [link_response]"
				}
			},
			integrations: {
				sms: {
					enabled: false,
					provider: null,
					configRef: null
				},
				telegram: {
					enabled: false,
					botRef: null,
					chatRefs: []
				},
				payments: {
					enabled: false,
					provider: null,
					currency: "USD"
				}
			},
			steps: [{
				id: "stp_support_step1",
				title: "Ticket Details",
				order: 1,
				fields: [
					"fld_support_name",
					"fld_support_email",
					"fld_support_priority",
					"fld_support_subject",
					"fld_support_description"
				]
			}],
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
						helpText: ""
					},
					validation: {
						required: true,
						maxLength: 120
					},
					visibility: {
						hidden: false,
						disabled: false
					},
					logic: { conditions: [] },
					data: {},
					integrations: { mapsToNotificationRecipient: false }
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
						helpText: "We will reply to this address"
					},
					validation: {
						required: true,
						format: "email"
					},
					visibility: {
						hidden: false,
						disabled: false
					},
					logic: { conditions: [] },
					data: {},
					integrations: { mapsToNotificationRecipient: true }
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
						helpText: ""
					},
					validation: { required: true },
					visibility: {
						hidden: false,
						disabled: false
					},
					logic: { conditions: [] },
					data: {},
					integrations: { mapsToNotificationRecipient: false },
					options: [
						{
							id: "opt_priority_low",
							label: "Low",
							value: "low"
						},
						{
							id: "opt_priority_normal",
							label: "Normal",
							value: "normal"
						},
						{
							id: "opt_priority_high",
							label: "High",
							value: "high"
						},
						{
							id: "opt_priority_urgent",
							label: "Urgent",
							value: "urgent"
						}
					]
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
						helpText: ""
					},
					validation: {
						required: true,
						maxLength: 300
					},
					visibility: {
						hidden: false,
						disabled: false
					},
					logic: { conditions: [] },
					data: {},
					integrations: { mapsToNotificationRecipient: false }
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
						helpText: ""
					},
					validation: {
						required: true,
						minLength: 20,
						maxLength: 1e4
					},
					visibility: {
						hidden: false,
						disabled: false
					},
					logic: { conditions: [] },
					data: {},
					integrations: { mapsToNotificationRecipient: false }
				}
			}
		}
	},
	{
		id: "tpl_satisfaction",
		name: "Customer Satisfaction",
		description: "Rate your experience with a star rating and comment.",
		category: "Survey",
		icon: "star",
		definition: {
			schemaVersion: SCHEMA_VERSION,
			ui: {
				theme: "default",
				layout: "single-column",
				density: "comfortable"
			},
			workflow: {
				submissionMode: "survey",
				tracking: {
					enabled: true,
					style: "date_en_mix"
				},
				thankYou: {
					mode: "message",
					message: "Thank you for your feedback! It helps us improve.",
					includeTrackingCode: false,
					redirectUrl: null
				}
			},
			notifications: {
				admin: {
					enabled: true,
					recipients: []
				},
				user: {
					enabled: false,
					recipientFieldId: null
				},
				template: {
					subject: "[website_name] New satisfaction survey [confirmation_code]",
					body: "A new satisfaction survey was submitted. Rating: [field:rating]\nView: [link_response]"
				}
			},
			integrations: {
				sms: {
					enabled: false,
					provider: null,
					configRef: null
				},
				telegram: {
					enabled: false,
					botRef: null,
					chatRefs: []
				},
				payments: {
					enabled: false,
					provider: null,
					currency: "USD"
				}
			},
			steps: [{
				id: "stp_satisfaction_step1",
				title: "Your Experience",
				order: 1,
				fields: [
					"fld_survey_rating",
					"fld_survey_recommend",
					"fld_survey_comment"
				]
			}],
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
						helpText: "Rate your overall experience"
					},
					validation: { required: true },
					visibility: {
						hidden: false,
						disabled: false
					},
					logic: { conditions: [] },
					data: {},
					integrations: { mapsToNotificationRecipient: false }
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
						helpText: "0 = Not at all, 10 = Extremely likely"
					},
					validation: { required: false },
					visibility: {
						hidden: false,
						disabled: false
					},
					logic: { conditions: [] },
					data: {},
					integrations: { mapsToNotificationRecipient: false }
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
						helpText: ""
					},
					validation: {
						required: false,
						maxLength: 2e3
					},
					visibility: {
						hidden: false,
						disabled: false
					},
					logic: { conditions: [] },
					data: {},
					integrations: { mapsToNotificationRecipient: false }
				}
			}
		}
	}
];
function getAllTemplates() {
	return ALL_TEMPLATES;
}
function getTemplate(id) {
	return ALL_TEMPLATES.find((t) => t.id === id);
}

//#endregion
//#region src/validation.ts
/**
* Forms Builder Plugin — Validation
*
* Zod-based validators for form definitions, submissions, and API inputs.
* Following the OWASP-aligned security patterns from AGENTS.md.
*/
const FIELD_TYPES = [
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
	"group"
];
const CHOICE_FIELD_TYPES = new Set([
	"select",
	"multiselect",
	"radio",
	"checkbox",
	"yes_no"
]);
const MAX_FIELD_COUNT = 100;
const MAX_STEP_COUNT = 20;
const MAX_FORM_NAME_LENGTH = 200;
const MAX_LABEL_LENGTH = 500;
const MAX_OPTION_COUNT = 200;
const fieldOptionSchema = z.object({
	id: z.string().min(1).max(100),
	label: z.string().min(1).max(200),
	value: z.string().min(1).max(500)
});
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
	errorBorderColor: z.string().max(50).optional()
});
const fieldUiSchema = z.object({
	placeholder: z.string().max(500).default(""),
	width: z.enum([
		"full",
		"half",
		"third"
	]).default("full"),
	labelPosition: z.enum([
		"top",
		"left",
		"hidden"
	]).default("top"),
	helpText: z.string().max(1e3).default(""),
	style: formFieldStyleSchema.optional()
});
const fieldValidationSchema = z.object({
	required: z.boolean().default(false),
	minLength: z.number().int().min(0).optional(),
	maxLength: z.number().int().min(0).max(5e4).optional(),
	min: z.number().optional(),
	max: z.number().optional(),
	pattern: z.string().max(500).optional(),
	format: z.enum([
		"email",
		"url",
		"phone"
	]).optional(),
	allowedExtensions: z.array(z.string().max(20)).max(50).optional(),
	maxFileSizeMb: z.number().min(0).max(100).optional()
});
const fieldVisibilitySchema = z.object({
	hidden: z.boolean().default(false),
	disabled: z.boolean().default(false)
});
const logicConditionSchema = z.object({
	fieldId: z.string().min(1).max(100),
	operator: z.enum([
		"equals",
		"not_equals",
		"contains",
		"is_empty",
		"is_not_empty"
	]),
	value: z.string().max(1e3)
});
const fieldLogicSchema = z.object({
	conditions: z.array(logicConditionSchema).max(20).default([]),
	action: z.enum(["show", "hide"]).optional(),
	relation: z.enum(["and", "or"]).optional()
});
const fieldIntegrationsSchema = z.object({ mapsToNotificationRecipient: z.boolean().default(false) });
const formFieldSchema = z.object({
	id: z.string().regex(/^fld_[a-z0-9_]+$/, "Field ID must start with 'fld_'"),
	type: z.enum(FIELD_TYPES),
	name: z.string().min(1).max(200).regex(/^[a-z][a-z0-9_]*$/, "Field name must be lowercase alphanumeric"),
	label: z.string().min(1).max(MAX_LABEL_LENGTH),
	defaultValue: z.string().max(5e3).default(""),
	ui: fieldUiSchema,
	validation: fieldValidationSchema,
	visibility: fieldVisibilitySchema,
	logic: fieldLogicSchema,
	data: z.record(z.string(), z.unknown()).default({}),
	integrations: fieldIntegrationsSchema,
	options: z.array(fieldOptionSchema).max(MAX_OPTION_COUNT).optional()
}).superRefine((field, ctx) => {
	if (CHOICE_FIELD_TYPES.has(field.type) && (!field.options || field.options.length === 0)) ctx.addIssue(`Field type '${field.type}' requires at least one option`);
});
const formStepSchema = z.object({
	id: z.string().regex(/^stp_[a-z0-9_]+$/, "Step ID must start with 'stp_'"),
	title: z.string().min(1).max(200),
	order: z.number().int().min(1),
	fields: z.array(z.string()).max(MAX_FIELD_COUNT)
});
const trackingConfigSchema = z.object({
	enabled: z.boolean().default(true),
	style: z.enum([
		"date_en_mix",
		"sequential",
		"uuid"
	]).default("date_en_mix")
});
const thankYouConfigSchema = z.object({
	mode: z.enum(["message", "redirect"]),
	message: z.string().max(2e3).default("Thank you for your submission."),
	includeTrackingCode: z.boolean().default(true),
	redirectUrl: z.string().url().nullable().default(null)
});
const formWorkflowSchema = z.object({
	submissionMode: z.enum([
		"standard",
		"survey",
		"payment",
		"login"
	]).default("standard"),
	tracking: trackingConfigSchema,
	thankYou: thankYouConfigSchema
});
const notificationTemplateSchema = z.object({
	subject: z.string().min(1).max(500),
	body: z.string().max(1e4)
});
const formNotificationsSchema = z.object({
	admin: z.object({
		enabled: z.boolean().default(false),
		recipients: z.array(z.string().email()).max(20).default([])
	}),
	user: z.object({
		enabled: z.boolean().default(false),
		recipientFieldId: z.string().nullable().default(null)
	}),
	template: notificationTemplateSchema
});
const formIntegrationsSchema = z.object({
	sms: z.object({
		enabled: z.boolean().default(false),
		provider: z.string().nullable().default(null),
		configRef: z.string().nullable().default(null)
	}),
	telegram: z.object({
		enabled: z.boolean().default(false),
		botRef: z.string().nullable().default(null),
		chatRefs: z.array(z.string()).max(10).default([])
	}),
	payments: z.object({
		enabled: z.boolean().default(false),
		provider: z.string().nullable().default(null),
		currency: z.string().length(3).default("USD")
	})
});
const formSubmitButtonSchema = z.object({
	label: z.string().max(200),
	size: z.enum([
		"sm",
		"md",
		"lg"
	]),
	align: z.enum([
		"left",
		"center",
		"right",
		"full"
	]),
	variant: z.enum([
		"filled",
		"outline",
		"ghost"
	]),
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
	customClass: z.string().max(200).optional()
});
const formDefinitionV1Schema = z.object({
	schemaVersion: z.literal("1.0.0"),
	formId: z.string().regex(/^frm_[a-z0-9]+$/, "Form ID must start with 'frm_'"),
	meta: z.object({
		name: z.string().min(1).max(MAX_FORM_NAME_LENGTH),
		slug: z.string().min(1).max(100).regex(/^[a-z][a-z0-9-]*$/, "Slug must be lowercase alphanumeric with hyphens"),
		description: z.string().max(2e3).default(""),
		status: z.enum([
			"draft",
			"published",
			"archived"
		]).default("draft"),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
		createdBy: z.string().min(1)
	}),
	ui: z.object({
		theme: z.string().max(100).default("default"),
		layout: z.enum(["single-column", "two-column"]).default("single-column"),
		density: z.enum(["comfortable", "compact"]).default("comfortable")
	}),
	workflow: formWorkflowSchema,
	notifications: formNotificationsSchema,
	integrations: formIntegrationsSchema,
	steps: z.array(formStepSchema).min(1).max(MAX_STEP_COUNT),
	fields: z.record(z.string(), formFieldSchema),
	submitButton: formSubmitButtonSchema.optional(),
	migrationMeta: z.object({
		source: z.literal("easy-form-builder"),
		sourceVersion: z.string(),
		migratedAt: z.string().datetime(),
		warnings: z.array(z.string())
	}).optional()
}).superRefine((form, ctx) => {
	if (Object.keys(form.fields).length > MAX_FIELD_COUNT) ctx.addIssue(`Form may not exceed ${MAX_FIELD_COUNT} fields`);
	for (const step of form.steps) for (const fieldId of step.fields) if (!(fieldId in form.fields)) ctx.addIssue(`Step '${step.id}' references unknown field '${fieldId}'`);
	const { recipientFieldId } = form.notifications.user;
	if (recipientFieldId !== null) {
		const field = form.fields[recipientFieldId];
		if (!field) ctx.addIssue(`User notification recipientFieldId '${recipientFieldId}' not found`);
		else if (field.type !== "email") ctx.addIssue(`User notification recipientFieldId must reference an email field`);
	}
});
const submissionV1Schema = z.object({
	submissionId: z.string().min(1).max(100),
	formId: z.string().min(1).max(100),
	trackingCode: z.string().min(1).max(50),
	status: z.enum([
		"open",
		"closed",
		"read"
	]).default("open"),
	submittedAt: z.string().datetime(),
	submittedBy: z.object({
		type: z.enum(["guest", "user"]),
		userId: z.string().nullable()
	}),
	meta: z.object({
		ipHash: z.string().max(128),
		userAgent: z.string().max(500),
		locale: z.string().max(20).default("en-US")
	}),
	answers: z.array(z.object({
		fieldId: z.string().min(1).max(100),
		type: z.enum(FIELD_TYPES),
		value: z.unknown()
	})),
	attachments: z.array(z.string()).max(20),
	audit: z.array(z.object({
		at: z.string().datetime(),
		event: z.enum([
			"submitted",
			"read",
			"replied",
			"closed",
			"exported",
			"deleted"
		]),
		actor: z.string().max(100)
	}))
});
const createFormInputSchema = z.object({
	name: z.string().min(1).max(MAX_FORM_NAME_LENGTH),
	description: z.string().max(2e3).optional(),
	templateId: z.string().optional()
});
const updateFormInputSchema = z.object({ definition: formDefinitionV1Schema });
const submitFormInputSchema = z.object({
	formId: z.string().min(1).max(100),
	answers: z.array(z.object({
		fieldId: z.string().min(1).max(100),
		value: z.unknown()
	})),
	locale: z.string().max(20).optional()
});
const replyToSubmissionInputSchema = z.object({
	submissionId: z.string().min(1).max(100),
	body: z.string().min(1).max(1e4)
});
const updateSubmissionStatusInputSchema = z.object({
	submissionId: z.string().min(1).max(100),
	status: z.enum([
		"open",
		"closed",
		"read"
	])
});
function validateFormDefinition(value) {
	const result = formDefinitionV1Schema.safeParse(value);
	if (result.success) return {
		success: true,
		data: result.data
	};
	return {
		success: false,
		error: result.error.issues.map((i) => i.message).join("; ")
	};
}

//#endregion
//#region src/index.ts
const STORAGE = {
	forms: { indexes: [
		"formId",
		"status",
		"createdAt",
		"updatedAt",
		"createdBy"
	] },
	submissions: { indexes: [
		"submissionId",
		"formId",
		"trackingCode",
		"status",
		"submittedAt",
		"email"
	] },
	responses: { indexes: [
		"messageId",
		"submissionId",
		"from",
		"sentAt"
	] },
	settings: { indexes: [] },
	portal_tokens: { indexes: [
		"tokenId",
		"email",
		"token",
		"createdAt",
		"activated"
	] }
};
const createFormSchema = z.object({
	name: z.string().min(1).max(200),
	description: z.string().max(2e3).optional(),
	templateId: z.string().optional()
});
const updateFormSchema = z.object({
	formId: z.string().min(1).max(100),
	definition: z.unknown()
});
const deleteFormSchema = z.object({ formId: z.string().min(1).max(100) });
const duplicateFormSchema = z.object({ formId: z.string().min(1).max(100) });
const listFormsSchema = z.object({
	cursor: z.string().optional(),
	limit: z.number().int().min(1).max(100).default(50),
	status: z.enum([
		"draft",
		"published",
		"archived"
	]).optional()
});
const getFormSchema = z.object({ formId: z.string().min(1).max(100) });
const submitFormSchema = z.object({
	formId: z.string().min(1).max(100),
	answers: z.array(z.object({
		fieldId: z.string().min(1).max(100),
		value: z.unknown()
	})),
	locale: z.string().max(20).optional()
});
const listSubmissionsSchema = z.object({
	formId: z.string().optional(),
	cursor: z.string().optional(),
	limit: z.number().int().min(1).max(100).default(50),
	status: z.enum([
		"open",
		"closed",
		"read"
	]).optional()
});
const getSubmissionSchema = z.object({ submissionId: z.string().min(1).max(100) });
const updateSubmissionStatusSchema = z.object({
	submissionId: z.string().min(1).max(100),
	status: z.enum([
		"open",
		"closed",
		"read"
	])
});
const replySchema = z.object({
	submissionId: z.string().min(1).max(100),
	body: z.string().min(1).max(1e4)
});
const trackingLookupSchema = z.object({ trackingCode: z.string().min(1).max(50) });
const importLegacySchema = z.object({
	data: z.unknown(),
	sourceVersion: z.string().optional()
});
const exportCsvSchema = z.object({ formId: z.string().min(1).max(100) });
const settingsUpdateSchema = z.object({
	notificationEmail: z.string().max(320).optional().default(""),
	trackingStyle: z.enum([
		"date_en_mix",
		"sequential",
		"uuid"
	]).optional().default("date_en_mix"),
	autoDeleteDays: z.number().int().min(0).max(3650).optional().default(90),
	captchaEnabled: z.boolean().optional().default(false),
	portalEnabled: z.boolean().optional().default(true),
	portalTitle: z.string().max(200).optional().default("Support Portal"),
	portalWelcomeMessage: z.string().max(2e3).optional().default(""),
	portalDefaultLocale: z.string().max(10).optional().default("en"),
	portalBrandColor: z.string().max(20).optional().default(""),
	portalLoginDescription: z.string().max(2e3).optional().default(""),
	portalPagePath: z.string().max(500).optional().default(""),
	planTier: z.enum(["free", "pro"]).optional().default("free"),
	formAccentColor: z.string().max(20).optional().default(""),
	formBgColor: z.string().max(20).optional().default(""),
	formTextColor: z.string().max(20).optional().default(""),
	formBorderRadius: z.string().max(20).optional().default(""),
	formFontSize: z.string().max(20).optional().default(""),
	formButtonStyle: z.enum([
		"filled",
		"outline",
		"ghost"
	]).optional().default("filled")
});
const portalRequestAccessSchema = z.object({
	email: z.string().min(1).max(320),
	locale: z.string().max(20).optional()
});
const portalVerifyTokenSchema = z.object({ token: z.string().min(1).max(200) });
const portalListSubmissionsSchema = z.object({
	email: z.string().min(1).max(320),
	token: z.string().min(1).max(200),
	status: z.enum([
		"open",
		"closed",
		"read"
	]).optional(),
	cursor: z.string().optional(),
	limit: z.number().int().min(1).max(100).default(50)
});
const portalGetSubmissionSchema = z.object({
	email: z.string().min(1).max(320),
	token: z.string().min(1).max(200),
	submissionId: z.string().min(1).max(100)
});
const portalReplySchema = z.object({
	email: z.string().min(1).max(320),
	token: z.string().min(1).max(200),
	submissionId: z.string().min(1).max(100),
	body: z.string().min(1).max(1e4)
});
const portalResendLinkSchema = z.object({
	email: z.string().min(1).max(320),
	locale: z.string().max(20).optional()
});
const PLUGIN_DISPLAY_NAME = "EmForm Builder";
const PLUGIN_URL = "https://emdash.dev/plugins/forms-builder";
const BRAND_TEAM = "White Studio";
const BRAND_URL = "https://whitestudio.team";
/** Check if the site URL is a local/dev environment */
function isDevEnvironment(siteUrl) {
	return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(siteUrl);
}
/** Build branding HTML for emails (only in free tier) */
function brandingHtml(tier) {
	if (tier === "pro") return "";
	return `<p style="color:#9ca3af;font-size:11px;margin:8px 0 0">Powered by <a href="${PLUGIN_URL}" style="color:#6b7280;text-decoration:underline">${PLUGIN_DISPLAY_NAME}</a> · made by <a href="${BRAND_URL}" style="color:#6b7280;text-decoration:underline">${BRAND_TEAM}</a></p>`;
}
/** Build branding plain text for emails (only in free tier) */
function brandingText(tier) {
	if (tier === "pro") return "";
	return `\nPowered by ${PLUGIN_DISPLAY_NAME} (${PLUGIN_URL}) · made by ${BRAND_TEAM} (${BRAND_URL})`;
}
function nowIso() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
const SLUG_CLEAN = /[^a-z0-9]+/g;
const SLUG_TRIM = /^-+|-+$/g;
const CSV_QUOTE = /"/g;
function strVal(v) {
	if (v == null) return "";
	if (typeof v === "string") return v;
	if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint") return String(v);
	if (Array.isArray(v)) return JSON.stringify(v);
	if (typeof v === "object") {
		const safe = {};
		for (const key of Object.keys(v)) safe[key] = v[key];
		return JSON.stringify(safe);
	}
	return "";
}
function makeFormListItem(raw) {
	if (typeof raw !== "object" || raw === null) return null;
	const r = raw.data;
	return {
		formId: r.formId ?? "",
		name: r.name ?? "",
		status: r.status ?? "draft",
		submissionCount: Number(r.submissionCount ?? 0),
		lastSubmissionAt: r.lastSubmissionAt ?? null,
		createdAt: r.createdAt ?? "",
		updatedAt: r.updatedAt ?? ""
	};
}
function makeSubmissionListItem(raw) {
	if (typeof raw !== "object" || raw === null) return null;
	const r = raw.data;
	return {
		submissionId: r.submissionId ?? "",
		formId: r.formId ?? "",
		formName: r.formName ?? "",
		trackingCode: r.trackingCode ?? "",
		status: r.status ?? "open",
		submittedAt: r.submittedAt ?? ""
	};
}
/** Escape a CSV cell value */
function csvCell(value) {
	return `"${strVal(value).replace(CSV_QUOTE, "\"\"")}"`;
}
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const TOKEN_EXPIRY_HOURS = 24;
/** Generate a cryptographically random portal token */
function generatePortalToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
/** Extract the email field value from a submission's answers */
function extractEmailFromSubmission(formDef, answers) {
	for (const field of Object.values(formDef.fields)) if (field.type === "email") {
		const answer = answers.find((a) => a.fieldId === field.id);
		if (answer && typeof answer.value === "string" && EMAIL_RE.test(answer.value)) return answer.value;
	}
	return null;
}
/** Check if a portal token is valid and not expired */
function isTokenValid(tokenData) {
	if (!tokenData.activated) return true;
	if (tokenData.expiresAt) return new Date(tokenData.expiresAt).getTime() > Date.now();
	return false;
}
/** Build the admin notification email body with form answers */
function buildAdminEmailBody(formName, trackingCode, answers, formDef, tier = "free") {
	const answerLines = [];
	const htmlLines = [];
	for (const ans of answers) {
		const label = formDef.fields[ans.fieldId]?.label ?? ans.fieldId;
		const value = ans.value == null ? "—" : String(ans.value);
		answerLines.push(`${label}: ${value}`);
		htmlLines.push(`<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#374151;white-space:nowrap">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#4b5563">${value}</td></tr>`);
	}
	return {
		text: [
			`New form submission: ${formName}`,
			`Tracking Code: ${trackingCode}`,
			"",
			"Submitted Data:",
			...answerLines,
			brandingText(tier)
		].join("\n"),
		html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#2271b1,#1a5a8e);padding:24px;border-radius:12px 12px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">New Form Submission</h2>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">${formName}</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
    <div style="background:#f0f9ff;padding:12px 16px;border-radius:8px;margin-bottom:20px">
      <span style="font-size:12px;color:#6b7280">Tracking Code</span>
      <div style="font-family:monospace;font-size:16px;font-weight:700;color:#2271b1;margin-top:2px">${trackingCode}</div>
    </div>
    <table style="width:100%;border-collapse:collapse">${htmlLines.join("")}</table>
  </div>
  <div style="background:#f9fafb;padding:16px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">Sent by EmDash Forms</p>
    ${brandingHtml(tier)}
  </div>
</div>`.trim()
	};
}
/** Build user confirmation email body */
function buildUserConfirmationBody(formName, trackingCode, answers, formDef, portalUrl, tier = "free") {
	const answerLines = [];
	const htmlLines = [];
	for (const ans of answers) {
		const label = formDef.fields[ans.fieldId]?.label ?? ans.fieldId;
		const value = ans.value == null ? "—" : String(ans.value);
		answerLines.push(`${label}: ${value}`);
		htmlLines.push(`<tr><td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;font-weight:500;color:#374151">${label}</td><td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280">${value}</td></tr>`);
	}
	return {
		text: [
			`Thank you for your submission: ${formName}`,
			`Tracking Code: ${trackingCode}`,
			"",
			"Your submitted information:",
			...answerLines,
			"",
			portalUrl ? `View your submission and track responses: ${portalUrl}` : "",
			brandingText(tier)
		].join("\n"),
		html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#2271b1,#1a5a8e);padding:24px;border-radius:12px 12px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">Submission Received</h2>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">${formName}</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
    <p style="color:#374151;font-size:14px;margin:0 0 16px">Thank you for your submission. Here's a summary of what you sent:</p>
    <div style="background:#f0f9ff;padding:12px 16px;border-radius:8px;margin-bottom:20px">
      <span style="font-size:12px;color:#6b7280">Tracking Code</span>
      <div style="font-family:monospace;font-size:16px;font-weight:700;color:#2271b1;margin-top:2px">${trackingCode}</div>
    </div>
    <table style="width:100%;border-collapse:collapse">${htmlLines.join("")}</table>
    ${portalUrl ? `<div style="margin-top:24px;text-align:center">
      <a href="${portalUrl}" style="display:inline-block;background:#2271b1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">View Submission &amp; Replies</a>
    </div>` : ""}
  </div>
  <div style="background:#f9fafb;padding:16px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">Sent by EmDash Forms</p>
    ${brandingHtml(tier)}
  </div>
</div>`.trim()
	};
}
/** Build admin reply notification email for the user */
function buildReplyNotificationBody(formName, trackingCode, replyBody, portalUrl, tier = "free") {
	return {
		text: [
			`New reply to your submission: ${formName}`,
			`Tracking Code: ${trackingCode}`,
			"",
			"Reply:",
			replyBody,
			"",
			portalUrl ? `View the full conversation: ${portalUrl}` : "",
			brandingText(tier)
		].join("\n"),
		html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#2271b1,#1a5a8e);padding:24px;border-radius:12px 12px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">New Reply</h2>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">${formName} — ${trackingCode}</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
    <div style="background:#f0fdf4;padding:16px;border-radius:8px;border-left:4px solid #22c55e;margin-bottom:20px">
      <p style="color:#374151;font-size:14px;margin:0;white-space:pre-wrap">${replyBody}</p>
    </div>
    ${portalUrl ? `<div style="text-align:center">
      <a href="${portalUrl}" style="display:inline-block;background:#2271b1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">View Full Conversation</a>
    </div>` : ""}
  </div>
  <div style="background:#f9fafb;padding:16px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">Sent by EmDash Forms</p>
    ${brandingHtml(tier)}
  </div>
</div>`.trim()
	};
}
/**
* Get or create a portal token for an email.
* Reuses existing valid tokens to avoid sending multiple links.
*/
async function getOrCreatePortalToken(storage, email) {
	const existing = await storage.portal_tokens.query({
		where: { email },
		orderBy: { createdAt: "desc" },
		limit: 1
	});
	if (existing.items.length > 0) {
		const item = existing.items[0].data;
		if (isTokenValid(item)) return {
			token: item.token,
			isNew: false
		};
	}
	const tokenId = `ptk_${Date.now()}`;
	const token = generatePortalToken();
	const tokenData = {
		tokenId,
		email,
		token,
		createdAt: nowIso(),
		expiresAt: null,
		activated: false,
		activatedAt: null
	};
	await storage.portal_tokens.put(tokenId, tokenData);
	return {
		token,
		isNew: true
	};
}
/**
* Build the portal URL for email links.
* Uses the settings portalPagePath if set; falls back to the API route.
*/
function buildPortalUrl(baseUrl, token, portalPath) {
	if (portalPath) {
		const normalized = portalPath.startsWith("/") ? portalPath : `/${portalPath}`;
		return `${baseUrl}${normalized}${normalized.includes("?") ? "&" : "?"}token=${token}`;
	}
	return `${baseUrl}/_emdash/api/plugins/emdash-form-builder/portal.page?token=${token}`;
}
function formsBuilderPlugin() {
	return {
		id: "emdash-form-builder",
		version: "0.1.0",
		entrypoint: "@emdash-cms/plugin-forms-builder",
		options: {},
		adminEntry: "@emdash-cms/plugin-forms-builder/admin",
		componentsEntry: "@emdash-cms/plugin-forms-builder/astro",
		adminPages: [{
			path: "/",
			label: "EmForm Builder",
			icon: "plus-circle"
		}],
		adminWidgets: [{
			id: "summary",
			title: "EmForm Builder",
			size: "third"
		}]
	};
}
function createPlugin() {
	return definePlugin({
		id: "emdash-form-builder",
		version: "0.1.0",
		capabilities: ["read:content", "write:content"],
		storage: STORAGE,
		admin: {
			pages: [{
				path: "/",
				label: "EmForm Builder",
				icon: "plus-circle"
			}],
			widgets: [{
				id: "summary",
				title: "EmForm Builder",
				size: "third"
			}],
			portableTextBlocks: [{
				type: "formEmbed",
				label: "Form",
				icon: "form",
				description: "Embed a form from EmForm Builder",
				fields: [{
					type: "select",
					action_id: "formId",
					label: "Form",
					options: [],
					optionsRoute: "forms.options"
				}]
			}, {
				type: "portalEmbed",
				label: "Support Portal",
				icon: "globe",
				description: "Embed the support portal for users to view and track their submissions",
				fields: []
			}]
		},
		hooks: void 0,
		routes: {
			"settings.get": {
				public: false,
				handler: async (ctx) => {
					const item = await ctx.storage.settings.get("global");
					if (!item) return {};
					return item;
				}
			},
			"settings.update": {
				input: settingsUpdateSchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input;
					await ctx.storage.settings.put("global", input);
					return { success: true };
				}
			},
			"templates.list": {
				public: false,
				handler: async (_ctx) => {
					return { items: getAllTemplates() };
				}
			},
			"forms.list": {
				input: listFormsSchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input;
					const result = await ctx.storage.forms.query({
						where: input.status ? { status: input.status } : void 0,
						limit: input.limit,
						cursor: input.cursor,
						orderBy: { createdAt: "desc" }
					});
					return {
						items: result.items.map(makeFormListItem).filter(Boolean),
						cursor: result.cursor
					};
				}
			},
			"forms.options": {
				public: false,
				handler: async (ctx) => {
					return { items: (await ctx.storage.forms.query({
						limit: 100,
						orderBy: { createdAt: "desc" }
					})).items.map((r) => {
						const rec = r.data;
						if (!rec.formId || !rec.name) return null;
						return {
							id: String(rec.formId),
							name: String(rec.name)
						};
					}).filter(Boolean) };
				}
			},
			"forms.get": {
				input: getFormSchema,
				public: true,
				handler: async (ctx) => {
					const { formId } = ctx.input;
					const form = (await ctx.storage.forms.query({
						where: { formId },
						limit: 1
					})).items[0];
					if (!form) return { error: "NOT_FOUND" };
					return { form: form.data };
				}
			},
			"forms.create": {
				input: createFormSchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input;
					const now = nowIso();
					const nameResult = sanitizeText(input.name, {
						maxLength: 200,
						minLength: 1
					});
					if (!nameResult.success) return {
						error: "VALIDATION_ERROR",
						detail: nameResult.error.message
					};
					const sanitizedName = nameResult.value;
					const sanitizedDescription = input.description ? stripHtml(input.description).slice(0, 2e3) : "";
					let definition;
					if (input.templateId) {
						const tpl = getTemplate(input.templateId);
						if (!tpl) return { error: "TEMPLATE_NOT_FOUND" };
						definition = {
							...tpl.definition,
							formId: `frm_${Date.now()}`,
							meta: {
								name: sanitizedName,
								slug: sanitizedName.toLowerCase().replace(SLUG_CLEAN, "-").replace(SLUG_TRIM, "").slice(0, 100) || "form",
								description: sanitizedDescription,
								status: "draft",
								createdAt: now,
								updatedAt: now,
								createdBy: "admin"
							}
						};
					} else definition = {
						...getTemplate("tpl_blank").definition,
						formId: `frm_${Date.now()}`,
						meta: {
							name: sanitizedName,
							slug: sanitizedName.toLowerCase().replace(SLUG_CLEAN, "-").replace(SLUG_TRIM, "").slice(0, 100) || "form",
							description: sanitizedDescription,
							status: "draft",
							createdAt: now,
							updatedAt: now,
							createdBy: "admin"
						}
					};
					const validation = validateFormDefinition(definition);
					if (!validation.success) return {
						error: "VALIDATION_ERROR",
						detail: validation.error
					};
					await ctx.storage.forms.put(definition.formId, {
						formId: definition.formId,
						name: definition.meta.name,
						status: definition.meta.status,
						submissionCount: 0,
						lastSubmissionAt: null,
						createdAt: definition.meta.createdAt,
						updatedAt: definition.meta.updatedAt,
						createdBy: definition.meta.createdBy,
						definition
					});
					return { formId: definition.formId };
				}
			},
			"forms.update": {
				input: updateFormSchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input;
					const validation = validateFormDefinition(input.definition);
					if (!validation.success) return {
						error: "VALIDATION_ERROR",
						detail: validation.error
					};
					const updatedDef = validation.data;
					const updateNameResult = sanitizeText(updatedDef.meta.name, {
						maxLength: 200,
						minLength: 1
					});
					if (!updateNameResult.success) return {
						error: "VALIDATION_ERROR",
						detail: updateNameResult.error.message
					};
					updatedDef.meta.name = updateNameResult.value;
					updatedDef.meta.description = stripHtml(updatedDef.meta.description).slice(0, 2e3);
					for (const field of Object.values(updatedDef.fields)) {
						field.label = stripHtml(field.label);
						field.ui.helpText = stripHtml(field.ui.helpText);
						field.ui.placeholder = stripHtml(field.ui.placeholder);
						if (field.options) for (const opt of field.options) opt.label = stripHtml(opt.label);
					}
					for (const step of updatedDef.steps) step.title = stripHtml(step.title);
					const existingItem = (await ctx.storage.forms.query({
						where: { formId: input.formId },
						limit: 1
					})).items[0];
					if (!existingItem) return { error: "NOT_FOUND" };
					const existing = existingItem.data;
					updatedDef.meta.updatedAt = nowIso();
					updatedDef.formId = input.formId;
					if (existing.createdAt) updatedDef.meta.createdAt = existing.createdAt;
					if (existing.createdBy) updatedDef.meta.createdBy = existing.createdBy;
					await ctx.storage.forms.put(input.formId, {
						...existing,
						name: updatedDef.meta.name,
						status: updatedDef.meta.status,
						updatedAt: updatedDef.meta.updatedAt,
						definition: updatedDef
					});
					return { success: true };
				}
			},
			"forms.delete": {
				input: deleteFormSchema,
				public: false,
				handler: async (ctx) => {
					const { formId } = ctx.input;
					if (!(await ctx.storage.forms.query({
						where: { formId },
						limit: 1
					})).items[0]) return { error: "NOT_FOUND" };
					await ctx.storage.forms.delete(formId);
					ctx.log.info(`Form deleted: ${formId}`);
					return { success: true };
				}
			},
			"forms.duplicate": {
				input: duplicateFormSchema,
				public: false,
				handler: async (ctx) => {
					const { formId } = ctx.input;
					const item = (await ctx.storage.forms.query({
						where: { formId },
						limit: 1
					})).items[0];
					if (!item) return { error: "NOT_FOUND" };
					const original = item.data.definition;
					const now = nowIso();
					const newId = `frm_${Date.now()}`;
					const copy = {
						...original,
						formId: newId,
						meta: {
							...original.meta,
							name: `${original.meta.name} (Copy)`,
							slug: `${original.meta.slug}-copy`,
							status: "draft",
							createdAt: now,
							updatedAt: now
						}
					};
					await ctx.storage.forms.put(newId, {
						formId: newId,
						name: copy.meta.name,
						status: copy.meta.status,
						submissionCount: 0,
						lastSubmissionAt: null,
						createdAt: copy.meta.createdAt,
						updatedAt: copy.meta.updatedAt,
						createdBy: copy.meta.createdBy,
						definition: copy
					});
					return { formId: newId };
				}
			},
			"forms.publish": {
				input: getFormSchema,
				public: false,
				handler: async (ctx) => {
					const { formId } = ctx.input;
					const item = (await ctx.storage.forms.query({
						where: { formId },
						limit: 1
					})).items[0];
					if (!item) return { error: "NOT_FOUND" };
					const record = item.data;
					const formDef = record.definition;
					const validation = validateFormDefinition(formDef);
					if (!validation.success) return {
						error: "VALIDATION_ERROR",
						detail: validation.error
					};
					formDef.meta.status = "published";
					formDef.meta.updatedAt = nowIso();
					await ctx.storage.forms.put(formId, {
						...record,
						status: "published",
						updatedAt: formDef.meta.updatedAt,
						definition: formDef
					});
					return { success: true };
				}
			},
			"forms.submit": {
				input: submitFormSchema,
				public: true,
				handler: async (ctx) => {
					const input = ctx.input;
					if (ctx.email) registerEmailChannel((msg) => ctx.email.send(msg));
					const item = (await ctx.storage.forms.query({
						where: { formId: input.formId },
						limit: 1
					})).items[0];
					if (!item) return { error: "NOT_FOUND" };
					const record = item.data;
					const formDef = record.definition;
					if (formDef.meta.status !== "published") return { error: "FORM_NOT_PUBLISHED" };
					const fieldDescriptors = Object.values(formDef.fields).filter((f) => !f.visibility.hidden && !f.visibility.disabled).map((f) => ({
						fieldId: f.id,
						type: f.type,
						label: f.label,
						required: f.validation.required,
						minLength: f.validation.minLength,
						maxLength: f.validation.maxLength,
						min: f.validation.min,
						max: f.validation.max,
						pattern: f.validation.pattern,
						format: f.validation.format,
						options: f.options
					}));
					const sanResult = sanitizeAnswers(input.answers, fieldDescriptors);
					if (!sanResult.success) return {
						error: "VALIDATION_ERROR",
						detail: sanResult.errors.map((e) => `${e.label}: ${e.message}`).join("; ")
					};
					const now = nowIso();
					const trackingCode = generateTrackingCode();
					const submissionId = `sub_${Date.now()}`;
					const userEmail = extractEmailFromSubmission(formDef, sanResult.answers);
					const submission = {
						submissionId,
						formId: input.formId,
						trackingCode,
						status: "open",
						submittedAt: now,
						submittedBy: {
							type: "guest",
							userId: null
						},
						meta: {
							ipHash: "",
							userAgent: "",
							locale: input.locale ?? "en"
						},
						answers: sanResult.answers,
						attachments: [],
						audit: [{
							at: now,
							event: "submitted",
							actor: "guest"
						}]
					};
					await ctx.storage.submissions.put(submissionId, {
						...submission,
						formName: formDef.meta.name,
						email: userEmail ?? ""
					});
					const updatedCount = Number(record.submissionCount ?? 0) + 1;
					await ctx.storage.forms.put(input.formId, {
						...record,
						submissionCount: updatedCount,
						lastSubmissionAt: now
					});
					const settings = await ctx.storage.settings.get("global") ?? {};
					const adminEmail = settings.notificationEmail ?? "";
					const tier = settings.planTier ?? "free";
					const notifications = [];
					let portalUrl = "";
					if (userEmail) try {
						const { token } = await getOrCreatePortalToken(ctx.storage, userEmail);
						portalUrl = buildPortalUrl(ctx.site?.url ?? "", token, settings.portalPagePath ?? "");
					} catch (err) {
						ctx.log.warn(`Portal token creation failed: ${String(err)}`);
					}
					if (adminEmail && EMAIL_RE.test(adminEmail)) {
						const { text, html } = buildAdminEmailBody(formDef.meta.name, trackingCode, sanResult.answers, formDef, tier);
						notifications.push({
							channel: "email",
							to: adminEmail,
							subject: `New submission: ${formDef.meta.name} [${trackingCode}]`,
							body: text,
							htmlBody: html
						});
					}
					if (userEmail) {
						const { text, html } = buildUserConfirmationBody(formDef.meta.name, trackingCode, sanResult.answers, formDef, portalUrl, tier);
						notifications.push({
							channel: "email",
							to: userEmail,
							subject: `Submission received: ${formDef.meta.name} [${trackingCode}]`,
							body: text,
							htmlBody: html
						});
					}
					dispatchAll(notifications, { log: ctx.log });
					const devPortalUrl = portalUrl && isDevEnvironment(ctx.site?.url ?? "") ? portalUrl : void 0;
					return {
						success: true,
						trackingCode,
						thankYou: formDef.workflow.thankYou,
						...devPortalUrl ? { _devPortalUrl: devPortalUrl } : {}
					};
				}
			},
			"submissions.list": {
				input: listSubmissionsSchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input;
					const where = {};
					if (input.formId) where.formId = input.formId;
					if (input.status) where.status = input.status;
					const result = await ctx.storage.submissions.query({
						where: Object.keys(where).length > 0 ? where : void 0,
						limit: input.limit,
						cursor: input.cursor,
						orderBy: { submittedAt: "desc" }
					});
					return {
						items: result.items.map(makeSubmissionListItem).filter(Boolean),
						cursor: result.cursor
					};
				}
			},
			"submissions.get": {
				input: getSubmissionSchema,
				public: false,
				handler: async (ctx) => {
					const { submissionId } = ctx.input;
					const sub = (await ctx.storage.submissions.query({
						where: { submissionId },
						limit: 1
					})).items[0];
					if (!sub) return { error: "NOT_FOUND" };
					return { submission: sub.data };
				}
			},
			"submissions.updateStatus": {
				input: updateSubmissionStatusSchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input;
					const item = (await ctx.storage.submissions.query({
						where: { submissionId: input.submissionId },
						limit: 1
					})).items[0];
					if (!item) return { error: "NOT_FOUND" };
					const existing = item.data;
					const now = nowIso();
					const audit = [...existing.audit ?? [], {
						at: now,
						event: input.status,
						actor: "admin"
					}];
					await ctx.storage.submissions.put(input.submissionId, {
						...existing,
						status: input.status,
						audit
					});
					return { success: true };
				}
			},
			"submissions.delete": {
				input: getSubmissionSchema,
				public: false,
				handler: async (ctx) => {
					const { submissionId } = ctx.input;
					if (!(await ctx.storage.submissions.query({
						where: { submissionId },
						limit: 1
					})).items[0]) return { error: "NOT_FOUND" };
					await ctx.storage.submissions.delete(submissionId);
					ctx.log.info(`Submission deleted: ${submissionId}`);
					return { success: true };
				}
			},
			"submissions.reply": {
				input: replySchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input;
					if (ctx.email) registerEmailChannel((msg) => ctx.email.send(msg));
					const subItem = (await ctx.storage.submissions.query({
						where: { submissionId: input.submissionId },
						limit: 1
					})).items[0];
					if (!subItem) return { error: "NOT_FOUND" };
					const sub = subItem.data;
					const messageId = `msg_${Date.now()}`;
					const now = nowIso();
					const bodyResult = sanitizeMessage(input.body);
					if (!bodyResult.success) return {
						error: "VALIDATION_ERROR",
						detail: bodyResult.error.message
					};
					await ctx.storage.responses.put(messageId, {
						messageId,
						submissionId: input.submissionId,
						from: "admin",
						body: bodyResult.value,
						sentAt: now,
						authorId: null
					});
					const audit = [...sub.audit ?? [], {
						at: now,
						event: "replied",
						actor: "admin"
					}];
					await ctx.storage.submissions.put(input.submissionId, {
						...sub,
						status: "read",
						audit
					});
					const userEmail = sub.email ?? "";
					if (userEmail && EMAIL_RE.test(userEmail)) {
						const formName = sub.formName ?? "Form";
						const trackingCode = sub.trackingCode ?? "";
						const replySettings = await ctx.storage.settings.get("global") ?? {};
						const replyTier = replySettings.planTier ?? "free";
						let portalUrl = "";
						try {
							const { token } = await getOrCreatePortalToken(ctx.storage, userEmail);
							portalUrl = buildPortalUrl(ctx.site?.url ?? "", token, replySettings.portalPagePath ?? "");
						} catch (err) {
							ctx.log.warn(`Portal token creation failed: ${String(err)}`);
						}
						const { text, html } = buildReplyNotificationBody(formName, trackingCode, bodyResult.value, portalUrl, replyTier);
						dispatchAll([{
							channel: "email",
							to: userEmail,
							subject: `New reply: ${formName} [${trackingCode}]`,
							body: text,
							htmlBody: html
						}], { log: ctx.log });
					}
					ctx.log.info(`Reply added to submission ${input.submissionId}`);
					return {
						success: true,
						messageId
					};
				}
			},
			"submissions.responses": {
				input: getSubmissionSchema,
				public: false,
				handler: async (ctx) => {
					const { submissionId } = ctx.input;
					return { items: (await ctx.storage.responses.query({
						where: { submissionId },
						orderBy: { sentAt: "asc" },
						limit: 100
					})).items.map((r) => r.data) };
				}
			},
			"tracking.lookup": {
				input: trackingLookupSchema,
				public: true,
				handler: async (ctx) => {
					const { trackingCode } = ctx.input;
					const item = (await ctx.storage.submissions.query({
						where: { trackingCode },
						limit: 1
					})).items[0];
					if (!item) return { error: "NOT_FOUND" };
					const sub = item.data;
					return {
						trackingCode,
						formName: sub.formName ?? "",
						status: sub.status,
						submittedAt: sub.submittedAt
					};
				}
			},
			"forms.importLegacy": {
				input: importLegacySchema,
				public: false,
				handler: async (ctx) => {
					const input = ctx.input;
					try {
						const { form, warnings } = convertLegacyEfb(input.data, { sourceVersion: input.sourceVersion });
						const validation = validateFormDefinition(form);
						if (!validation.success) return {
							error: "IMPORT_VALIDATION_ERROR",
							detail: validation.error
						};
						await ctx.storage.forms.put(form.formId, {
							formId: form.formId,
							name: form.meta.name,
							status: form.meta.status,
							submissionCount: 0,
							lastSubmissionAt: null,
							createdAt: form.meta.createdAt,
							updatedAt: form.meta.updatedAt,
							createdBy: form.meta.createdBy,
							definition: form
						});
						ctx.log.info(`Imported legacy form '${form.meta.name}' as ${form.formId}`);
						return {
							formId: form.formId,
							warnings
						};
					} catch (err) {
						ctx.log.error(`Legacy import failed: ${String(err)}`);
						return {
							error: "IMPORT_ERROR",
							detail: String(err)
						};
					}
				}
			},
			"submissions.exportCsv": {
				input: exportCsvSchema,
				public: false,
				handler: async (ctx) => {
					const { formId } = ctx.input;
					const formItem = (await ctx.storage.forms.query({
						where: { formId },
						limit: 1
					})).items[0];
					if (!formItem) return { error: "NOT_FOUND" };
					const formDef = formItem.data.definition;
					const fieldIds = formDef.steps.flatMap((s) => s.fields);
					const fieldLabels = fieldIds.map((id) => formDef.fields[id]?.label ?? id);
					const result = await ctx.storage.submissions.query({
						where: { formId },
						limit: 5e3,
						orderBy: { submittedAt: "asc" }
					});
					const rows = [];
					const header = [
						"submissionId",
						"trackingCode",
						"status",
						"submittedAt",
						...fieldLabels
					];
					rows.push(header);
					for (const item of result.items) {
						const sub = item.data;
						const answers = sub.answers ?? [];
						const answerMap = new Map(answers.map((a) => [a.fieldId, a.value]));
						const row = [
							sub.submissionId ?? "",
							sub.trackingCode ?? "",
							sub.status ?? "",
							sub.submittedAt ?? "",
							...fieldIds.map((id) => strVal(answerMap.get(id)))
						];
						rows.push(row);
					}
					return {
						csv: rows.map((r) => r.map(csvCell).join(",")).join("\n"),
						filename: `submissions-${formId}-${Date.now()}.csv`
					};
				}
			},
			"portal.requestAccess": {
				input: portalRequestAccessSchema,
				public: true,
				handler: async (ctx) => {
					const email = ctx.input.email.trim().toLowerCase();
					if (!EMAIL_RE.test(email)) return { error: "INVALID_EMAIL" };
					if (ctx.email) registerEmailChannel((msg) => ctx.email.send(msg));
					if ((await ctx.storage.submissions.query({
						where: { email },
						limit: 1
					})).items.length === 0) return { success: true };
					const { token } = await getOrCreatePortalToken(ctx.storage, email);
					const settingsData = await ctx.storage.settings.get("global") ?? {};
					const tier = settingsData.planTier ?? "free";
					const baseUrl = ctx.site?.url ?? "";
					const portalUrl = buildPortalUrl(baseUrl, token, settingsData.portalPagePath ?? "");
					const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#2271b1,#1a5a8e);padding:24px;border-radius:12px 12px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">Access Your Submissions</h2>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
    <p style="color:#374151;font-size:14px;margin:0 0 20px">Click the button below to access your submissions portal:</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${portalUrl}" style="display:inline-block;background:#2271b1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Open Portal</a>
    </div>
    <p style="color:#9ca3af;font-size:12px;margin:16px 0 0">If you didn't request this link, you can safely ignore this email.</p>
  </div>
  <div style="background:#f9fafb;padding:16px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">Sent by EmDash Forms</p>
    ${brandingHtml(tier)}
  </div>
</div>`.trim();
					dispatchAll([{
						channel: "email",
						to: email,
						subject: "Your Portal Access Link",
						body: `Access your submissions: ${portalUrl}${brandingText(tier)}`,
						htmlBody: html
					}], { log: ctx.log });
					return {
						success: true,
						...isDevEnvironment(baseUrl) ? { _devPortalUrl: portalUrl } : {}
					};
				}
			},
			"portal.verifyToken": {
				input: portalVerifyTokenSchema,
				public: true,
				handler: async (ctx) => {
					const { token } = ctx.input;
					const result = await ctx.storage.portal_tokens.query({
						where: { token },
						limit: 1
					});
					if (result.items.length === 0) return { error: "INVALID_TOKEN" };
					const item = result.items[0].data;
					if (!isTokenValid(item)) return {
						error: "TOKEN_EXPIRED",
						email: item.email
					};
					if (!item.activated) {
						const now = nowIso();
						const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1e3).toISOString();
						await ctx.storage.portal_tokens.put(item.tokenId, {
							...item,
							activated: true,
							activatedAt: now,
							expiresAt
						});
					}
					return {
						success: true,
						email: item.email
					};
				}
			},
			"portal.submissions": {
				input: portalListSubmissionsSchema,
				public: true,
				handler: async (ctx) => {
					const input = ctx.input;
					const tokenResult = await ctx.storage.portal_tokens.query({
						where: { token: input.token },
						limit: 1
					});
					if (tokenResult.items.length === 0) return { error: "INVALID_TOKEN" };
					const tokenData = tokenResult.items[0].data;
					if (!isTokenValid(tokenData) || tokenData.email !== input.email) return { error: "UNAUTHORIZED" };
					const where = { email: input.email };
					if (input.status) where.status = input.status;
					const result = await ctx.storage.submissions.query({
						where,
						limit: input.limit,
						cursor: input.cursor,
						orderBy: { submittedAt: "desc" }
					});
					return {
						items: result.items.map(makeSubmissionListItem).filter(Boolean),
						cursor: result.cursor
					};
				}
			},
			"portal.submissionDetail": {
				input: portalGetSubmissionSchema,
				public: true,
				handler: async (ctx) => {
					const input = ctx.input;
					const tokenResult = await ctx.storage.portal_tokens.query({
						where: { token: input.token },
						limit: 1
					});
					if (tokenResult.items.length === 0) return { error: "INVALID_TOKEN" };
					const tokenData = tokenResult.items[0].data;
					if (!isTokenValid(tokenData) || tokenData.email !== input.email) return { error: "UNAUTHORIZED" };
					const subResult = await ctx.storage.submissions.query({
						where: { submissionId: input.submissionId },
						limit: 1
					});
					if (subResult.items.length === 0) return { error: "NOT_FOUND" };
					const sub = subResult.items[0].data;
					if (sub.email !== input.email) return { error: "UNAUTHORIZED" };
					const respResult = await ctx.storage.responses.query({
						where: { submissionId: input.submissionId },
						orderBy: { sentAt: "asc" },
						limit: 100
					});
					const formResult = await ctx.storage.forms.query({
						where: { formId: sub.formId },
						limit: 1
					});
					let fieldLabels = {};
					if (formResult.items.length > 0) {
						const formDef = formResult.items[0].data.definition;
						for (const [id, field] of Object.entries(formDef.fields)) fieldLabels[id] = field.label;
					}
					return {
						submission: {
							submissionId: sub.submissionId,
							formId: sub.formId,
							formName: sub.formName,
							trackingCode: sub.trackingCode,
							status: sub.status,
							submittedAt: sub.submittedAt,
							answers: sub.answers
						},
						responses: respResult.items.map((r) => r.data),
						fieldLabels
					};
				}
			},
			"portal.reply": {
				input: portalReplySchema,
				public: true,
				handler: async (ctx) => {
					const input = ctx.input;
					if (ctx.email) registerEmailChannel((msg) => ctx.email.send(msg));
					const tokenResult = await ctx.storage.portal_tokens.query({
						where: { token: input.token },
						limit: 1
					});
					if (tokenResult.items.length === 0) return { error: "INVALID_TOKEN" };
					const tokenData = tokenResult.items[0].data;
					if (!isTokenValid(tokenData) || tokenData.email !== input.email) return { error: "UNAUTHORIZED" };
					const subResult = await ctx.storage.submissions.query({
						where: { submissionId: input.submissionId },
						limit: 1
					});
					if (subResult.items.length === 0) return { error: "NOT_FOUND" };
					const sub = subResult.items[0].data;
					if (sub.email !== input.email) return { error: "UNAUTHORIZED" };
					const bodyResult = sanitizeMessage(input.body);
					if (!bodyResult.success) return {
						error: "VALIDATION_ERROR",
						detail: bodyResult.error.message
					};
					const messageId = `msg_${Date.now()}`;
					const now = nowIso();
					await ctx.storage.responses.put(messageId, {
						messageId,
						submissionId: input.submissionId,
						from: "guest",
						body: bodyResult.value,
						sentAt: now,
						authorId: null
					});
					const audit = [...sub.audit ?? [], {
						at: now,
						event: "replied",
						actor: "guest"
					}];
					await ctx.storage.submissions.put(input.submissionId, {
						...sub,
						status: "open",
						audit
					});
					const adminEmail = (await ctx.storage.settings.get("global") ?? {}).notificationEmail ?? "";
					if (adminEmail && EMAIL_RE.test(adminEmail)) {
						const formName = sub.formName ?? "Form";
						const trackingCode = sub.trackingCode ?? "";
						const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#2271b1,#1a5a8e);padding:24px;border-radius:12px 12px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">New User Reply</h2>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">${formName} — ${trackingCode}</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
    <div style="background:#fff7ed;padding:16px;border-radius:8px;border-left:4px solid #f59e0b;margin-bottom:16px">
      <p style="font-size:12px;color:#6b7280;margin:0 0 4px">From: ${input.email}</p>
      <p style="color:#374151;font-size:14px;margin:0;white-space:pre-wrap">${bodyResult.value}</p>
    </div>
  </div>
  <div style="background:#f9fafb;padding:16px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">Sent by EmDash Forms</p>
  </div>
</div>`.trim();
						dispatchAll([{
							channel: "email",
							to: adminEmail,
							subject: `User reply: ${formName} [${trackingCode}]`,
							body: `New reply from ${input.email}:\n\n${bodyResult.value}`,
							htmlBody: html
						}], { log: ctx.log });
					}
					ctx.log.info(`Guest reply added to submission ${input.submissionId}`);
					return {
						success: true,
						messageId
					};
				}
			},
			"portal.resendLink": {
				input: portalResendLinkSchema,
				public: true,
				handler: async (ctx) => {
					const email = ctx.input.email.trim().toLowerCase();
					if (!EMAIL_RE.test(email)) return { error: "INVALID_EMAIL" };
					if (ctx.email) registerEmailChannel((msg) => ctx.email.send(msg));
					const oldTokens = await ctx.storage.portal_tokens.query({
						where: { email },
						limit: 10
					});
					for (const item of oldTokens.items) {
						const id = item.id;
						await ctx.storage.portal_tokens.delete(id);
					}
					const tokenId = `ptk_${Date.now()}`;
					const token = generatePortalToken();
					const now = nowIso();
					await ctx.storage.portal_tokens.put(tokenId, {
						tokenId,
						email,
						token,
						createdAt: now,
						expiresAt: null,
						activated: false,
						activatedAt: null
					});
					const portalUrl = buildPortalUrl(ctx.site?.url ?? "", token, (await ctx.storage.settings.get("global") ?? {}).portalPagePath ?? "");
					const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#2271b1,#1a5a8e);padding:24px;border-radius:12px 12px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">New Access Link</h2>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
    <p style="color:#374151;font-size:14px;margin:0 0 20px">Here's your new access link to view your submissions:</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${portalUrl}" style="display:inline-block;background:#2271b1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Open Portal</a>
    </div>
  </div>
  <div style="background:#f9fafb;padding:16px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">Sent by EmDash Forms</p>
  </div>
</div>`.trim();
					dispatchAll([{
						channel: "email",
						to: email,
						subject: "Your New Portal Access Link",
						body: `Access your submissions: ${portalUrl}`,
						htmlBody: html
					}], { log: ctx.log });
					return { success: true };
				}
			},
			"portal.settings": {
				public: true,
				handler: async (ctx) => {
					const settings = await ctx.storage.settings.get("global") ?? {};
					const tier = settings.planTier ?? "free";
					return {
						portalEnabled: settings.portalEnabled ?? true,
						portalTitle: settings.portalTitle ?? "Support Portal",
						portalWelcomeMessage: settings.portalWelcomeMessage ?? "",
						portalDefaultLocale: settings.portalDefaultLocale ?? "en",
						portalBrandColor: settings.portalBrandColor ?? "",
						portalLoginDescription: settings.portalLoginDescription ?? "",
						planTier: tier,
						branding: tier === "pro" ? null : {
							text: `Powered by ${PLUGIN_DISPLAY_NAME} · made by ${BRAND_TEAM}`,
							pluginName: PLUGIN_DISPLAY_NAME,
							pluginUrl: PLUGIN_URL,
							teamName: BRAND_TEAM,
							teamUrl: BRAND_URL
						}
					};
				}
			}
		}
	});
}

//#endregion
export { convertLegacyEfb, createPlugin, createPlugin as default, dispatchAll, formsBuilderPlugin, generateTrackingCode, getAllTemplates, getBuilderGroups, getFieldMeta, getTemplate, registerChannel, registerEmailChannel, validateFormDefinition };
//# sourceMappingURL=index.mjs.map