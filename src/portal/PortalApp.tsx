/**
 * PortalApp — main public portal SPA component.
 *
 * Manages view routing (login → dashboard → detail), locale switching,
 * and passes settings/translations to child components.
 */

import { GlobeSimple } from "@phosphor-icons/react";
import * as React from "react";

import { portalFetch } from "./api.js";
import { getTranslations, getDirection, getAvailableLocales, getLocaleName } from "./i18n.js";
import { PortalDashboard } from "./PortalDashboard.js";
import { PortalDetail } from "./PortalDetail.js";
import { PortalLogin } from "./PortalLogin.js";
import { PoweredByFooter } from "./PoweredByFooter.js";

type View = "login" | "dashboard" | "detail";

interface PortalSettings {
	portalEnabled: boolean;
	portalTitle: string;
	portalDefaultLocale: string;
	portalBrandColor: string;
	portalLoginDescription: string;
	planTier: "free" | "pro";
	branding: {
		text: string;
		pluginName: string;
		pluginUrl: string;
		teamName: string;
		teamUrl: string;
	} | null;
}

const DEFAULT_SETTINGS: PortalSettings = {
	portalEnabled: true,
	portalTitle: "Support Portal",
	portalDefaultLocale: "en",
	portalBrandColor: "#2271b1",
	portalLoginDescription: "",
	planTier: "free",
	branding: null,
};

export function PortalApp() {
	const [view, setView] = React.useState<View>("login");
	const [email, setEmail] = React.useState("");
	const [token, setToken] = React.useState("");
	const [selectedSubmissionId, setSelectedSubmissionId] = React.useState("");
	const [locale, setLocale] = React.useState("en");
	const [settings, setSettings] = React.useState<PortalSettings>(DEFAULT_SETTINGS);
	const [settingsLoaded, setSettingsLoaded] = React.useState(false);

	// Load portal settings
	React.useEffect(() => {
		(async () => {
			try {
				const res = await portalFetch("portal.settings", {});
				const body = await res.json();
				const data = body.data ?? body;
				if (data && !data.error) {
					const s: PortalSettings = {
						portalEnabled: data.portalEnabled ?? true,
						portalTitle: data.portalTitle ?? "Support Portal",
						portalDefaultLocale: data.portalDefaultLocale ?? "en",
						portalBrandColor: data.portalBrandColor ?? "#2271b1",
						portalLoginDescription: data.portalLoginDescription ?? "",
						planTier: data.planTier ?? "free",
						branding: data.branding ?? null,
					};
					setSettings(s);
					setLocale(s.portalDefaultLocale);
				}
			} catch {
				// Use defaults
			} finally {
				setSettingsLoaded(true);
			}
		})();
	}, []);

	const t = React.useMemo(() => getTranslations(locale), [locale]);
	const dir = React.useMemo(() => getDirection(locale), [locale]);
	const locales = React.useMemo(() => getAvailableLocales(), []);

	const handleTokenLogin = React.useCallback((email: string, token: string) => {
		setEmail(email);
		setToken(token);
		setView("dashboard");
	}, []);

	const handleSelectSubmission = React.useCallback((id: string) => {
		setSelectedSubmissionId(id);
		setView("detail");
	}, []);

	const handleBackToDashboard = React.useCallback(() => {
		setSelectedSubmissionId("");
		setView("dashboard");
	}, []);

	const handleLogout = React.useCallback(() => {
		setEmail("");
		setToken("");
		setSelectedSubmissionId("");
		setView("login");
		// Clean URL params
		const url = new URL(window.location.href);
		url.searchParams.delete("token");
		window.history.replaceState({}, "", url.toString());
	}, []);

	if (!settingsLoaded) {
		return (
			<div
				className="min-h-screen flex items-center justify-center"
				style={{ backgroundColor: "#f7f8fa" }}
			>
				<div
					className="w-8 h-8 rounded-full animate-spin"
					style={{
						border: `3px solid ${settings.portalBrandColor}20`,
						borderTopColor: settings.portalBrandColor,
					}}
				/>
			</div>
		);
	}

	if (!settings.portalEnabled) {
		return (
			<div
				dir={dir}
				className="min-h-screen flex items-center justify-center p-6"
				style={{
					backgroundColor: "#f7f8fa",
					fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
				}}
			>
				<p className="text-sm" style={{ color: "#6b7280" }}>
					{t["common.error"]}
				</p>
			</div>
		);
	}

	return (
		<div style={{ position: "relative" }}>
			{/* Locale switcher */}
			{locales.length > 1 && (
				<div
					style={{
						position: "fixed",
						bottom: "20px",
						[dir === "rtl" ? "left" : "right"]: "20px",
						zIndex: 1000,
						display: "flex",
						alignItems: "center",
						gap: "6px",
						backgroundColor: "#fff",
						padding: "6px 12px",
						borderRadius: "12px",
						boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
					}}
				>
					<GlobeSimple style={{ width: 14, height: 14, color: "#6b7280" }} />
					<select
						value={locale}
						onChange={(e) => setLocale(e.target.value)}
						className="text-xs font-medium focus:outline-none"
						style={{
							border: "none",
							backgroundColor: "transparent",
							color: "#374151",
							cursor: "pointer",
							appearance: "auto" as "auto",
						}}
					>
						{locales.map((loc) => (
							<option key={loc} value={loc}>
								{getLocaleName(loc)}
							</option>
						))}
					</select>
				</div>
			)}

			{/* View router */}
			{view === "login" && (
				<PortalLogin
					t={t}
					dir={dir}
					brandColor={settings.portalBrandColor}
					description={settings.portalLoginDescription}
					onTokenLogin={handleTokenLogin}
					branding={settings.branding}
				/>
			)}

			{view === "dashboard" && (
				<PortalDashboard
					t={t}
					dir={dir}
					email={email}
					token={token}
					brandColor={settings.portalBrandColor}
					title={settings.portalTitle}
					onSelect={handleSelectSubmission}
					onLogout={handleLogout}
				/>
			)}

			{view === "detail" && (
				<PortalDetail
					t={t}
					dir={dir}
					email={email}
					token={token}
					submissionId={selectedSubmissionId}
					brandColor={settings.portalBrandColor}
					onBack={handleBackToDashboard}
				/>
			)}

			{settings.branding && (
				<PoweredByFooter
					t={t}
					pluginName={settings.branding.pluginName}
					pluginUrl={settings.branding.pluginUrl}
					studioName={settings.branding.teamName}
					studioUrl={settings.branding.teamUrl}
				/>
			)}
		</div>
	);
}
