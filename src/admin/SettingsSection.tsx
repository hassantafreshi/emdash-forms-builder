/**
 * Forms Builder — Settings Section
 *
 * Plugin-level settings grouped into logical sections with dirty-state tracking.
 * Save bar only shows when there are unsaved changes.
 */

import {
	Bell,
	ClockClockwise,
	Trash,
	ShieldCheck,
	FloppyDisk,
	Check,
	Warning,
	Infinity as InfinityIcon,
	ArrowCounterClockwise,
	PencilSimple,
	GlobeSimple,
	Palette,
	Translate,
	Crown,
	Swatches,
	MagnifyingGlass,
	CheckCircle,
	Info,
	Link,
} from "@phosphor-icons/react";
import * as React from "react";

import { apiFetch, getErrorMessage } from "./api.js";
import { LoadingSpinner } from "./LoadingSpinner.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SettingsData {
	notificationEmail: string;
	trackingStyle: "date_en_mix" | "sequential" | "uuid";
	autoDeleteDays: number;
	captchaEnabled: boolean;
	portalEnabled: boolean;
	portalTitle: string;
	portalDefaultLocale: string;
	portalBrandColor: string;
	portalLoginDescription: string;
	portalPagePath: string;
	planTier: "free" | "pro";
	formAccentColor: string;
	formBgColor: string;
	formTextColor: string;
	formBorderRadius: string;
	formFontSize: string;
	formButtonStyle: "filled" | "outline" | "ghost";
}

const LOCALE_OPTIONS = [
	{ value: "en", label: "English" },
	{ value: "fa", label: "فارسی (Persian)" },
	{ value: "ar", label: "العربية (Arabic)" },
	{ value: "tr", label: "Türkçe (Turkish)" },
];

const TRACKING_OPTIONS = [
	{
		value: "date_en_mix" as const,
		label: "Date Mixed",
		description: "Date prefix + random suffix",
		example: "20260419-A3X",
	},
	{
		value: "sequential" as const,
		label: "Sequential",
		description: "Auto-incrementing number",
		example: "#0001",
	},
	{
		value: "uuid" as const,
		label: "UUID",
		description: "Universally unique ID",
		example: "a1b2c3d4…",
	},
];

const RETENTION_PRESETS = [
	{ days: 0, label: "Keep forever" },
	{ days: 30, label: "30 days" },
	{ days: 60, label: "60 days" },
	{ days: 90, label: "90 days" },
	{ days: 180, label: "6 months" },
	{ days: 365, label: "1 year" },
];

const BUTTON_STYLE_OPTIONS = [
	{ value: "filled" as const, label: "Filled", description: "Solid background" },
	{ value: "outline" as const, label: "Outline", description: "Border only" },
	{ value: "ghost" as const, label: "Ghost", description: "No border" },
];

const DEFAULT_SETTINGS: SettingsData = {
	notificationEmail: "",
	trackingStyle: "date_en_mix",
	autoDeleteDays: 90,
	captchaEnabled: false,
	portalEnabled: true,
	portalTitle: "Support Portal",
	portalDefaultLocale: "en",
	portalBrandColor: "",
	portalLoginDescription: "",
	portalPagePath: "",
	planTier: "free",
	formAccentColor: "",
	formBgColor: "",
	formTextColor: "",
	formBorderRadius: "12px",
	formFontSize: "14px",
	formButtonStyle: "filled",
};

function settingsEqual(a: SettingsData, b: SettingsData): boolean {
	return (
		a.notificationEmail === b.notificationEmail &&
		a.trackingStyle === b.trackingStyle &&
		a.autoDeleteDays === b.autoDeleteDays &&
		a.captchaEnabled === b.captchaEnabled &&
		a.portalEnabled === b.portalEnabled &&
		a.portalTitle === b.portalTitle &&
		a.portalDefaultLocale === b.portalDefaultLocale &&
		a.portalBrandColor === b.portalBrandColor &&
		a.portalLoginDescription === b.portalLoginDescription &&
		a.portalPagePath === b.portalPagePath &&
		a.planTier === b.planTier &&
		a.formAccentColor === b.formAccentColor &&
		a.formBgColor === b.formBgColor &&
		a.formTextColor === b.formTextColor &&
		a.formBorderRadius === b.formBorderRadius &&
		a.formFontSize === b.formFontSize &&
		a.formButtonStyle === b.formButtonStyle
	);
}

export function SettingsSection() {
	const [loading, setLoading] = React.useState(true);
	const [saving, setSaving] = React.useState(false);
	const [saved, setSaved] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [settings, setSettings] = React.useState<SettingsData>(DEFAULT_SETTINGS);
	const [initial, setInitial] = React.useState<SettingsData | null>(null);
	const [customDays, setCustomDays] = React.useState(false);
	const [emailTouched, setEmailTouched] = React.useState(false);

	// Portal page selector state
	const [collections, setCollections] = React.useState<Array<{ slug: string; label: string }>>([]);
	const [selectedCollection, setSelectedCollection] = React.useState("");
	const [contentItems, setContentItems] = React.useState<
		Array<{ id: string; title: string; slug: string }>
	>([]);
	const [selectedContentId, setSelectedContentId] = React.useState("");
	const [loadingContent, setLoadingContent] = React.useState(false);
	const [blockCheckStatus, setBlockCheckStatus] = React.useState<
		"idle" | "checking" | "found" | "not_found"
	>("idle");
	const [checkedPageSlug, setCheckedPageSlug] = React.useState("");

	const emailInvalid =
		emailTouched &&
		settings.notificationEmail.length > 0 &&
		!EMAIL_RE.test(settings.notificationEmail);

	const isDirty = initial !== null && !settingsEqual(settings, initial);

	React.useEffect(() => {
		let cancelled = false;
		async function load() {
			try {
				const res = await apiFetch("settings.get");
				if (!res.ok) {
					if (!cancelled) {
						setInitial(DEFAULT_SETTINGS);
						setLoading(false);
					}
					return;
				}
				const body = await res.json();
				if (!cancelled && body.data) {
					const merged = { ...DEFAULT_SETTINGS, ...body.data };
					setSettings(merged);
					setInitial(merged);
				}
			} catch {
				// Use defaults on network error
				if (!cancelled) setInitial(DEFAULT_SETTINGS);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, []);

	// Fetch collections for portal page selector
	React.useEffect(() => {
		let cancelled = false;
		async function loadCollections() {
			try {
				const res = await fetch("/_emdash/api/schema/collections", {
					headers: { "X-EmDash-Request": "1" },
				});
				if (!res.ok || cancelled) return;
				const body = await res.json();
				const items = body?.data?.items ?? [];
				if (!cancelled) {
					const cols = items.map((c: { slug: string; label: string }) => ({
						slug: c.slug,
						label: c.label,
					}));
					setCollections(cols);
					if (cols.length > 0 && !selectedCollection) {
						setSelectedCollection(cols[0].slug);
					}
				}
			} catch {
				// ignore
			}
		}
		loadCollections();
		return () => {
			cancelled = true;
		};
	}, []);

	// Fetch content items when selected collection changes
	React.useEffect(() => {
		if (!selectedCollection) return;
		let cancelled = false;
		setLoadingContent(true);
		setContentItems([]);
		setSelectedContentId("");
		setBlockCheckStatus("idle");
		async function loadContent() {
			try {
				const res = await fetch(
					`/_emdash/api/content/${encodeURIComponent(selectedCollection)}?limit=100`,
					{ headers: { "X-EmDash-Request": "1" } },
				);
				if (!res.ok || cancelled) return;
				const body = await res.json();
				const items = body?.data?.items ?? [];
				if (!cancelled) {
					setContentItems(
						items.map((item: { id: string; slug: string; data: Record<string, unknown> }) => ({
							id: item.id,
							title: (item.data?.title as string) ?? item.slug ?? item.id,
							slug: item.slug ?? "",
						})),
					);
				}
			} catch {
				// ignore
			} finally {
				if (!cancelled) setLoadingContent(false);
			}
		}
		loadContent();
		return () => {
			cancelled = true;
		};
	}, [selectedCollection]);

	// Check for portal block when a content item is selected
	const checkPortalBlock = React.useCallback(
		async (contentId: string) => {
			if (!contentId || !selectedCollection) return;
			setBlockCheckStatus("checking");
			try {
				const res = await fetch(
					`/_emdash/api/content/${encodeURIComponent(selectedCollection)}/${encodeURIComponent(contentId)}`,
					{ headers: { "X-EmDash-Request": "1" } },
				);
				if (!res.ok) {
					setBlockCheckStatus("not_found");
					return;
				}
				const body = await res.json();
				const item = body?.data?.item;
				if (!item) {
					setBlockCheckStatus("not_found");
					return;
				}

				// Check all data fields for portalEmbed blocks in portable text
				let found = false;
				const data = item.data ?? {};
				for (const value of Object.values(data)) {
					if (Array.isArray(value)) {
						for (const block of value) {
							if (
								block &&
								typeof block === "object" &&
								(block as { _type?: string })._type === "portalEmbed"
							) {
								found = true;
								break;
							}
						}
					}
					if (found) break;
				}

				const pageSlug = item.slug ?? "";
				setCheckedPageSlug(pageSlug);
				setBlockCheckStatus(found ? "found" : "not_found");

				if (found && pageSlug) {
					// Auto-set the portal page path based on the selected page slug
					const path = `/${pageSlug}`;
					setSettings((s) => ({ ...s, portalPagePath: path }));
				}
			} catch {
				setBlockCheckStatus("not_found");
			}
		},
		[selectedCollection],
	);

	const canSave =
		isDirty &&
		!saving &&
		(settings.notificationEmail.length === 0 || EMAIL_RE.test(settings.notificationEmail));

	const handleSave = async () => {
		if (!canSave) return;
		setSaving(true);
		setError(null);
		setSaved(false);
		try {
			const res = await apiFetch("settings.update", settings);
			if (!res.ok) {
				setError(await getErrorMessage(res, "Failed to save settings"));
				return;
			}
			setInitial(settings);
			setSaved(true);
			setTimeout(setSaved, 2500, false);
		} catch {
			setError("Network error. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	const handleReset = () => {
		if (initial) {
			setSettings(initial);
			setCustomDays(false);
		}
	};

	const isPresetActive =
		!customDays && RETENTION_PRESETS.some((p) => p.days === settings.autoDeleteDays);

	if (loading) return <LoadingSpinner message="Loading settings..." />;

	return (
		<div className="max-w-2xl mx-auto px-6 py-8 pb-28">
			{error && (
				<div
					className="mb-5 px-4 py-3 text-sm font-medium flex items-center gap-2"
					style={{
						backgroundColor: "var(--color-kumo-danger-tint, rgba(239,68,68,0.08))",
						color: "var(--color-kumo-danger)",
						borderRadius: "14px",
					}}
				>
					<Warning className="h-4 w-4 flex-shrink-0" />
					{error}
				</div>
			)}

			{/* ── Section: Plan ── TEMPORARILY HIDDEN */}
			{false && <SectionHeader title="Plan" />}

			{false && <div className="space-y-3 mb-8">
				<SettingCard>
					<div className="flex items-start gap-4">
						<SettingIcon icon={Crown} accentColor="var(--color-kumo-warning, #b45309)" />
						<div className="flex-1 min-w-0">
							<SettingLabel title="Plugin Tier" />
							<p className="text-xs mb-3" style={{ color: "var(--text-color-kumo-subtle)" }}>
								Free includes branding. Pro removes all branding.
							</p>
							<div className="flex gap-2">
								{(["free", "pro"] as const).map((tier) => {
									const isActive = settings.planTier === tier;
									return (
										<button
											key={tier}
											onClick={() => setSettings((s) => ({ ...s, planTier: tier }))}
											className="px-5 py-2.5 text-sm font-semibold transition-all duration-200"
											style={{
												borderRadius: "100px",
												border: isActive
													? "2px solid var(--color-kumo-brand)"
													: "1px solid var(--color-kumo-line)",
												backgroundColor: isActive
													? "var(--color-kumo-brand-tint, rgba(34,113,177,0.06))"
													: "var(--color-kumo-control)",
												color: isActive
													? "var(--color-kumo-brand)"
													: "var(--text-color-kumo-default)",
												cursor: "pointer",
											}}
										>
											{tier === "free" ? "Free" : "Pro"}
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</SettingCard>
			</div>}

			{/* ── Section: Form Appearance ── TEMPORARILY HIDDEN */}
			{false && <SectionHeader title="Form Appearance" />}

			{false && <div className="space-y-3 mb-8">
				{/* Accent Color */}
				<SettingCard>
					<div className="flex items-start gap-4">
						<SettingIcon icon={Palette} accentColor="var(--color-kumo-brand, #2271b1)" />
						<div className="flex-1 min-w-0">
							<SettingLabel title="Accent Color" />
							<p className="text-xs mb-3" style={{ color: "var(--text-color-kumo-subtle)" }}>
								Primary color for buttons and focus rings on embedded forms.
							</p>
							<div className="flex items-center gap-3">
								<input
									type="color"
									value={settings.formAccentColor || "#2271b1"}
									onChange={(e) => setSettings((s) => ({ ...s, formAccentColor: e.target.value }))}
									className="w-10 h-10 rounded-lg cursor-pointer"
									style={{ border: "2px solid var(--color-kumo-line)", padding: 0 }}
								/>
								<input
									type="text"
									value={settings.formAccentColor}
									onChange={(e) => setSettings((s) => ({ ...s, formAccentColor: e.target.value }))}
									placeholder="#2271b1"
									className="flex-1 px-2 py-2.5 text-sm font-mono focus:outline-none focus:ring-2"
									style={{
										border: "1px solid var(--color-kumo-line)",
										backgroundColor: "var(--color-kumo-control)",
										color: "var(--text-color-kumo-default)",
										borderRadius: "12px",
									}}
								/>
								{settings.formAccentColor && (
									<button
										type="button"
										onClick={() => setSettings((s) => ({ ...s, formAccentColor: "" }))}
										className="text-xs px-3 py-2"
										style={{
											border: "1px solid var(--color-kumo-line)",
											borderRadius: "10px",
											background: "none",
											cursor: "pointer",
											color: "var(--text-color-kumo-subtle)",
										}}
									>
										Reset
									</button>
								)}
							</div>
						</div>
					</div>
				</SettingCard>

				{/* Background Color */}
				<SettingCard>
					<div className="flex items-start gap-4">
						<SettingIcon icon={Swatches} accentColor="var(--color-kumo-info, #2563eb)" />
						<div className="flex-1 min-w-0">
							<SettingLabel title="Background Color" />
							<p className="text-xs mb-3" style={{ color: "var(--text-color-kumo-subtle)" }}>
								Background color for the form container.
							</p>
							<div className="flex items-center gap-3">
								<input
									type="color"
									value={settings.formBgColor || "#ffffff"}
									onChange={(e) => setSettings((s) => ({ ...s, formBgColor: e.target.value }))}
									className="w-10 h-10 rounded-lg cursor-pointer"
									style={{ border: "2px solid var(--color-kumo-line)", padding: 0 }}
								/>
								<input
									type="text"
									value={settings.formBgColor}
									onChange={(e) => setSettings((s) => ({ ...s, formBgColor: e.target.value }))}
									placeholder="#ffffff"
									className="flex-1 px-2 py-2.5 text-sm font-mono focus:outline-none focus:ring-2"
									style={{
										border: "1px solid var(--color-kumo-line)",
										backgroundColor: "var(--color-kumo-control)",
										color: "var(--text-color-kumo-default)",
										borderRadius: "12px",
									}}
								/>
								{settings.formBgColor && (
									<button
										type="button"
										onClick={() => setSettings((s) => ({ ...s, formBgColor: "" }))}
										className="text-xs px-3 py-2"
										style={{
											border: "1px solid var(--color-kumo-line)",
											borderRadius: "10px",
											background: "none",
											cursor: "pointer",
											color: "var(--text-color-kumo-subtle)",
										}}
									>
										Reset
									</button>
								)}
							</div>
						</div>
					</div>
				</SettingCard>

				{/* Text Color */}
				<SettingCard>
					<div className="flex items-start gap-4">
						<SettingIcon
							icon={PencilSimple}
							accentColor="var(--text-color-kumo-default, #374151)"
						/>
						<div className="flex-1 min-w-0">
							<SettingLabel title="Text Color" />
							<p className="text-xs mb-3" style={{ color: "var(--text-color-kumo-subtle)" }}>
								Label and input text color on embedded forms.
							</p>
							<div className="flex items-center gap-3">
								<input
									type="color"
									value={settings.formTextColor || "#374151"}
									onChange={(e) => setSettings((s) => ({ ...s, formTextColor: e.target.value }))}
									className="w-10 h-10 rounded-lg cursor-pointer"
									style={{ border: "2px solid var(--color-kumo-line)", padding: 0 }}
								/>
								<input
									type="text"
									value={settings.formTextColor}
									onChange={(e) => setSettings((s) => ({ ...s, formTextColor: e.target.value }))}
									placeholder="#374151"
									className="flex-1 px-2 py-2.5 text-sm font-mono focus:outline-none focus:ring-2"
									style={{
										border: "1px solid var(--color-kumo-line)",
										backgroundColor: "var(--color-kumo-control)",
										color: "var(--text-color-kumo-default)",
										borderRadius: "12px",
									}}
								/>
								{settings.formTextColor && (
									<button
										type="button"
										onClick={() => setSettings((s) => ({ ...s, formTextColor: "" }))}
										className="text-xs px-3 py-2"
										style={{
											border: "1px solid var(--color-kumo-line)",
											borderRadius: "10px",
											background: "none",
											cursor: "pointer",
											color: "var(--text-color-kumo-subtle)",
										}}
									>
										Reset
									</button>
								)}
							</div>
						</div>
					</div>
				</SettingCard>

				{/* Border Radius */}
				<SettingCard>
					<div className="flex items-start gap-4">
						<SettingIcon icon={Swatches} accentColor="var(--color-kumo-success, #16a34a)" />
						<div className="flex-1 min-w-0">
							<SettingLabel title="Border Radius" />
							<p className="text-xs mb-3" style={{ color: "var(--text-color-kumo-subtle)" }}>
								Corner rounding for inputs and buttons (e.g. 8px, 12px, 0).
							</p>
							<input
								type="text"
								value={settings.formBorderRadius}
								onChange={(e) => setSettings((s) => ({ ...s, formBorderRadius: e.target.value }))}
								placeholder="12px"
								className="w-32 px-2 py-2.5 text-sm font-mono focus:outline-none focus:ring-2"
								style={{
									border: "1px solid var(--color-kumo-line)",
									backgroundColor: "var(--color-kumo-control)",
									color: "var(--text-color-kumo-default)",
									borderRadius: "12px",
								}}
							/>
						</div>
					</div>
				</SettingCard>

				{/* Font Size */}
				<SettingCard>
					<div className="flex items-start gap-4">
						<SettingIcon icon={PencilSimple} accentColor="var(--color-kumo-warning, #b45309)" />
						<div className="flex-1 min-w-0">
							<SettingLabel title="Font Size" />
							<p className="text-xs mb-3" style={{ color: "var(--text-color-kumo-subtle)" }}>
								Base font size for form labels and inputs (e.g. 14px, 16px).
							</p>
							<input
								type="text"
								value={settings.formFontSize}
								onChange={(e) => setSettings((s) => ({ ...s, formFontSize: e.target.value }))}
								placeholder="14px"
								className="w-32 px-2 py-2.5 text-sm font-mono focus:outline-none focus:ring-2"
								style={{
									border: "1px solid var(--color-kumo-line)",
									backgroundColor: "var(--color-kumo-control)",
									color: "var(--text-color-kumo-default)",
									borderRadius: "12px",
								}}
							/>
						</div>
					</div>
				</SettingCard>

				{/* Button Style */}
				<SettingCard>
					<div className="flex items-start gap-4 mb-4">
						<SettingIcon icon={Palette} accentColor="var(--color-kumo-danger, #dc2626)" />
						<div>
							<SettingLabel title="Button Style" />
							<p className="text-xs" style={{ color: "var(--text-color-kumo-subtle)" }}>
								Visual style for the submit button on embedded forms.
							</p>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-3">
						{BUTTON_STYLE_OPTIONS.map((opt) => {
							const isActive = settings.formButtonStyle === opt.value;
							return (
								<button
									key={opt.value}
									onClick={() => setSettings((s) => ({ ...s, formButtonStyle: opt.value }))}
									className="flex flex-col items-center text-center px-3 py-4 transition-all duration-200"
									style={{
										borderRadius: "14px",
										border: isActive
											? "2px solid var(--color-kumo-brand)"
											: "1px solid var(--color-kumo-line)",
										backgroundColor: isActive
											? "var(--color-kumo-brand-tint, rgba(34,113,177,0.06))"
											: "var(--color-kumo-control)",
										cursor: "pointer",
									}}
								>
									<span
										className="text-sm font-semibold"
										style={{
											color: isActive
												? "var(--color-kumo-brand)"
												: "var(--text-color-kumo-default)",
										}}
									>
										{opt.label}
									</span>
									<span
										className="text-[11px] mt-0.5"
										style={{ color: "var(--text-color-kumo-subtle)" }}
									>
										{opt.description}
									</span>
								</button>
							);
						})}
					</div>
				</SettingCard>
			</div>}

			{/* ── Section: Notifications ── */}
			<SectionHeader title="Notifications" />

			<div className="space-y-3 mb-8">
				<SettingCard>
					<div className="flex items-start gap-4">
						<SettingIcon icon={Bell} accentColor="var(--color-kumo-info, #2563eb)" />
						<div className="flex-1 min-w-0">
							<SettingLabel title="Email Notifications" />
							<p className="text-xs mb-3" style={{ color: "var(--text-color-kumo-subtle)" }}>
								Receive an email each time a form is submitted. Leave blank to disable.
							</p>
							<div className="relative">
								<input
									type="email"
									value={settings.notificationEmail}
									onChange={(e) =>
										setSettings((s) => ({
											...s,
											notificationEmail: e.target.value,
										}))
									}
									onBlur={() => setEmailTouched(true)}
									placeholder="you@example.com"
									className="w-full pl-2 px-2 py-2.5 text-sm focus:outline-none focus:ring-2"
									style={{
										border: `1px solid ${emailInvalid ? "var(--color-kumo-danger)" : "var(--color-kumo-line)"}`,
										backgroundColor: "var(--color-kumo-control)",
										color: "var(--text-color-kumo-default)",
										borderRadius: "12px",
									}}
								/>
								{emailInvalid && (
									<p
										className="mt-1.5 text-xs flex items-center gap-1"
										style={{ color: "var(--color-kumo-danger)" }}
									>
										<Warning className="h-3 w-3 flex-shrink-0" />
										Please enter a valid email address.
									</p>
								)}
							</div>
						</div>
					</div>
				</SettingCard>
			</div>

			{/* ── Section: Submissions ── */}
			<SectionHeader title="Submissions" />

			<div className="space-y-3 mb-8">
				{/* Tracking Code */}
				<SettingCard>
					<div className="flex items-start gap-4 mb-4">
						<SettingIcon icon={ClockClockwise} accentColor="var(--color-kumo-warning, #b45309)" />
						<div>
							<SettingLabel title="Tracking Code Format" />
							<p className="text-xs" style={{ color: "var(--text-color-kumo-subtle)" }}>
								How reference codes appear on submissions and in email notifications.
							</p>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-3">
						{TRACKING_OPTIONS.map((opt) => {
							const isActive = settings.trackingStyle === opt.value;
							return (
								<button
									key={opt.value}
									onClick={() =>
										setSettings((s) => ({
											...s,
											trackingStyle: opt.value,
										}))
									}
									className="flex flex-col items-center text-center px-3 py-4 transition-all duration-200"
									style={{
										borderRadius: "14px",
										border: isActive
											? "2px solid var(--color-kumo-brand)"
											: "1px solid var(--color-kumo-line)",
										backgroundColor: isActive
											? "var(--color-kumo-brand-tint, rgba(34,113,177,0.06))"
											: "var(--color-kumo-control)",
										cursor: "pointer",
									}}
								>
									<span
										className="text-sm font-semibold"
										style={{
											color: isActive
												? "var(--color-kumo-brand)"
												: "var(--text-color-kumo-default)",
										}}
									>
										{opt.label}
									</span>
									<span
										className="text-[11px] mt-0.5"
										style={{ color: "var(--text-color-kumo-subtle)" }}
									>
										{opt.description}
									</span>
									<span
										className="text-xs font-mono mt-2 px-2.5 py-1"
										style={{
											color: isActive
												? "var(--color-kumo-brand)"
												: "var(--text-color-kumo-inactive)",
											backgroundColor: isActive
												? "var(--color-kumo-brand-tint, rgba(34,113,177,0.06))"
												: "var(--color-kumo-elevated)",
											borderRadius: "8px",
										}}
									>
										{opt.example}
									</span>
								</button>
							);
						})}
					</div>
				</SettingCard>

				{/* Data Retention */}
				<SettingCard>
					<div className="flex items-start gap-4 mb-4">
						<SettingIcon icon={Trash} accentColor="var(--color-kumo-danger, #dc2626)" />
						<div>
							<SettingLabel title="Data Retention" />
							<p className="text-xs" style={{ color: "var(--text-color-kumo-subtle)" }}>
								Automatically delete old submissions after a chosen period.
							</p>
						</div>
					</div>
					<div className="flex flex-wrap gap-2">
						{RETENTION_PRESETS.map((preset) => {
							const isActive = !customDays && settings.autoDeleteDays === preset.days;
							return (
								<button
									key={preset.days}
									onClick={() => {
										setCustomDays(false);
										setSettings((s) => ({
											...s,
											autoDeleteDays: preset.days,
										}));
									}}
									className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200"
									style={{
										borderRadius: "100px",
										border: isActive
											? "2px solid var(--color-kumo-brand)"
											: "1px solid var(--color-kumo-line)",
										backgroundColor: isActive
											? "var(--color-kumo-brand-tint, rgba(34,113,177,0.06))"
											: "var(--color-kumo-control)",
										color: isActive ? "var(--color-kumo-brand)" : "var(--text-color-kumo-default)",
										cursor: "pointer",
									}}
								>
									{preset.days === 0 && <InfinityIcon className="h-3.5 w-3.5" />}
									{preset.label}
								</button>
							);
						})}
						{/* Custom toggle */}
						<button
							onClick={() => {
								setCustomDays(true);
								setSettings((s) => ({
									...s,
									autoDeleteDays: isPresetActive ? 45 : s.autoDeleteDays || 45,
								}));
							}}
							className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200"
							style={{
								borderRadius: "100px",
								border: customDays
									? "2px solid var(--color-kumo-brand)"
									: "1px solid var(--color-kumo-line)",
								backgroundColor: customDays
									? "var(--color-kumo-brand-tint, rgba(34,113,177,0.06))"
									: "var(--color-kumo-control)",
								color: customDays ? "var(--color-kumo-brand)" : "var(--text-color-kumo-default)",
								cursor: "pointer",
							}}
						>
							<PencilSimple className="h-3.5 w-3.5" />
							Custom
						</button>
					</div>
					{/* Custom day input */}
					{customDays && (
						<div className="mt-3 flex items-center gap-2">
							<span className="text-xs" style={{ color: "var(--text-color-kumo-subtle)" }}>
								Delete after
							</span>
							<input
								type="number"
								min={1}
								max={3650}
								value={settings.autoDeleteDays}
								onChange={(e) =>
									setSettings((s) => ({
										...s,
										autoDeleteDays: Math.max(1, Math.min(3650, Number(e.target.value))),
									}))
								}
								className="w-20 px-3 py-1.5 text-sm text-center font-medium focus:outline-none focus:ring-2"
								style={{
									border: "1px solid var(--color-kumo-line)",
									backgroundColor: "var(--color-kumo-control)",
									color: "var(--text-color-kumo-default)",
									borderRadius: "10px",
								}}
							/>
							<span className="text-xs" style={{ color: "var(--text-color-kumo-subtle)" }}>
								days
							</span>
						</div>
					)}
					{settings.autoDeleteDays === 0 && !customDays && (
						<p
							className="mt-3 text-xs flex items-center gap-1.5"
							style={{ color: "var(--color-kumo-success, #16a34a)" }}
						>
							<InfinityIcon className="h-3.5 w-3.5" />
							Submissions will never be automatically deleted.
						</p>
					)}
				</SettingCard>
			</div>

			{/* ── Section: Security ── */}
			<SectionHeader title="Security" />

			<div className="space-y-3">
				<SettingCard>
					<div className="flex items-center gap-4">
						<SettingIcon icon={ShieldCheck} accentColor="var(--color-kumo-success, #16a34a)" />
						<div className="flex-1 min-w-0">
							<SettingLabel title="Spam Protection" />
							<p className="text-xs" style={{ color: "var(--text-color-kumo-subtle)" }}>
								Add CAPTCHA verification to all public forms.
							</p>
						</div>
						<div className="flex items-center gap-3 flex-shrink-0">
							<button
								type="button"
								role="switch"
								aria-checked={settings.captchaEnabled}
								onClick={() =>
									setSettings((s) => ({
										...s,
										captchaEnabled: !s.captchaEnabled,
									}))
								}
								className="relative inline-flex h-7 w-12 flex-shrink-0 items-center transition-colors duration-200"
								style={{
									borderRadius: "100px",
									backgroundColor: settings.captchaEnabled
										? "var(--color-kumo-success, #16a34a)"
										: "var(--color-kumo-line)",
									border: "none",
									cursor: "pointer",
								}}
							>
								<span
									className="inline-block h-5 w-5 transition-transform duration-200"
									style={{
										borderRadius: "50%",
										backgroundColor: "var(--color-kumo-base)",
										boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
										transform: settings.captchaEnabled ? "translateX(22px)" : "translateX(4px)",
									}}
								/>
							</button>
							<span
								className="text-xs font-semibold px-2.5 py-1"
								style={{
									borderRadius: "100px",
									backgroundColor: settings.captchaEnabled
										? "var(--color-kumo-success-tint, rgba(22,163,74,0.08))"
										: "transparent",
									color: settings.captchaEnabled
										? "var(--color-kumo-success, #16a34a)"
										: "var(--text-color-kumo-inactive)",
								}}
							>
								{settings.captchaEnabled ? "Active" : "Off"}
							</span>
						</div>
					</div>
				</SettingCard>
			</div>

			{/* ── Section: Public Portal ── TEMPORARILY HIDDEN */}
			{false && <SectionHeader title="Public Portal" />}

			{false && <div className="space-y-3 mb-8">
				{/* Portal Enable Toggle */}
				<SettingCard>
					<div className="flex items-center gap-4">
						<SettingIcon icon={GlobeSimple} accentColor="var(--color-kumo-brand, #2271b1)" />
						<div className="flex-1 min-w-0">
							<SettingLabel title="Enable Portal" />
							<p className="text-xs" style={{ color: "var(--text-color-kumo-subtle)" }}>
								Allow users to view their submissions and reply via a public portal.
							</p>
						</div>
						<div className="flex items-center gap-3 flex-shrink-0">
							<button
								type="button"
								role="switch"
								aria-checked={settings.portalEnabled}
								onClick={() =>
									setSettings((s) => ({
										...s,
										portalEnabled: !s.portalEnabled,
									}))
								}
								className="relative inline-flex h-7 w-12 flex-shrink-0 items-center transition-colors duration-200"
								style={{
									borderRadius: "100px",
									backgroundColor: settings.portalEnabled
										? "var(--color-kumo-success, #16a34a)"
										: "var(--color-kumo-line)",
									border: "none",
									cursor: "pointer",
								}}
							>
								<span
									className="inline-block h-5 w-5 transition-transform duration-200"
									style={{
										borderRadius: "50%",
										backgroundColor: "var(--color-kumo-base)",
										boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
										transform: settings.portalEnabled ? "translateX(22px)" : "translateX(4px)",
									}}
								/>
							</button>
							<span
								className="text-xs font-semibold px-2.5 py-1"
								style={{
									borderRadius: "100px",
									backgroundColor: settings.portalEnabled
										? "var(--color-kumo-success-tint, rgba(22,163,74,0.08))"
										: "transparent",
									color: settings.portalEnabled
										? "var(--color-kumo-success, #16a34a)"
										: "var(--text-color-kumo-inactive)",
								}}
							>
								{settings.portalEnabled ? "Active" : "Off"}
							</span>
						</div>
					</div>
				</SettingCard>

				{settings.portalEnabled && (
					<>
						{/* Portal Title */}
						<SettingCard>
							<div className="flex items-start gap-4">
								<SettingIcon icon={PencilSimple} accentColor="var(--color-kumo-brand, #2271b1)" />
								<div className="flex-1 min-w-0">
									<SettingLabel title="Portal Title" />
									<p className="text-xs mb-3" style={{ color: "var(--text-color-kumo-subtle)" }}>
										Displayed at the top of the public portal page.
									</p>
									<input
										type="text"
										value={settings.portalTitle}
										onChange={(e) => setSettings((s) => ({ ...s, portalTitle: e.target.value }))}
										placeholder="Support Portal"
										className="w-full px-2 py-2.5 text-sm focus:outline-none focus:ring-2"
										style={{
											border: "1px solid var(--color-kumo-line)",
											backgroundColor: "var(--color-kumo-control)",
											color: "var(--text-color-kumo-default)",
											borderRadius: "12px",
										}}
									/>
								</div>
							</div>
						</SettingCard>

						{/* Default Locale */}
						<SettingCard>
							<div className="flex items-start gap-4">
								<SettingIcon icon={Translate} accentColor="var(--color-kumo-warning, #b45309)" />
								<div className="flex-1 min-w-0">
									<SettingLabel title="Default Language" />
									<p className="text-xs mb-3" style={{ color: "var(--text-color-kumo-subtle)" }}>
										Default language for the public portal. Users can switch languages.
									</p>
									<div className="flex flex-wrap gap-2">
										{LOCALE_OPTIONS.map((loc) => {
											const isActive = settings.portalDefaultLocale === loc.value;
											return (
												<button
													key={loc.value}
													onClick={() =>
														setSettings((s) => ({
															...s,
															portalDefaultLocale: loc.value,
														}))
													}
													className="px-4 py-2 text-sm font-medium transition-all duration-200"
													style={{
														borderRadius: "100px",
														border: isActive
															? "2px solid var(--color-kumo-brand)"
															: "1px solid var(--color-kumo-line)",
														backgroundColor: isActive
															? "var(--color-kumo-brand-tint, rgba(34,113,177,0.06))"
															: "var(--color-kumo-control)",
														color: isActive
															? "var(--color-kumo-brand)"
															: "var(--text-color-kumo-default)",
														cursor: "pointer",
													}}
												>
													{loc.label}
												</button>
											);
										})}
									</div>
								</div>
							</div>
						</SettingCard>

						{/* Brand Color */}
						<SettingCard>
							<div className="flex items-start gap-4">
								<SettingIcon icon={Palette} accentColor="var(--color-kumo-brand, #2271b1)" />
								<div className="flex-1 min-w-0">
									<SettingLabel title="Brand Color" />
									<p className="text-xs mb-3" style={{ color: "var(--text-color-kumo-subtle)" }}>
										Customize the portal accent color. Leave blank to use the default.
									</p>
									<div className="flex items-center gap-3">
										<input
											type="color"
											value={settings.portalBrandColor || "#2271b1"}
											onChange={(e) =>
												setSettings((s) => ({ ...s, portalBrandColor: e.target.value }))
											}
											className="w-10 h-10 rounded-lg cursor-pointer"
											style={{ border: "2px solid var(--color-kumo-line)", padding: 0 }}
										/>
										<input
											type="text"
											value={settings.portalBrandColor}
											onChange={(e) =>
												setSettings((s) => ({ ...s, portalBrandColor: e.target.value }))
											}
											placeholder="#2271b1"
											className="flex-1 px-2 py-2.5 text-sm font-mono focus:outline-none focus:ring-2"
											style={{
												border: "1px solid var(--color-kumo-line)",
												backgroundColor: "var(--color-kumo-control)",
												color: "var(--text-color-kumo-default)",
												borderRadius: "12px",
											}}
										/>
										{settings.portalBrandColor && (
											<button
												type="button"
												onClick={() => setSettings((s) => ({ ...s, portalBrandColor: "" }))}
												className="text-xs px-3 py-2"
												style={{
													border: "1px solid var(--color-kumo-line)",
													borderRadius: "10px",
													background: "none",
													cursor: "pointer",
													color: "var(--text-color-kumo-subtle)",
												}}
											>
												Reset
											</button>
										)}
									</div>
								</div>
							</div>
						</SettingCard>

						{/* Login Description */}
						<SettingCard>
							<div className="flex items-start gap-4">
								<SettingIcon icon={GlobeSimple} accentColor="var(--color-kumo-info, #2563eb)" />
								<div className="flex-1 min-w-0">
									<SettingLabel title="Login Page Description" />
									<p className="text-xs mb-3" style={{ color: "var(--text-color-kumo-subtle)" }}>
										Optional text shown on the portal login page below the title.
									</p>
									<textarea
										value={settings.portalLoginDescription}
										onChange={(e) =>
											setSettings((s) => ({ ...s, portalLoginDescription: e.target.value }))
										}
										placeholder="Enter your email to access your submissions..."
										rows={2}
										className="w-full px-2 py-2.5 text-sm resize-none focus:outline-none focus:ring-2"
										style={{
											border: "1px solid var(--color-kumo-line)",
											backgroundColor: "var(--color-kumo-control)",
											color: "var(--text-color-kumo-default)",
											borderRadius: "12px",
										}}
									/>
								</div>
							</div>
						</SettingCard>

						{/* Portal Page Selector */}
						<SettingCard>
							<div className="flex items-start gap-4">
								<SettingIcon icon={Link} accentColor="var(--color-kumo-brand, #2271b1)" />
								<div className="flex-1 min-w-0">
									<SettingLabel title="Portal Page" />
									<p className="text-xs mb-3" style={{ color: "var(--text-color-kumo-subtle)" }}>
										Select the page where you added the{" "}
										<code
											style={{
												backgroundColor: "var(--color-kumo-elevated)",
												padding: "1px 6px",
												borderRadius: "6px",
												fontSize: "12px",
											}}
										>
											/portal
										</code>{" "}
										block. Email links will point to this page.
									</p>

									{/* Collection selector */}
									<div className="flex gap-2 mb-3">
										<select
											value={selectedCollection}
											onChange={(e) => setSelectedCollection(e.target.value)}
											className="flex-1 px-2 py-2.5 text-sm focus:outline-none focus:ring-2"
											style={{
												border: "1px solid var(--color-kumo-line)",
												backgroundColor: "var(--color-kumo-control)",
												color: "var(--text-color-kumo-default)",
												borderRadius: "12px",
												appearance: "none",
												backgroundImage:
													"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%239ca3af' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
												backgroundRepeat: "no-repeat",
												backgroundPosition: "right 12px center",
												paddingRight: "32px",
											}}
										>
											{collections.map((col) => (
												<option key={col.slug} value={col.slug}>
													{col.label}
												</option>
											))}
										</select>
									</div>

									{/* Page selector */}
									{loadingContent ? (
										<div
											className="flex items-center gap-2 text-xs py-2"
											style={{ color: "var(--text-color-kumo-subtle)" }}
										>
											<LoadingSpinner message="" />
											Loading pages...
										</div>
									) : (
										<div className="flex gap-2">
											<select
												value={selectedContentId}
												onChange={(e) => {
													setSelectedContentId(e.target.value);
													setBlockCheckStatus("idle");
												}}
												className="flex-1 px-2 py-2.5 text-sm focus:outline-none focus:ring-2"
												style={{
													border: "1px solid var(--color-kumo-line)",
													backgroundColor: "var(--color-kumo-control)",
													color: "var(--text-color-kumo-default)",
													borderRadius: "12px",
													appearance: "none",
													backgroundImage:
														"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%239ca3af' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
													backgroundRepeat: "no-repeat",
													backgroundPosition: "right 12px center",
													paddingRight: "32px",
												}}
											>
												<option value="">— Select a page —</option>
												{contentItems.map((item) => (
													<option key={item.id} value={item.id}>
														{item.title}
														{item.slug ? ` (/${item.slug})` : ""}
													</option>
												))}
											</select>
											<button
												type="button"
												onClick={() => checkPortalBlock(selectedContentId)}
												disabled={!selectedContentId || blockCheckStatus === "checking"}
												className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all"
												style={{
													borderRadius: "12px",
													border: "none",
													backgroundColor: selectedContentId
														? "var(--color-kumo-brand)"
														: "var(--color-kumo-line)",
													color: selectedContentId
														? "var(--color-kumo-base)"
														: "var(--text-color-kumo-inactive)",
													cursor: selectedContentId ? "pointer" : "not-allowed",
													opacity: blockCheckStatus === "checking" ? 0.7 : 1,
												}}
											>
												<MagnifyingGlass className="h-4 w-4" />
												{blockCheckStatus === "checking" ? "Checking…" : "Check"}
											</button>
										</div>
									)}

									{/* Block check result */}
									{blockCheckStatus === "found" && (
										<div
											className="mt-3 px-4 py-3 flex items-start gap-3"
											style={{
												backgroundColor: "var(--color-kumo-success-tint, rgba(22,163,74,0.08))",
												borderRadius: "12px",
												border:
													"1px solid color-mix(in srgb, var(--color-kumo-success, #16a34a) 20%, transparent)",
											}}
										>
											<CheckCircle
												className="h-5 w-5 flex-shrink-0 mt-0.5"
												weight="fill"
												style={{ color: "var(--color-kumo-success, #16a34a)" }}
											/>
											<div>
												<p
													className="text-sm font-semibold"
													style={{ color: "var(--color-kumo-success, #16a34a)" }}
												>
													Portal block found!
												</p>
												<p
													className="text-xs mt-1"
													style={{ color: "var(--text-color-kumo-subtle)" }}
												>
													The support portal is active on this page. Email links will point users to{" "}
													<strong>/{checkedPageSlug}</strong>.
												</p>
											</div>
										</div>
									)}

									{blockCheckStatus === "not_found" && (
										<div
											className="mt-3 px-4 py-3 flex items-start gap-3"
											style={{
												backgroundColor: "var(--color-kumo-warning-tint, rgba(180,83,9,0.08))",
												borderRadius: "12px",
												border:
													"1px solid color-mix(in srgb, var(--color-kumo-warning, #b45309) 20%, transparent)",
											}}
										>
											<Info
												className="h-5 w-5 flex-shrink-0 mt-0.5"
												weight="fill"
												style={{ color: "var(--color-kumo-warning, #b45309)" }}
											/>
											<div>
												<p
													className="text-sm font-semibold"
													style={{ color: "var(--color-kumo-warning, #b45309)" }}
												>
													Portal block not found
												</p>
												<p
													className="text-xs mt-1 leading-relaxed"
													style={{ color: "var(--text-color-kumo-subtle)" }}
												>
													The selected page doesn't contain the portal block yet. To add it:
												</p>
												<ol
													className="text-xs mt-2 leading-relaxed pl-4"
													style={{
														color: "var(--text-color-kumo-subtle)",
														listStyleType: "decimal",
													}}
												>
													<li>Open the page in the content editor</li>
													<li>
														Type{" "}
														<code
															style={{
																backgroundColor: "var(--color-kumo-elevated)",
																padding: "1px 6px",
																borderRadius: "4px",
															}}
														>
															/portal
														</code>{" "}
														to insert the Support Portal block
													</li>
													<li>Save the page, then come back and check again</li>
												</ol>
											</div>
										</div>
									)}

									{/* Manual path override */}
									{settings.portalPagePath && (
										<div className="mt-3">
											<label
												className="text-xs font-medium mb-1 block"
												style={{ color: "var(--text-color-kumo-subtle)" }}
											>
												Portal URL path
											</label>
											<input
												type="text"
												value={settings.portalPagePath}
												onChange={(e) =>
													setSettings((s) => ({
														...s,
														portalPagePath: e.target.value,
													}))
												}
												placeholder="/support"
												className="w-full px-2 py-2 text-sm font-mono focus:outline-none focus:ring-2"
												style={{
													border: "1px solid var(--color-kumo-line)",
													backgroundColor: "var(--color-kumo-control)",
													color: "var(--text-color-kumo-default)",
													borderRadius: "12px",
												}}
											/>
											<p
												className="text-[11px] mt-1"
												style={{ color: "var(--text-color-kumo-inactive)" }}
											>
												The URL path used in email links. Auto-set when a page with the portal block
												is found. You can edit it if your site uses a different URL structure.
											</p>
										</div>
									)}
								</div>
							</div>
						</SettingCard>
					</>
				)}
			</div>}

			{/* ── Sticky save bar — only visible when dirty ── */}
			{(isDirty || saved) && (
				<div
					className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center"
					style={{
						padding: "0px 24px 20px",
					}}
				>
					<div
						className="flex items-center gap-3 px-3 py-3"
						style={{
							backgroundColor: "var(--color-kumo-base)",
							borderRadius: "16px",
							boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
							border: "1px solid var(--color-kumo-line)",
						}}
					>
						{saved ? (
							<span
								className="inline-flex items-center gap-1.5 text-sm font-medium px-3"
								style={{ color: "var(--color-kumo-success, #16a34a)" }}
							>
								<Check className="h-4 w-4" />
								Settings saved
							</span>
						) : (
							<>
								<span className="text-xs" style={{ color: "var(--text-color-kumo-subtle)" }}>
									Unsaved changes
								</span>
								<button
									onClick={handleReset}
									className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
									style={{
										backgroundColor: "transparent",
										color: "var(--text-color-kumo-default)",
										borderRadius: "100px",
										border: "1px solid var(--color-kumo-line)",
										cursor: "pointer",
									}}
								>
									<ArrowCounterClockwise className="h-3.5 w-3.5" />
									Reset
								</button>
								<button
									onClick={handleSave}
									disabled={!canSave}
									className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
									style={{
										backgroundColor: "var(--color-kumo-brand)",
										color: "var(--color-kumo-base)",
										borderRadius: "100px",
										boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
										opacity: !canSave ? 0.6 : 1,
										border: "none",
										cursor: !canSave ? "not-allowed" : "pointer",
									}}
								>
									<FloppyDisk className="h-4 w-4" />
									{saving ? "Saving…" : "Save"}
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Shared setting components
// =============================================================================

function SectionHeader({ title }: { title: string }) {
	return (
		<h2
			className="text-[11px] font-bold uppercase tracking-wider mb-3 px-1"
			style={{ color: "var(--text-color-kumo-inactive)" }}
		>
			{title}
		</h2>
	);
}

function SettingCard({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="px-3 py-3"
			style={{
				backgroundColor: "var(--color-kumo-base)",
				borderRadius: "16px",
				boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
			}}
		>
			{children}
		</div>
	);
}

function SettingIcon({
	icon: Icon,
	accentColor,
}: {
	icon: React.ComponentType<{ className?: string }>;
	accentColor: string;
}) {
	return (
		<div
			className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
			style={{
				backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
				borderRadius: "12px",
			}}
		>
			<Icon className="h-5 w-5" style={{ color: accentColor } as React.CSSProperties} />
		</div>
	);
}

function SettingLabel({ title }: { title: string }) {
	return (
		<h3
			className="text-sm font-semibold mb-0.5"
			style={{ color: "var(--text-color-kumo-default)" }}
		>
			{title}
		</h3>
	);
}
