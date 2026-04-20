/**
 * Portal Dashboard — ticketing-style submission list with search/filter.
 */

import {
	MagnifyingGlass,
	ChatCircle,
	CaretRight,
	Funnel,
	EnvelopeSimple,
	Eye,
	Check,
	SignOut,
	ArrowsClockwise,
} from "@phosphor-icons/react";
import * as React from "react";

import { portalFetch } from "./api.js";
import type { PortalTranslations } from "./i18n.js";

interface SubmissionItem {
	submissionId: string;
	formId: string;
	formName: string;
	trackingCode: string;
	status: string;
	submittedAt: string;
}

const STATUS_ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
	open: EnvelopeSimple,
	read: Eye,
	closed: Check,
};

export function PortalDashboard({
	t,
	dir,
	email,
	token,
	brandColor,
	title,
	onSelect,
	onLogout,
}: {
	t: PortalTranslations;
	dir: "ltr" | "rtl";
	email: string;
	token: string;
	brandColor: string;
	title: string;
	onSelect: (submissionId: string) => void;
	onLogout: () => void;
}) {
	const [submissions, setSubmissions] = React.useState<SubmissionItem[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [search, setSearch] = React.useState("");
	const [statusFilter, setStatusFilter] = React.useState("all");
	const accent = brandColor || "#2271b1";

	React.useEffect(() => {
		let cancelled = false;
		async function load() {
			setLoading(true);
			setError(null);
			try {
				const res = await portalFetch("portal.submissions", {
					email,
					token,
					limit: 100,
					status: statusFilter !== "all" ? statusFilter : undefined,
				});
				const body = await res.json();
				const data = body.data ?? body;
				if (data.error) {
					setError(data.error === "UNAUTHORIZED" ? t["token.expired"] : t["common.error"]);
					return;
				}
				if (!cancelled) {
					setSubmissions((data.items ?? []) as SubmissionItem[]);
				}
			} catch {
				if (!cancelled) setError(t["common.error"]);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [statusFilter, email, token]);

	const filtered = React.useMemo(() => {
		if (!search) return submissions;
		const q = search.toLowerCase();
		return submissions.filter(
			(s) => s.formName.toLowerCase().includes(q) || s.trackingCode.toLowerCase().includes(q),
		);
	}, [submissions, search]);

	const statusLabel = (s: string) =>
		s === "open"
			? t["status.open"]
			: s === "read"
				? t["status.read"]
				: s === "closed"
					? t["status.closed"]
					: s;

	const statusColor = (s: string) =>
		s === "open" ? "#2563eb" : s === "read" ? "#b45309" : "#6b7280";

	return (
		<div
			dir={dir}
			className="min-h-screen"
			style={{
				backgroundColor: "#f7f8fa",
				fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
			}}
		>
			{/* Header */}
			<div
				style={{
					background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
					padding: "24px",
				}}
			>
				<div className="max-w-3xl mx-auto">
					<div className="flex items-center justify-between mb-4">
						<h1 className="text-lg font-bold" style={{ color: "#fff" }}>
							{title}
						</h1>
						<button
							onClick={onLogout}
							className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
							style={{
								backgroundColor: "rgba(255,255,255,0.15)",
								color: "#fff",
								borderRadius: "8px",
								border: "none",
								cursor: "pointer",
							}}
						>
							<SignOut style={{ width: 14, height: 14 }} />
							{t["portal.logout"]}
						</button>
					</div>
					<p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
						{email}
					</p>
				</div>
			</div>

			<div className="max-w-3xl mx-auto px-4 py-6">
				{/* Search & Filter */}
				<div className="flex gap-3 mb-5">
					<div className="relative flex-1">
						<MagnifyingGlass
							className="absolute top-1/2 -translate-y-1/2"
							style={{
								[dir === "rtl" ? "right" : "left"]: "12px",
								color: "#9ca3af",
								width: 16,
								height: 16,
							}}
						/>
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder={t["portal.searchPlaceholder"]}
							className="w-full py-2.5 text-sm focus:outline-none"
							style={{
								[dir === "rtl" ? "paddingRight" : "paddingLeft"]: "36px",
								[dir === "rtl" ? "paddingLeft" : "paddingRight"]: "12px",
								border: "1px solid #e5e7eb",
								borderRadius: "12px",
								backgroundColor: "#fff",
								color: "#1a1a1a",
							}}
						/>
					</div>
					<div className="relative">
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="appearance-none px-4 py-2.5 text-sm font-medium focus:outline-none"
							style={{
								border: "1px solid #e5e7eb",
								borderRadius: "12px",
								backgroundColor: "#fff",
								color: "#374151",
								paddingRight: "32px",
								cursor: "pointer",
							}}
						>
							<option value="all">{t["portal.statusAll"]}</option>
							<option value="open">{t["status.open"]}</option>
							<option value="read">{t["status.read"]}</option>
							<option value="closed">{t["status.closed"]}</option>
						</select>
						<Funnel
							className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
							style={{ right: "10px", color: "#9ca3af", width: 14, height: 14 }}
						/>
					</div>
				</div>

				{/* Content */}
				{loading ? (
					<div className="flex items-center justify-center py-16">
						<ArrowsClockwise
							className="animate-spin"
							style={{ color: accent, width: 24, height: 24 }}
						/>
					</div>
				) : error ? (
					<div className="text-center py-16">
						<p className="text-sm" style={{ color: "#dc2626" }}>
							{error}
						</p>
					</div>
				) : filtered.length === 0 ? (
					<div className="text-center py-16">
						<div
							className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
							style={{ backgroundColor: "#f3f4f6" }}
						>
							<ChatCircle style={{ color: "#9ca3af", width: 28, height: 28 }} />
						</div>
						<p className="text-sm font-medium" style={{ color: "#6b7280" }}>
							{submissions.length > 0 ? t["portal.noResults"] : t["portal.noSubmissions"]}
						</p>
					</div>
				) : (
					<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
						{filtered.map((sub) => {
							const StatusIcon = STATUS_ICONS[sub.status] ?? EnvelopeSimple;
							const sColor = statusColor(sub.status);
							return (
								<button
									key={sub.submissionId}
									onClick={() => onSelect(sub.submissionId)}
									className="w-full flex items-center gap-4 p-4 text-left transition-all"
									style={{
										backgroundColor: "#fff",
										borderRadius: "14px",
										boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
										border: "none",
										cursor: "pointer",
									}}
								>
									{/* Status badge */}
									<div
										className="flex items-center gap-1.5 px-2.5 py-1"
										style={{
											backgroundColor: `${sColor}12`,
											color: sColor,
											borderRadius: "8px",
											fontSize: "11px",
											fontWeight: 600,
										}}
									>
										<StatusIcon style={{ width: 14, height: 14 }} />
										{statusLabel(sub.status)}
									</div>

									{/* Info */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
												{sub.formName}
											</span>
											<span
												className="text-xs font-mono px-1.5 py-0.5"
												style={{
													color: "#9ca3af",
													backgroundColor: "#f3f4f6",
													borderRadius: "4px",
												}}
											>
												{sub.trackingCode}
											</span>
										</div>
										<span className="text-xs" style={{ color: "#9ca3af" }}>
											{new Date(sub.submittedAt).toLocaleDateString(
												dir === "rtl" ? "fa-IR" : "en-US",
												{
													month: "short",
													day: "numeric",
													year: "numeric",
												},
											)}
										</span>
									</div>

									<CaretRight style={{ color: "#d1d5db", width: 16, height: 16 }} />
								</button>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
