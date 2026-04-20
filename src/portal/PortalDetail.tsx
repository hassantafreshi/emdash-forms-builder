/**
 * Portal Detail — submission detail with conversation thread and reply.
 */

import {
	ArrowLeft,
	ArrowRight,
	ShieldCheck,
	User,
	PaperPlaneRight,
	ArrowsClockwise,
	Clock,
	ChatCircle,
} from "@phosphor-icons/react";
import * as React from "react";

import { portalFetch } from "./api.js";
import type { PortalTranslations } from "./i18n.js";

interface Answer {
	fieldId: string;
	type: string;
	value: unknown;
}

interface ResponseMsg {
	messageId: string;
	submissionId: string;
	from: "admin" | "guest";
	body: string;
	sentAt: string;
	authorId: string | null;
}

export function PortalDetail({
	t,
	dir,
	email,
	token,
	submissionId,
	brandColor,
	onBack,
}: {
	t: PortalTranslations;
	dir: "ltr" | "rtl";
	email: string;
	token: string;
	submissionId: string;
	brandColor: string;
	onBack: () => void;
}) {
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [submission, setSubmission] = React.useState<Record<string, unknown> | null>(null);
	const [responses, setResponses] = React.useState<ResponseMsg[]>([]);
	const [fieldLabels, setFieldLabels] = React.useState<Record<string, string>>({});
	const [replyText, setReplyText] = React.useState("");
	const [sending, setSending] = React.useState(false);
	const [replyError, setReplyError] = React.useState<string | null>(null);
	const messagesEndRef = React.useRef<HTMLDivElement>(null);
	const accent = brandColor || "#2271b1";
	const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

	React.useEffect(() => {
		let cancelled = false;
		async function load() {
			setLoading(true);
			try {
				const res = await portalFetch("portal.submissionDetail", {
					email,
					token,
					submissionId,
				});
				const body = await res.json();
				const data = body.data ?? body;
				if (data.error) {
					setError(data.error === "UNAUTHORIZED" ? t["token.expired"] : t["common.error"]);
					return;
				}
				if (!cancelled) {
					setSubmission(data.submission);
					setResponses((data.responses ?? []) as ResponseMsg[]);
					setFieldLabels(data.fieldLabels ?? {});
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
	}, [submissionId, email, token]);

	React.useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [responses]);

	const handleSendReply = async () => {
		if (!replyText.trim()) return;
		setSending(true);
		setReplyError(null);

		try {
			const res = await portalFetch("portal.reply", {
				email,
				token,
				submissionId,
				body: replyText.trim(),
			});
			const body = await res.json();
			const data = body.data ?? body;
			if (data.error) {
				setReplyError(data.error === "UNAUTHORIZED" ? t["token.expired"] : t["common.error"]);
				return;
			}
			setResponses((prev) => [
				...prev,
				{
					messageId: data.messageId ?? `msg_${Date.now()}`,
					submissionId,
					from: "guest" as const,
					body: replyText.trim(),
					sentAt: new Date().toISOString(),
					authorId: null,
				},
			]);
			setReplyText("");
		} catch {
			setReplyError(t["common.error"]);
		} finally {
			setSending(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendReply();
		}
	};

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

	if (loading) {
		return (
			<div
				dir={dir}
				className="min-h-screen flex items-center justify-center"
				style={{
					backgroundColor: "#f7f8fa",
					fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
				}}
			>
				<ArrowsClockwise
					className="animate-spin"
					style={{ color: accent, width: 24, height: 24 }}
				/>
			</div>
		);
	}

	if (error || !submission) {
		return (
			<div
				dir={dir}
				className="min-h-screen flex items-center justify-center p-6"
				style={{
					backgroundColor: "#f7f8fa",
					fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
				}}
			>
				<div className="text-center">
					<p className="text-sm mb-4" style={{ color: "#dc2626" }}>
						{error || t["common.error"]}
					</p>
					<button
						onClick={onBack}
						className="text-sm font-medium"
						style={{ color: accent, background: "none", border: "none", cursor: "pointer" }}
					>
						{t["detail.back"]}
					</button>
				</div>
			</div>
		);
	}

	const answers = (submission.answers as Answer[]) ?? [];
	const status = (submission.status as string) ?? "open";
	const sColor = statusColor(status);

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
					padding: "20px 24px",
				}}
			>
				<div className="max-w-3xl mx-auto">
					<button
						onClick={onBack}
						className="flex items-center gap-1.5 text-sm font-medium mb-3"
						style={{
							color: "rgba(255,255,255,0.9)",
							background: "none",
							border: "none",
							cursor: "pointer",
						}}
					>
						<BackIcon style={{ width: 16, height: 16 }} />
						{t["detail.back"]}
					</button>
					<div className="flex items-center gap-3">
						<h1 className="text-lg font-bold" style={{ color: "#fff" }}>
							{(submission.formName as string) ?? t["detail.answers"]}
						</h1>
						<span
							className="text-xs font-mono px-2 py-0.5"
							style={{
								backgroundColor: "rgba(255,255,255,0.2)",
								color: "#fff",
								borderRadius: "6px",
							}}
						>
							{submission.trackingCode as string}
						</span>
						<span
							className="text-xs font-semibold px-2 py-0.5"
							style={{ backgroundColor: `${sColor}20`, color: "#fff", borderRadius: "6px" }}
						>
							{statusLabel(status)}
						</span>
					</div>
				</div>
			</div>

			<div className="max-w-3xl mx-auto px-4 py-6">
				{/* Submitted data */}
				<div
					className="mb-6 p-5"
					style={{
						backgroundColor: "#fff",
						borderRadius: "16px",
						boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
					}}
				>
					<h3
						className="text-xs font-bold uppercase tracking-wider mb-4"
						style={{ color: "#9ca3af" }}
					>
						{t["detail.answers"]}
					</h3>
					{answers.length > 0 ? (
						<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
							{answers.map((ans) => (
								<div key={ans.fieldId}>
									<span className="text-xs font-semibold block mb-1" style={{ color: "#6b7280" }}>
										{fieldLabels[ans.fieldId] ?? ans.fieldId}
									</span>
									<span className="text-sm" style={{ color: "#1a1a1a" }}>
										{ans.value == null
											? "—"
											: typeof ans.value === "object"
												? JSON.stringify(ans.value)
												: String(ans.value)}
									</span>
								</div>
							))}
						</div>
					) : (
						<p className="text-xs" style={{ color: "#9ca3af" }}>
							—
						</p>
					)}
				</div>

				{/* Conversation */}
				<div
					className="p-5"
					style={{
						backgroundColor: "#fff",
						borderRadius: "16px",
						boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
					}}
				>
					<div className="flex items-center gap-2 mb-4">
						<ChatCircle style={{ color: accent, width: 16, height: 16 }} />
						<h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#9ca3af" }}>
							{t["detail.conversation"]}
						</h3>
						{responses.length > 0 && (
							<span
								className="text-xs px-2 py-0.5"
								style={{ backgroundColor: `${accent}12`, color: accent, borderRadius: "100px" }}
							>
								{responses.length}
							</span>
						)}
					</div>

					{/* Timeline */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "12px",
							maxHeight: "400px",
							overflowY: "auto",
						}}
					>
						{/* Submitted marker */}
						<div className="flex items-center gap-2 py-2">
							<div className="flex-1" style={{ height: "1px", backgroundColor: "#e5e7eb" }} />
							<span className="text-xs flex items-center gap-1" style={{ color: "#9ca3af" }}>
								<Clock style={{ width: 12, height: 12 }} />
								{t["detail.initialSubmission"]}{" "}
								{new Date((submission.submittedAt as string) ?? "").toLocaleString(
									dir === "rtl" ? "fa-IR" : "en-US",
									{ month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
								)}
							</span>
							<div className="flex-1" style={{ height: "1px", backgroundColor: "#e5e7eb" }} />
						</div>

						{responses.length === 0 ? (
							<p className="text-xs text-center py-4" style={{ color: "#9ca3af" }}>
								{t["detail.noReplies"]}
							</p>
						) : (
							responses.map((msg) => {
								const isAdmin = msg.from === "admin";
								return (
									<div
										key={msg.messageId}
										className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
									>
										<div
											className="max-w-[80%] px-4 py-3"
											style={{
												backgroundColor: isAdmin ? "#f3f4f6" : `${accent}0d`,
												borderRadius: isAdmin ? "14px 14px 14px 4px" : "14px 14px 4px 14px",
											}}
										>
											<div className="flex items-center gap-1.5 mb-1.5">
												{isAdmin ? (
													<ShieldCheck style={{ color: accent, width: 12, height: 12 }} />
												) : (
													<User style={{ color: "#6b7280", width: 12, height: 12 }} />
												)}
												<span
													className="text-xs font-semibold"
													style={{ color: isAdmin ? accent : "#6b7280" }}
												>
													{isAdmin ? t.adminLabel : t.youLabel}
												</span>
												<span className="text-xs" style={{ color: "#9ca3af" }}>
													{new Date(msg.sentAt).toLocaleString(dir === "rtl" ? "fa-IR" : "en-US", {
														month: "short",
														day: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													})}
												</span>
											</div>
											<p
												className="text-sm"
												style={{ color: "#1a1a1a", whiteSpace: "pre-wrap", margin: 0 }}
											>
												{msg.body}
											</p>
										</div>
									</div>
								);
							})
						)}
						<div ref={messagesEndRef} />
					</div>

					{/* Reply input */}
					<div className="mt-4">
						{replyError && (
							<div
								className="text-xs mb-2 px-3 py-2"
								style={{ backgroundColor: "#fef2f2", color: "#dc2626", borderRadius: "8px" }}
							>
								{replyError}
							</div>
						)}
						<div
							className="flex items-end gap-2"
							style={{ backgroundColor: "#f9fafb", borderRadius: "14px", padding: "8px" }}
						>
							<textarea
								value={replyText}
								onChange={(e) => setReplyText(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder={t["detail.replyPlaceholder"]}
								rows={2}
								className="flex-1 text-sm resize-none focus:outline-none"
								style={{
									backgroundColor: "transparent",
									color: "#1a1a1a",
									border: "none",
									padding: "4px 8px",
								}}
							/>
							<button
								type="button"
								onClick={handleSendReply}
								disabled={!replyText.trim() || sending}
								className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all"
								style={{
									backgroundColor: !replyText.trim() || sending ? "#d1d5db" : accent,
									color: "#fff",
									borderRadius: "10px",
									border: "none",
									cursor: !replyText.trim() || sending ? "not-allowed" : "pointer",
								}}
							>
								{sending ? (
									<>
										<ArrowsClockwise className="animate-spin" style={{ width: 14, height: 14 }} />
										{t["detail.sending"]}
									</>
								) : (
									<>
										<PaperPlaneRight style={{ width: 14, height: 14 }} />
										{t["detail.sendReply"]}
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
