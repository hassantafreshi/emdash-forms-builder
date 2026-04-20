/**
 * Portal Login — email-based magic link request.
 */

import { EnvelopeSimple, PaperPlaneRight, ArrowsClockwise } from "@phosphor-icons/react";
import * as React from "react";

import { portalFetch } from "./api.js";
import type { PortalTranslations } from "./i18n.js";

export function PortalLogin({
	t,
	dir,
	brandColor,
	description,
	onTokenLogin,
	branding,
}: {
	t: PortalTranslations;
	dir: "ltr" | "rtl";
	brandColor: string;
	description: string;
	onTokenLogin?: (email: string, token: string) => void;
	branding?: {
		pluginName: string;
		pluginUrl: string;
		teamName: string;
		teamUrl: string;
	} | null;
}) {
	const [email, setEmail] = React.useState("");
	const [loading, setLoading] = React.useState(false);
	const [sent, setSent] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const accent = brandColor || "#2271b1";

	// If URL has a token param, try to verify it
	React.useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");
		if (!token) return;

		(async () => {
			try {
				const res = await portalFetch("portal.verifyToken", { token });
				const body = await res.json();
				const data = body.data ?? body;
				if (data.success && data.email) {
					onTokenLogin?.(data.email, token);
				} else {
					setError(data.error === "TOKEN_EXPIRED" ? t["token.expired"] : t["common.error"]);
				}
			} catch {
				setError(t["common.error"]);
			}
		})();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) return;
		setLoading(true);
		setError(null);

		try {
			const res = await portalFetch("portal.requestAccess", { email: email.trim() });
			const body = await res.json();
			const data = body.data ?? body;
			if (data.success) {
				setSent(true);
			} else if (data.error === "INVALID_EMAIL") {
				setError(t["login.invalidEmail"]);
			} else {
				setError(t["common.error"]);
			}
		} catch {
			setError(t["common.error"]);
		} finally {
			setLoading(false);
		}
	};

	if (sent) {
		return (
			<div
				dir={dir}
				className="min-h-screen flex items-center justify-center p-6"
				style={{
					backgroundColor: "#f7f8fa",
					fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
				}}
			>
				<div
					className="w-full max-w-md text-center p-8"
					style={{
						backgroundColor: "#fff",
						borderRadius: "20px",
						boxShadow: "0 4px 30px rgba(0,0,0,0.06)",
					}}
				>
					<div
						className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
						style={{ backgroundColor: `${accent}12` }}
					>
						<EnvelopeSimple style={{ color: accent, width: 28, height: 28 }} />
					</div>
					<h2 className="text-lg font-bold mb-2" style={{ color: "#1a1a1a" }}>
						{t["login.success"]}
					</h2>
					<p className="text-sm mb-4" style={{ color: "#6b7280" }}>
						{t["login.successDescription"]}
					</p>
					<p className="text-xs" style={{ color: "#9ca3af" }}>
						{email}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			dir={dir}
			className="min-h-screen flex items-center justify-center p-6"
			style={{
				backgroundColor: "#f7f8fa",
				fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
			}}
		>
			<div
				className="w-full max-w-md p-8"
				style={{
					backgroundColor: "#fff",
					borderRadius: "20px",
					boxShadow: "0 4px 30px rgba(0,0,0,0.06)",
				}}
			>
				{/* Header */}
				<div className="text-center mb-6">
					<div
						className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
						style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
					>
						<EnvelopeSimple style={{ color: "#fff", width: 24, height: 24 }} />
					</div>
					<h1 className="text-xl font-bold mb-1" style={{ color: "#1a1a1a" }}>
						{t["login.title"]}
					</h1>
					{description && (
						<p className="text-sm" style={{ color: "#6b7280" }}>
							{description}
						</p>
					)}
				</div>

				{error && (
					<div
						className="mb-4 px-4 py-3 text-sm"
						style={{ backgroundColor: "#fef2f2", color: "#dc2626", borderRadius: "12px" }}
					>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label
							htmlFor="portal-email"
							className="block text-sm font-medium mb-2"
							style={{ color: "#374151" }}
						>
							{t["login.emailLabel"]}
						</label>
						<input
							id="portal-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={t["login.emailPlaceholder"]}
							required
							autoComplete="email"
							className="w-full px-4 py-3 text-sm focus:outline-none"
							style={{
								border: "1px solid #e5e7eb",
								borderRadius: "12px",
								backgroundColor: "#f9fafb",
								color: "#1a1a1a",
							}}
						/>
					</div>
					<button
						type="submit"
						disabled={loading || !email.trim()}
						className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all"
						style={{
							backgroundColor: loading || !email.trim() ? "#d1d5db" : accent,
							color: "#fff",
							borderRadius: "12px",
							border: "none",
							cursor: loading || !email.trim() ? "not-allowed" : "pointer",
						}}
					>
						{loading ? (
							<>
								<ArrowsClockwise className="animate-spin" style={{ width: 16, height: 16 }} />
								{t["login.sending"]}
							</>
						) : (
							<>
								<PaperPlaneRight style={{ width: 16, height: 16 }} />
								{t["login.submit"]}
							</>
						)}
					</button>
					{branding && (
						<p
							style={{
								textAlign: "center",
								marginTop: "12px",
								fontSize: "11px",
								color: "#9ca3af",
							}}
						>
							Powered by{" "}
							<a
								href={branding.pluginUrl}
								target="_blank"
								rel="noopener noreferrer"
								style={{
									color: "inherit",
									textDecoration: "underline",
									textUnderlineOffset: "2px",
								}}
							>
								{branding.pluginName}
							</a>{" "}
							· made by{" "}
							<a
								href={branding.teamUrl}
								target="_blank"
								rel="noopener noreferrer"
								style={{
									color: "inherit",
									textDecoration: "underline",
									textUnderlineOffset: "2px",
								}}
							>
								{branding.teamName}
							</a>
						</p>
					)}
				</form>
			</div>
		</div>
	);
}
