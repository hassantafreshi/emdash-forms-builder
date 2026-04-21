/**
 * Forms Builder — Responses Section
 *
 * Displays all form submissions with filtering by form and status,
 * expandable detail view showing individual answers, reply thread
 * (conversation view), admin reply form, and status management.
 */

import {
	ChatCircle,
	Eye,
	Trash,
	CaretDown,
	CaretRight,
	Check,
	EnvelopeSimple,
	PaperPlaneRight,
	ArrowBendUpLeft,
	User,
	ShieldCheck,
	Clock,
} from "@phosphor-icons/react";
import * as React from "react";

import { apiFetch, getErrorMessage } from "./api.js";
import { LoadingSpinner } from "./LoadingSpinner.js";

interface SubmissionItem {
	submissionId: string;
	formId: string;
	formName: string;
	trackingCode: string;
	status: "open" | "closed" | "read";
	submittedAt: string;
}

interface SubmissionDetail {
	submissionId: string;
	formId: string;
	trackingCode: string;
	status: string;
	submittedAt: string;
	formName?: string;
	email?: string;
	answers: Array<{ fieldId: string; type: string; value: unknown }>;
	audit: Array<{ at: string; event: string; actor: string }>;
}

interface ResponseMessage {
	messageId: string;
	submissionId: string;
	from: "admin" | "guest";
	body: string;
	sentAt: string;
	authorId: string | null;
}

const STATUS_CONFIG: Record<
	string,
	{ bg: string; color: string; label: string; icon: React.ComponentType<{ className?: string }> }
> = {
	open: {
		bg: "var(--color-kumo-info-tint, rgba(59,130,246,0.1))",
		color: "var(--color-kumo-info, #2563eb)",
		label: "New",
		icon: EnvelopeSimple,
	},
	read: {
		bg: "var(--color-kumo-warning-tint, rgba(245,158,11,0.1))",
		color: "var(--color-kumo-warning, #b45309)",
		label: "Read",
		icon: Eye,
	},
	closed: {
		bg: "var(--color-kumo-tint)",
		color: "var(--text-color-kumo-inactive)",
		label: "Closed",
		icon: Check,
	},
};

// =============================================================================
// Reply Thread Component
// =============================================================================

function ReplyThread({ submissionId, detail }: { submissionId: string; detail: SubmissionDetail }) {
	const [responses, setResponses] = React.useState<ResponseMessage[]>([]);
	const [loadingResponses, setLoadingResponses] = React.useState(true);
	const [replyText, setReplyText] = React.useState("");
	const [sending, setSending] = React.useState(false);
	const [replyError, setReplyError] = React.useState<string | null>(null);
	const messagesEndRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		let cancelled = false;
		async function loadResponses() {
			setLoadingResponses(true);
			try {
				const res = await apiFetch("submissions.responses", { submissionId });
				if (res.ok) {
					const body = await res.json();
					if (!cancelled) {
						setResponses((body.data?.items ?? body.items ?? []) as ResponseMessage[]);
					}
				}
			} catch {
				// Silently fail
			} finally {
				if (!cancelled) setLoadingResponses(false);
			}
		}
		loadResponses();
		return () => {
			cancelled = true;
		};
	}, [submissionId]);

	React.useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [responses]);

	const handleSendReply = async () => {
		if (!replyText.trim()) return;
		setSending(true);
		setReplyError(null);

		try {
			const res = await apiFetch("submissions.reply", {
				submissionId,
				body: replyText.trim(),
			});
			if (!res.ok) {
				setReplyError(await getErrorMessage(res, "Failed to send reply"));
				return;
			}
			const body = await res.json();
			const messageId = body.data?.messageId ?? body.messageId;

			setResponses((prev) => [
				...prev,
				{
					messageId: messageId ?? `msg_${Date.now()}`,
					submissionId,
					from: "admin" as const,
					body: replyText.trim(),
					sentAt: new Date().toISOString(),
					authorId: null,
				},
			]);
			setReplyText("");
		} catch {
			setReplyError("Network error. Please try again.");
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

	return (
		<div className="mt-4">
			{/* Conversation header */}
			<div className="flex items-center gap-2 mb-3">
				<ChatCircle className="h-4 w-4" style={{ color: "var(--color-kumo-brand)" }} />
				<span className="text-xs font-semibold" style={{ color: "var(--text-color-kumo-default)" }}>
					Conversation
				</span>
				{responses.length > 0 && (
					<span
						className="text-[10px] px-2 py-0.5"
						style={{
							backgroundColor: "var(--color-kumo-brand-tint, rgba(34,113,177,0.08))",
							color: "var(--color-kumo-brand)",
							borderRadius: "100px",
						}}
					>
						{responses.length} {responses.length === 1 ? "message" : "messages"}
					</span>
				)}
			</div>

			{/* Messages */}
			<div
				className="space-y-3 max-h-80 overflow-y-auto px-1 pb-1"
				style={{ scrollbarWidth: "thin" }}
			>
				{/* Initial submission marker */}
				<div className="flex items-center gap-2 py-2">
					<div className="flex-1 h-px" style={{ backgroundColor: "var(--color-kumo-line)" }} />
					<span
						className="text-[10px] px-2 flex items-center gap-1"
						style={{ color: "var(--text-color-kumo-inactive)" }}
					>
						<Clock className="h-3 w-3" />
						Form submitted{" "}
						{new Date(detail.submittedAt).toLocaleString("en-US", {
							month: "short",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
					<div className="flex-1 h-px" style={{ backgroundColor: "var(--color-kumo-line)" }} />
				</div>

				{loadingResponses ? (
					<div className="flex items-center justify-center py-4">
						<div
							className="w-4 h-4 rounded-full animate-spin"
							style={{
								border: "2px solid var(--color-kumo-line)",
								borderTopColor: "var(--color-kumo-brand)",
							}}
						/>
					</div>
				) : responses.length === 0 ? (
					<p
						className="text-xs text-center py-3"
						style={{ color: "var(--text-color-kumo-inactive)" }}
					>
						No replies yet. Send a reply below.
					</p>
				) : (
					responses.map((msg) => {
						const isAdmin = msg.from === "admin";
						return (
							<div
								key={msg.messageId}
								className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
							>
								<div
									className="max-w-[80%] px-4 py-3"
									style={{
										backgroundColor: isAdmin
											? "var(--color-kumo-brand-tint, rgba(34,113,177,0.08))"
											: "var(--color-kumo-elevated)",
										borderRadius: isAdmin ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
									}}
								>
									<div className="flex items-center gap-1.5 mb-1.5">
										{isAdmin ? (
											<ShieldCheck
												className="h-3 w-3"
												style={{ color: "var(--color-kumo-brand)" }}
											/>
										) : (
											<User
												className="h-3 w-3"
												style={{ color: "var(--text-color-kumo-subtle)" }}
											/>
										)}
										<span
											className="text-[10px] font-semibold"
											style={{
												color: isAdmin
													? "var(--color-kumo-brand)"
													: "var(--text-color-kumo-subtle)",
											}}
										>
											{isAdmin ? "Admin" : "User"}
										</span>
										<span
											className="text-[10px]"
											style={{ color: "var(--text-color-kumo-inactive)" }}
										>
											{new Date(msg.sentAt).toLocaleString("en-US", {
												month: "short",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>
									<p
										className="text-sm whitespace-pre-wrap"
										style={{ color: "var(--text-color-kumo-default)", margin: 0 }}
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
			<div className="mt-3">
				{replyError && (
					<div
						className="text-xs mb-2 px-3 py-2"
						style={{
							backgroundColor: "var(--color-kumo-danger-tint, rgba(239,68,68,0.08))",
							color: "var(--color-kumo-danger)",
							borderRadius: "8px",
						}}
					>
						{replyError}
					</div>
				)}
				<div
					className="flex items-end gap-2 mb-2"
					style={{
						backgroundColor: "var(--color-kumo-elevated)",
						borderRadius: "14px",
						padding: "8px",
					}}
				>
					<textarea
						value={replyText}
						onChange={(e) => setReplyText(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type a reply... (Enter to send, Shift+Enter for new line)"
						rows={2}
						className="flex-1 text-sm resize-none focus:outline-none"
						style={{
							backgroundColor: "transparent",
							color: "var(--text-color-kumo-default)",
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
							backgroundColor:
								!replyText.trim() || sending ? "var(--color-kumo-line)" : "var(--color-kumo-brand)",
							color:
								!replyText.trim() || sending
									? "var(--text-color-kumo-inactive)"
									: "var(--color-kumo-base)",
							borderRadius: "10px",
							border: "none",
							cursor: !replyText.trim() || sending ? "not-allowed" : "pointer",
						}}
					>
						{sending ? (
							<>
								<div
									className="w-3 h-3 rounded-full animate-spin"
									style={{
										border: "2px solid currentColor",
										borderTopColor: "transparent",
									}}
								/>
								Sending
							</>
						) : (
							<>
								<PaperPlaneRight className="h-3.5 w-3.5" />
								Reply
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// Main Responses Section
// =============================================================================

export function ResponsesSection({
	search,
	statusFilter,
}: {
	search: string;
	statusFilter: string;
}) {
	const [loading, setLoading] = React.useState(true);
	const [submissions, setSubmissions] = React.useState<SubmissionItem[]>([]);
	const [error, setError] = React.useState<string | null>(null);
	const [expandedId, setExpandedId] = React.useState<string | null>(null);
	const [detailCache, setDetailCache] = React.useState<Record<string, SubmissionDetail>>({});
	const [detailLoading, setDetailLoading] = React.useState<string | null>(null);

	React.useEffect(() => {
		let cancelled = false;
		async function load() {
			setLoading(true);
			setError(null);
			try {
				const res = await apiFetch("submissions.list", {
					limit: 100,
					status: statusFilter !== "all" ? statusFilter : undefined,
				});
				if (!res.ok) {
					setError(await getErrorMessage(res, "Failed to load responses"));
					return;
				}
				const body = await res.json();
				if (!cancelled) {
					setSubmissions((body.data?.items ?? body.items ?? []) as SubmissionItem[]);
				}
			} catch {
				if (!cancelled) setError("Network error. Please try again.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [statusFilter]);

	const filtered = React.useMemo(() => {
		if (!search) return submissions;
		const q = search.toLowerCase();
		return submissions.filter(
			(s) =>
				s.formName.toLowerCase().includes(q) ||
				s.trackingCode.toLowerCase().includes(q) ||
				s.submissionId.toLowerCase().includes(q),
		);
	}, [submissions, search]);

	const handleToggleExpand = async (submissionId: string) => {
		if (expandedId === submissionId) {
			setExpandedId(null);
			return;
		}
		setExpandedId(submissionId);

		// Load detail if not cached
		if (!detailCache[submissionId]) {
			setDetailLoading(submissionId);
			try {
				const res = await apiFetch("submissions.get", { submissionId });
				if (res.ok) {
					const body = await res.json();
					const detail = (body.data?.submission ?? body.submission) as SubmissionDetail;
					if (detail) {
						setDetailCache((prev) => ({ ...prev, [submissionId]: detail }));
					}
				}
			} catch {
				// Silently fail — row stays expanded but empty
			} finally {
				setDetailLoading(null);
			}

			// Mark as read if open
			const sub = submissions.find((s) => s.submissionId === submissionId);
			if (sub?.status === "open") {
				try {
					await apiFetch("submissions.updateStatus", { submissionId, status: "read" });
					setSubmissions((prev) =>
						prev.map((s) =>
							s.submissionId === submissionId ? { ...s, status: "read" as const } : s,
						),
					);
				} catch {
					// Non-critical
				}
			}
		}
	};

	const handleStatusChange = async (submissionId: string, newStatus: string) => {
		try {
			const res = await apiFetch("submissions.updateStatus", { submissionId, status: newStatus });
			if (res.ok) {
				setSubmissions((prev) =>
					prev.map((s) =>
						s.submissionId === submissionId
							? { ...s, status: newStatus as SubmissionItem["status"] }
							: s,
					),
				);
			}
		} catch {
			// Silently fail
		}
	};

	const handleDelete = async (submissionId: string) => {
		try {
			const res = await apiFetch("submissions.delete", { submissionId });
			if (res.ok) {
				setSubmissions((prev) => prev.filter((s) => s.submissionId !== submissionId));
				if (expandedId === submissionId) setExpandedId(null);
			}
		} catch {
			setError("Failed to delete response.");
		}
	};

	if (loading) return <LoadingSpinner message="Loading responses..." />;

	return (
		<div className="max-w-6xl mx-auto px-6 py-8">
			{error && (
				<div
					className="mb-6 px-4 py-3 text-sm font-medium"
					style={{
						backgroundColor: "var(--color-kumo-danger-tint, rgba(239,68,68,0.08))",
						color: "var(--color-kumo-danger)",
						borderRadius: "12px",
					}}
				>
					{error}
				</div>
			)}

			{/* Submissions list */}
			{filtered.length === 0 ? (
				<div className="text-center py-20">
					<div
						className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
						style={{ backgroundColor: "var(--color-kumo-elevated)" }}
					>
						<ChatCircle className="h-7 w-7" style={{ color: "var(--text-color-kumo-inactive)" }} />
					</div>
					<p className="text-sm font-medium" style={{ color: "var(--text-color-kumo-subtle)" }}>
						{submissions.length > 0 ? "No responses match your search" : "No responses yet"}
					</p>
					<p className="text-xs mt-1" style={{ color: "var(--text-color-kumo-inactive)" }}>
						{submissions.length > 0
							? "Try a different search or filter"
							: "Responses will appear here when users submit your forms"}
					</p>
				</div>
			) : (
				<div className="space-y-2">
					{filtered.map((sub) => {
						const statusCfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.open;
						const StatusIcon = statusCfg.icon;
						const isExpanded = expandedId === sub.submissionId;
						const detail = detailCache[sub.submissionId];
						const isLoadingDetail = detailLoading === sub.submissionId;

						return (
							<div
								key={sub.submissionId}
								style={{
									backgroundColor: "var(--color-kumo-base)",
									borderRadius: "14px",
									boxShadow: "0 2px 15px rgba(0,0,0,0.05)",
									overflow: "hidden",
								}}
							>
								{/* Row header */}
								<button
									type="button"
									onClick={() => handleToggleExpand(sub.submissionId)}
									className="w-full flex items-center gap-4 p-4 text-left transition-all hover:opacity-90"
									style={{ background: "none", border: "none", cursor: "pointer" }}
								>
									{/* Expand icon */}
									<div style={{ color: "var(--text-color-kumo-inactive)" }}>
										{isExpanded ? (
											<CaretDown className="h-4 w-4" />
										) : (
											<CaretRight className="h-4 w-4" />
										)}
									</div>

									{/* Status badge */}
									<div
										className="flex items-center gap-1.5 px-2.5 py-1"
										style={{
											backgroundColor: statusCfg.bg,
											color: statusCfg.color,
											borderRadius: "8px",
											fontSize: "11px",
											fontWeight: 600,
										}}
									>
										<StatusIcon className="h-3.5 w-3.5" />
										{statusCfg.label}
									</div>

									{/* Info */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span
												className="text-sm font-semibold truncate"
												style={{ color: "var(--text-color-kumo-default)" }}
											>
												{sub.formName}
											</span>
											<span
												className="text-[10px] font-mono px-1.5 py-0.5"
												style={{
													color: "var(--text-color-kumo-inactive)",
													backgroundColor: "var(--color-kumo-elevated)",
													borderRadius: "4px",
												}}
											>
												{sub.trackingCode}
											</span>
										</div>
										<span className="text-xs" style={{ color: "var(--text-color-kumo-inactive)" }}>
											{new Date(sub.submittedAt).toLocaleString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>

									{/* Quick actions */}
									<div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
										{sub.status === "closed" ? (
											<button
												type="button"
												title="Reopen"
												onClick={() => handleStatusChange(sub.submissionId, "open")}
												className="p-1.5"
												style={{
													background: "none",
													border: "none",
													cursor: "pointer",
													color: "var(--color-kumo-info)",
													borderRadius: "6px",
												}}
											>
												<ArrowBendUpLeft className="h-3.5 w-3.5" />
											</button>
										) : (
											<button
												type="button"
												title="Mark as closed"
												onClick={() => handleStatusChange(sub.submissionId, "closed")}
												className="p-1.5"
												style={{
													background: "none",
													border: "none",
													cursor: "pointer",
													color: "var(--text-color-kumo-subtle)",
													borderRadius: "6px",
												}}
											>
												<Check className="h-3.5 w-3.5" />
											</button>
										)}
										<button
											type="button"
											title="Delete"
											onClick={() => handleDelete(sub.submissionId)}
											className="p-1.5"
											style={{
												background: "none",
												border: "none",
												cursor: "pointer",
												color: "var(--color-kumo-danger)",
												borderRadius: "6px",
											}}
										>
											<Trash className="h-3.5 w-3.5" />
										</button>
									</div>
								</button>

								{/* Expanded detail */}
								{isExpanded && (
									<div
										className="px-6 pb-5 pt-1"
										style={{
											borderTop: "1px solid var(--color-kumo-line)",
										}}
									>
										{isLoadingDetail ? (
											<div className="flex items-center gap-3 py-6 justify-center">
												<div
													className="w-5 h-5 rounded-full animate-spin"
													style={{
														border: "2px solid var(--color-kumo-line)",
														borderTopColor: "var(--color-kumo-brand)",
													}}
												/>
												<span
													className="text-xs"
													style={{ color: "var(--text-color-kumo-subtle)" }}
												>
													Loading details...
												</span>
											</div>
										) : detail ? (
											<div>
												{/* Submitted answers */}
												<div className="space-y-2 mt-3">
													<div className="flex items-center gap-2 mb-2">
														<Eye
															className="h-3.5 w-3.5"
															style={{ color: "var(--text-color-kumo-subtle)" }}
														/>
														<span
															className="text-xs font-semibold"
															style={{ color: "var(--text-color-kumo-default)" }}
														>
															Submitted Data
														</span>
													</div>
													{detail.answers.length > 0 ? (
														<div
															className="p-3"
															style={{
																backgroundColor: "var(--color-kumo-elevated)",
																borderRadius: "10px",
															}}
														>
															{detail.answers.map((ans, idx) => (
																<div
																	key={ans.fieldId}
																	className="flex gap-3 py-2"
																	style={{
																		borderBottom:
																			idx < detail.answers.length - 1
																				? "1px solid var(--color-kumo-line)"
																				: "none",
																	}}
																>
																	<span
																		className="text-xs font-semibold w-36 flex-shrink-0 pt-0.5"
																		style={{ color: "var(--text-color-kumo-subtle)" }}
																	>
																		{ans.fieldId}
																	</span>
																	<span
																		className="text-sm"
																		style={{ color: "var(--text-color-kumo-default)" }}
																	>
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
														<p
															className="text-xs py-2 text-center"
															style={{ color: "var(--text-color-kumo-inactive)" }}
														>
															No answers recorded
														</p>
													)}
												</div>

												{/* Reply thread */}
												<ReplyThread submissionId={sub.submissionId} detail={detail} />
											</div>
										) : (
											<p
												className="text-xs py-4 text-center"
												style={{ color: "var(--text-color-kumo-inactive)" }}
											>
												Could not load details
											</p>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
