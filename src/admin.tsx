/**
 * Forms Builder Plugin — Admin UI
 *
 * Four-section interface with a top navigation menu:
 *   1. Create Form — template picker + drag-and-drop builder
 *   2. My Forms — list of all created forms
 *   3. Responses — submission inbox with detail expansion
 *   4. Settings — plugin-level configuration
 *
 * Based on Easy Form Builder v4 features and efb-md spec.
 * Stack: React + Tailwind (EmDash default).
 * Colors: Uses EmDash kumo CSS custom properties for brand consistency.
 */

import type { MessageDescriptor } from "@lingui/core";
import { useLingui } from "@lingui/react";

/**
 * Runtime-only replacement for `@lingui/core/macro`'s `msg` template tag.
 *
 * The official `msg` is a Babel-time macro that expands to a `MessageDescriptor`
 * via `@lingui/babel-plugin-lingui-macro`. EmDash's Vite integration only runs
 * the Lingui macro transform over `@emdash-cms/admin/src` — not over plugin
 * source in `node_modules`. So any plugin that ships with `@lingui/core/macro`
 * imports will fail at runtime with:
 *   "does not provide an export named 'msg'"
 *
 * By providing a local tagged-template helper that produces an equivalent
 * `{ id, message }` descriptor, this plugin is portable to any EmDash host
 * without requiring the consumer to configure Babel macros themselves.
 */
function msg(strings: TemplateStringsArray, ...values: unknown[]): MessageDescriptor {
	let out = strings[0] ?? "";
	for (let i = 0; i < values.length; i++) {
		out += String(values[i]) + (strings[i + 1] ?? "");
	}
	return { id: out, message: out };
}
import {
	FilePlus,
	Envelope,
	EnvelopeSimple,
	CreditCard,
	Headset,
	ChartBar,
	ChatCircle,
	SignIn,
	HandCoins,
	PlusCircle,
	MagnifyingGlass,
	NotePencil,
	GearSix,
	ClipboardText,
} from "@phosphor-icons/react";
import type { PluginAdminExports } from "emdash";
import * as React from "react";

import { buildFormDefinition } from "./admin/buildFormDefinition.js";
import { FormBuilder } from "./admin/FormBuilder.js";
import { FormsListSection } from "./admin/FormsListSection.js";
import { ResponsesSection } from "./admin/ResponsesSection.js";
import { SettingsSection } from "./admin/SettingsSection.js";

// =============================================================================
// Types
// =============================================================================

type AppView = "templates" | "builder";
type NavSection = "create" | "forms" | "responses" | "settings";
type TemplateCategoryId = "all" | "new" | "contact" | "payment" | "support" | "survey" | "signin";

// =============================================================================
// Template Card Data
// =============================================================================

interface TemplateCardData {
	id: string;
	name: MessageDescriptor;
	category: TemplateCategoryId;
	description: MessageDescriptor;
	hasPreview: boolean;
	icon: React.ComponentType<{ className?: string; weight?: string }>;
}

const TEMPLATE_CARDS: TemplateCardData[] = [
	{
		id: "blank",
		name: msg`New Form`,
		category: "new",
		description: msg`Start a form from scratch with one or multiple steps. Full control over every field and setting.`,
		hasPreview: false,
		icon: FilePlus,
	},
	{
		id: "contact",
		name: msg`Contact Us Form`,
		category: "contact",
		description: msg`Professional contact form with name, email, and message fields. Email notifications included.`,
		hasPreview: true,
		icon: Envelope,
	},
	{
		id: "payment",
		name: msg`Payment Form`,
		category: "payment",
		description: msg`Collect online payments with Stripe or PayPal integration. Secure and professional.`,
		hasPreview: false,
		icon: CreditCard,
	},
	{
		id: "support",
		name: msg`Support Form`,
		category: "support",
		description: msg`Support ticket form with priority levels and detailed descriptions for your help desk.`,
		hasPreview: false,
		icon: Headset,
	},
	{
		id: "survey",
		name: msg`Survey`,
		category: "survey",
		description: msg`Create surveys, polls, or questionnaires with star ratings and NPS scoring.`,
		hasPreview: false,
		icon: ChartBar,
	},
	{
		id: "contact-template",
		name: msg`Contact Us Template`,
		category: "contact",
		description: msg`Pre-designed Contact Us template with professional styling, ready to publish instantly.`,
		hasPreview: true,
		icon: EnvelopeSimple,
	},
	{
		id: "signin",
		name: msg`Sign-In / Sign-Up`,
		category: "signin",
		description: msg`Authentication forms for user sign-in and registration with validation built in.`,
		hasPreview: false,
		icon: SignIn,
	},
	{
		id: "feedback",
		name: msg`Feedback Form`,
		category: "survey",
		description: msg`Collect customer feedback with star ratings, NPS scores, and open-ended comments.`,
		hasPreview: true,
		icon: ChatCircle,
	},
	{
		id: "order",
		name: msg`Order Form`,
		category: "payment",
		description: msg`Product order form with quantities, pricing, and payment gateway integration.`,
		hasPreview: false,
		icon: HandCoins,
	},
];

const TEMPLATE_CATEGORIES: { id: TemplateCategoryId; label: MessageDescriptor }[] = [
	{ id: "all", label: msg`All` },
	{ id: "new", label: msg`New` },
	{ id: "contact", label: msg`Contact Us` },
	{ id: "payment", label: msg`Payment` },
	{ id: "support", label: msg`Support` },
	{ id: "survey", label: msg`Survey` },
	{ id: "signin", label: msg`Sign-In/Up` },
];

// =============================================================================
// Navigation Items
// =============================================================================

interface NavItem {
	id: NavSection;
	label: string;
	icon: React.ComponentType<{ className?: string; weight?: string }>;
}

const NAV_ITEMS: NavItem[] = [
	{ id: "create", label: "EmForm Builder", icon: PlusCircle },
	{ id: "forms", label: "My Forms", icon: ClipboardText },
	{ id: "responses", label: "Responses", icon: ChatCircle },
	{ id: "settings", label: "Settings", icon: GearSix },
];

// =============================================================================
// Header with Navigation
// =============================================================================

function AppHeader({
	activeSection,
	onSectionChange,
	children,
}: {
	activeSection: NavSection;
	onSectionChange: (section: NavSection) => void;
	children?: React.ReactNode;
}) {
	return (
		<header
			className="relative overflow-hidden"
			style={{
				background:
					"linear-gradient(135deg, var(--color-kumo-base) 0%, var(--color-kumo-info-tint) 50%, var(--color-kumo-elevated) 100%)",
			}}
		>
			{/* Decorative circles */}
			<div
				className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-15"
				style={{ backgroundColor: "var(--color-kumo-brand)" }}
			/>
			<div
				className="absolute top-8 -right-8 w-48 h-48 rounded-full opacity-10"
				style={{ backgroundColor: "var(--color-kumo-danger)" }}
			/>
			<div
				className="absolute -top-24 right-32 w-36 h-36 rounded-full opacity-8"
				style={{ backgroundColor: "var(--color-kumo-info)" }}
			/>

			<div className="relative max-w-6xl mx-auto px-6 pt-6 pb-0">
				{/* Navigation tabs */}
				<nav className="flex items-center gap-2 -mb-px overflow-x-auto">
					{NAV_ITEMS.map((item) => {
						const Icon = item.icon;
						const isActive = activeSection === item.id;
						return (
							<button
								key={item.id}
								onClick={() => onSectionChange(item.id)}
								className="relative flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200"
								style={{
									background: isActive ? "rgba(255,255,255,0.45)" : "none",
									border: "none",
									borderRadius: "10px 10px 0 0",
									cursor: "pointer",
									color: isActive ? "var(--color-kumo-brand)" : "var(--text-color-kumo-subtle)",
								}}
							>
								<Icon className="h-4 w-4" />
								{item.label}
								{/* Active bottom bar */}
								{isActive && (
									<div
										style={{
											position: "absolute",
											bottom: 0,
											left: 0,
											right: 0,
											height: 3,
											backgroundColor: "var(--color-kumo-brand)",
											borderRadius: "3px 3px 0 0",
										}}
									/>
								)}
							</button>
						);
					})}
				</nav>
			</div>

			{/* Optional section-specific content in the header (e.g. search bar) */}
			{children && (
				<div
					style={{
						backgroundColor: "rgba(255,255,255,0.25)",
						borderTop: "1px solid rgba(255,255,255,0.3)",
					}}
				>
					<div className="relative max-w-6xl mx-auto px-6 py-4">{children}</div>
				</div>
			)}
		</header>
	);
}

// =============================================================================
// Templates Landing View
// =============================================================================

function TemplatesView({
	onCreateForm,
	search,
	activeCategory,
}: {
	onCreateForm: (templateId: string) => void;
	search: string;
	activeCategory: TemplateCategoryId;
}) {
	const { _ } = useLingui();

	const filtered = React.useMemo(() => {
		return TEMPLATE_CARDS.filter((t) => {
			const byCat = activeCategory === "all" || t.category === activeCategory;
			const bySearch =
				!search ||
				_(t.name).toLowerCase().includes(search.toLowerCase()) ||
				_(t.description).toLowerCase().includes(search.toLowerCase());
			return byCat && bySearch;
		});
	}, [activeCategory, search, _]);

	return (
		<>
			{/* Card Grid */}
			<div className="max-w-6xl mx-auto px-6 py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filtered.map((template) => {
						const IconComp = template.icon;
						return (
							<div
								key={template.id}
								className="overflow-hidden transition-all duration-300 hover:-translate-y-1"
								style={{
									backgroundColor: "var(--color-kumo-base)",
									borderRadius: "20px",
									boxShadow: "0 2px 30px rgba(0,0,0,0.08)",
								}}
							>
								{/* Top accent stripe */}
								<div className="h-1" style={{ backgroundColor: "var(--color-kumo-brand)" }} />
								<div className="p-6">
									{/* Icon + Title */}
									<div className="flex items-center gap-3 mb-4">
										<IconComp
											className="h-7 w-7 flex-shrink-0"
											style={{ color: "var(--color-kumo-danger)" }}
										/>
										<h3
											className="text-lg font-bold"
											style={{ color: "var(--text-color-kumo-default)" }}
										>
											{_(template.name)}
										</h3>
									</div>

									{/* Description */}
									<p
										className="text-sm leading-relaxed mb-6 min-h-[3.5rem]"
										style={{ color: "var(--text-color-kumo-subtle)" }}
									>
										{_(template.description)}
									</p>

									{/* Actions */}
									<div className="flex items-center gap-3 justify-end">
										{template.id === "blank" || template.id === "contact" ? (
											<button
												onClick={() => onCreateForm(template.id)}
												className="px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-90 inline-flex items-center gap-2"
												style={{
													backgroundColor: "var(--color-kumo-brand)",
													color: "var(--color-kumo-base)",
													borderRadius: "100px",
													boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
												}}
											>
												<PlusCircle className="h-4 w-4" />
												{_(msg`Create`)}
											</button>
										) : (
											<button
												disabled
												className="px-6 py-2.5 text-sm font-semibold inline-flex items-center gap-2 cursor-not-allowed"
												style={{
													backgroundColor: "var(--color-kumo-line)",
													color: "var(--text-color-kumo-inactive)",
													borderRadius: "100px",
													opacity: 0.7,
												}}
											>
												{_(msg`Coming Soon`)}
											</button>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{filtered.length === 0 && (
					<div className="text-center py-20">
						<div
							className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
							style={{ backgroundColor: "var(--color-kumo-elevated)" }}
						>
							<MagnifyingGlass
								className="h-7 w-7"
								style={{ color: "var(--text-color-kumo-inactive)" }}
							/>
						</div>
						<p className="text-sm font-medium" style={{ color: "var(--text-color-kumo-subtle)" }}>
							{_(msg`No templates found`)}
						</p>
						<p className="text-xs mt-1" style={{ color: "var(--text-color-kumo-inactive)" }}>
							{_(msg`Try a different search term or category`)}
						</p>
					</div>
				)}
			</div>
		</>
	);
}

// =============================================================================
// Templates Header Content (search + category pills inside the header)
// =============================================================================

function TemplatesHeaderContent({
	search,
	onSearchChange,
	activeCategory,
	onCategoryChange,
}: {
	search: string;
	onSearchChange: (value: string) => void;
	activeCategory: TemplateCategoryId;
	onCategoryChange: (id: TemplateCategoryId) => void;
}) {
	const { _ } = useLingui();
	return (
		<div className="flex flex-col items-center gap-4">
			{/* Search row */}
			<div className="flex items-center justify-center gap-3">
				<div className="relative">
					<MagnifyingGlass
						className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
						style={{ color: "var(--text-color-kumo-inactive)" }}
					/>
					<input
						type="text"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder={_(msg`Search templates...`)}
						className="w-72 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2"
						style={{
							border: "1px solid var(--color-kumo-line)",
							backgroundColor: "var(--color-kumo-control)",
							color: "var(--text-color-kumo-default)",
							borderRadius: "12px",
						}}
					/>
				</div>
			</div>

			{/* Category pills */}
			<div className="flex items-center justify-center gap-2 flex-wrap">
				{TEMPLATE_CATEGORIES.map((cat) => (
					<button
						key={cat.id}
						onClick={() => onCategoryChange(cat.id)}
						className="px-4 py-1.5 text-xs font-medium transition-all duration-200"
						style={{
							borderRadius: "100px",
							backgroundColor:
								activeCategory === cat.id ? "var(--color-kumo-brand)" : "rgba(255,255,255,0.5)",
							color:
								activeCategory === cat.id
									? "var(--color-kumo-base)"
									: "var(--text-color-kumo-subtle)",
							boxShadow: activeCategory === cat.id ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
						}}
					>
						{_(cat.label)}
					</button>
				))}
			</div>
		</div>
	);
}

// =============================================================================
// Forms Header Content (search + status pills inside the header)
// =============================================================================

const FORM_STATUS_FILTERS = ["all", "draft", "published", "archived"] as const;

function FormsHeaderContent({
	search,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
}: {
	search: string;
	onSearchChange: (value: string) => void;
	statusFilter: string;
	onStatusFilterChange: (status: string) => void;
}) {
	return (
		<div className="flex flex-col items-center gap-4">
			<div className="flex items-center justify-center gap-3">
				<div className="relative">
					<MagnifyingGlass
						className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
						style={{ color: "var(--text-color-kumo-inactive)" }}
					/>
					<input
						type="text"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="Search forms..."
						className="w-72 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2"
						style={{
							border: "1px solid var(--color-kumo-line)",
							backgroundColor: "var(--color-kumo-control)",
							color: "var(--text-color-kumo-default)",
							borderRadius: "12px",
						}}
					/>
				</div>
			</div>
			<div className="flex items-center justify-center gap-2 flex-wrap">
				{FORM_STATUS_FILTERS.map((s) => (
					<button
						key={s}
						onClick={() => onStatusFilterChange(s)}
						className="px-4 py-1.5 text-xs font-medium transition-all duration-200"
						style={{
							borderRadius: "100px",
							backgroundColor:
								statusFilter === s ? "var(--color-kumo-brand)" : "rgba(255,255,255,0.5)",
							color:
								statusFilter === s ? "var(--color-kumo-base)" : "var(--text-color-kumo-subtle)",
							boxShadow: statusFilter === s ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
						}}
					>
						{s.charAt(0).toUpperCase() + s.slice(1)}
					</button>
				))}
			</div>
		</div>
	);
}

// =============================================================================
// Responses Header Content (search + status pills inside the header)
// =============================================================================

const RESPONSE_STATUS_FILTERS = ["all", "open", "read", "closed"] as const;

function ResponsesHeaderContent({
	search,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
}: {
	search: string;
	onSearchChange: (value: string) => void;
	statusFilter: string;
	onStatusFilterChange: (status: string) => void;
}) {
	return (
		<div className="flex flex-col items-center gap-4">
			<div className="flex items-center justify-center gap-3">
				<div className="relative">
					<MagnifyingGlass
						className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
						style={{ color: "var(--text-color-kumo-inactive)" }}
					/>
					<input
						type="text"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="Search by form name or tracking code..."
						className="w-80 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2"
						style={{
							border: "1px solid var(--color-kumo-line)",
							backgroundColor: "var(--color-kumo-control)",
							color: "var(--text-color-kumo-default)",
							borderRadius: "12px",
						}}
					/>
				</div>
			</div>
			<div className="flex items-center justify-center gap-2 flex-wrap">
				{RESPONSE_STATUS_FILTERS.map((s) => (
					<button
						key={s}
						onClick={() => onStatusFilterChange(s)}
						className="px-4 py-1.5 text-xs font-medium transition-all duration-200"
						style={{
							borderRadius: "100px",
							backgroundColor:
								statusFilter === s ? "var(--color-kumo-brand)" : "rgba(255,255,255,0.5)",
							color:
								statusFilter === s ? "var(--color-kumo-base)" : "var(--text-color-kumo-subtle)",
							boxShadow: statusFilter === s ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
						}}
					>
						{s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
					</button>
				))}
			</div>
		</div>
	);
}

// =============================================================================
// Main Entry Point
// =============================================================================

function CreatePage() {
	const [section, setSection] = React.useState<NavSection>("create");
	const [view, setView] = React.useState<AppView>("templates");
	const [selectedTemplate, setSelectedTemplate] = React.useState("blank");
	const [editFormId, setEditFormId] = React.useState<string | null>(null);
	// Lifted state for all sections
	const [templateSearch, setTemplateSearch] = React.useState("");
	const [templateCategory, setTemplateCategory] = React.useState<TemplateCategoryId>("all");
	const [formsSearch, setFormsSearch] = React.useState("");
	const [formsStatus, setFormsStatus] = React.useState("all");
	const [responsesSearch, setResponsesSearch] = React.useState("");
	const [responsesStatus, setResponsesStatus] = React.useState("all");

	const handleCreateForm = React.useCallback((templateId: string) => {
		setSelectedTemplate(templateId);
		setEditFormId(null);
		setView("builder");
	}, []);

	const handleBackToTemplates = React.useCallback(() => {
		setEditFormId(null);
		setView("templates");
	}, []);

	const handleEditForm = React.useCallback((formId: string) => {
		setEditFormId(formId);
		setSection("create");
		setView("builder");
	}, []);

	const handleSave = React.useCallback(
		async (data: {
			formId: string | null;
			name: string;
			description: string;
			fields: import("./admin/types.js").CanvasField[];
			submitButton?: import("./admin/types.js").SubmitButtonConfig;
			afterSubmit?: import("./admin/types.js").AfterSubmitConfig;
		}) => {
			if (data.formId) {
				// Update existing form
				const definition = buildFormDefinition(
					data.formId,
					data.name,
					data.description,
					data.fields,
					data.submitButton,
					data.afterSubmit,
				);
				const res = await fetch("/_emdash/api/plugins/emdash-form-builder/forms.update", {
					method: "POST",
					headers: { "Content-Type": "application/json", "X-EmDash-Request": "1" },
					body: JSON.stringify({ formId: data.formId, definition }),
				});
				if (!res.ok) {
					const body = await res.json().catch(() => ({}));
					const errMsg =
						(body as { error?: { message?: string } })?.error?.message ||
						`Save failed: ${res.statusText}`;
					throw new Error(errMsg);
				}
				return { formId: data.formId };
			} else {
				// Create new form
				const createRes = await fetch("/_emdash/api/plugins/emdash-form-builder/forms.create", {
					method: "POST",
					headers: { "Content-Type": "application/json", "X-EmDash-Request": "1" },
					body: JSON.stringify({
						name: data.name,
						description: data.description,
						templateId: `tpl_${selectedTemplate}`,
					}),
				});
				if (!createRes.ok) {
					const body = await createRes.json().catch(() => ({}));
					throw new Error(
						(body as { error?: { message?: string } })?.error?.message || "Failed to create form",
					);
				}
				const createData = (await createRes.json()) as {
					data?: { formId?: string; error?: string };
				};
				if (createData.data?.error) {
					throw new Error(`Form creation failed: ${createData.data.error}`);
				}
				const newFormId = createData.data?.formId;
				if (!newFormId) throw new Error("No form ID returned");

				// Update with builder fields
				const definition = buildFormDefinition(
					newFormId,
					data.name,
					data.description,
					data.fields,
					data.submitButton,
					data.afterSubmit,
				);
				const updateRes = await fetch("/_emdash/api/plugins/emdash-form-builder/forms.update", {
					method: "POST",
					headers: { "Content-Type": "application/json", "X-EmDash-Request": "1" },
					body: JSON.stringify({ formId: newFormId, definition }),
				});
				if (!updateRes.ok) {
					const body = await updateRes.json().catch(() => ({}));
					throw new Error(
						(body as { error?: { message?: string } })?.error?.message ||
							"Failed to save form definition",
					);
				}
				return { formId: newFormId };
			}
		},
		[selectedTemplate],
	);

	if (section === "create" && view === "builder") {
		return (
			<FormBuilder
				key={editFormId || selectedTemplate}
				templateId={selectedTemplate}
				editFormId={editFormId ?? undefined}
				onBack={handleBackToTemplates}
				onSave={handleSave}
			/>
		);
	}

	return (
		<div className="min-h-screen" style={{ backgroundColor: "var(--color-kumo-elevated)" }}>
			<AppHeader activeSection={section} onSectionChange={setSection}>
				{section === "create" && (
					<TemplatesHeaderContent
						search={templateSearch}
						onSearchChange={setTemplateSearch}
						activeCategory={templateCategory}
						onCategoryChange={setTemplateCategory}
					/>
				)}
				{section === "forms" && (
					<FormsHeaderContent
						search={formsSearch}
						onSearchChange={setFormsSearch}
						statusFilter={formsStatus}
						onStatusFilterChange={setFormsStatus}
					/>
				)}
				{section === "responses" && (
					<ResponsesHeaderContent
						search={responsesSearch}
						onSearchChange={setResponsesSearch}
						statusFilter={responsesStatus}
						onStatusFilterChange={setResponsesStatus}
					/>
				)}
			</AppHeader>
			{section === "create" && (
				<TemplatesView
					onCreateForm={handleCreateForm}
					search={templateSearch}
					activeCategory={templateCategory}
				/>
			)}
			{section === "forms" && (
				<FormsListSection
					onEditForm={handleEditForm}
					search={formsSearch}
					statusFilter={formsStatus}
				/>
			)}
			{section === "responses" && (
				<ResponsesSection search={responsesSearch} statusFilter={responsesStatus} />
			)}
			{section === "settings" && <SettingsSection />}
		</div>
	);
}

// =============================================================================
// Widget
// =============================================================================

function SummaryWidget() {
	const { _ } = useLingui();
	return (
		<div className="space-y-2 text-sm">
			<div className="inline-flex items-center gap-2 text-muted-foreground">
				<NotePencil className="h-4 w-4" />
				<span>{_(msg`EmForm Builder`)}</span>
			</div>
			<p className="text-xs text-muted-foreground">
				{_(msg`Create and manage forms with drag-and-drop builder.`)}
			</p>
		</div>
	);
}

// =============================================================================
// Exports
// =============================================================================

export const widgets: PluginAdminExports["widgets"] = {
	summary: SummaryWidget,
};

export const pages: PluginAdminExports["pages"] = {
	"/": CreatePage,
};
