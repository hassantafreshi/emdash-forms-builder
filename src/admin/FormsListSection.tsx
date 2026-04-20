/**
 * Forms Builder — Forms List Section
 *
 * Displays all created forms in a sortable table with status badges,
 * submission counts, and quick actions (edit, duplicate, delete, publish).
 */

import { Copy, NotePencil, PlusCircle, Trash, ArrowCircleRight } from "@phosphor-icons/react";
import * as React from "react";

import { apiFetch, getErrorMessage } from "./api.js";
import { LoadingSpinner } from "./LoadingSpinner.js";

interface FormItem {
	formId: string;
	name: string;
	status: "draft" | "published" | "archived";
	submissionCount: number;
	lastSubmissionAt: string | null;
	createdAt: string;
	updatedAt: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
	draft: {
		bg: "var(--color-kumo-warning-tint, rgba(245,158,11,0.1))",
		color: "var(--color-kumo-warning, #b45309)",
		label: "Draft",
	},
	published: {
		bg: "var(--color-kumo-success-tint, rgba(22,163,74,0.1))",
		color: "var(--color-kumo-success, #16a34a)",
		label: "Published",
	},
	archived: {
		bg: "var(--color-kumo-tint)",
		color: "var(--text-color-kumo-inactive)",
		label: "Archived",
	},
};

export function FormsListSection({
	onEditForm,
	search,
	statusFilter,
}: {
	onEditForm: (formId: string) => void;
	search: string;
	statusFilter: string;
}) {
	const [loading, setLoading] = React.useState(true);
	const [forms, setForms] = React.useState<FormItem[]>([]);
	const [error, setError] = React.useState<string | null>(null);
	const [actionLoading, setActionLoading] = React.useState<string | null>(null);

	const loadForms = React.useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await apiFetch("forms.list", {
				limit: 100,
				status: statusFilter !== "all" ? statusFilter : undefined,
			});
			if (!res.ok) {
				setError(await getErrorMessage(res, "Failed to load forms"));
				return;
			}
			const body = await res.json();
			setForms((body.data?.items ?? body.items ?? []) as FormItem[]);
		} catch {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	}, [statusFilter]);

	React.useEffect(() => {
		loadForms();
	}, [loadForms]);

	const filtered = React.useMemo(() => {
		if (!search) return forms;
		const q = search.toLowerCase();
		return forms.filter(
			(f) => f.name.toLowerCase().includes(q) || f.formId.toLowerCase().includes(q),
		);
	}, [forms, search]);

	const handleDelete = async (formId: string) => {
		setActionLoading(formId);
		try {
			const res = await apiFetch("forms.delete", { formId });
			if (!res.ok) {
				setError(await getErrorMessage(res, "Failed to delete form"));
				return;
			}
			setForms((prev) => prev.filter((f) => f.formId !== formId));
		} catch {
			setError("Failed to delete form.");
		} finally {
			setActionLoading(null);
		}
	};

	const handleDuplicate = async (formId: string) => {
		setActionLoading(formId);
		try {
			const res = await apiFetch("forms.duplicate", { formId });
			if (!res.ok) {
				setError(await getErrorMessage(res, "Failed to duplicate form"));
				return;
			}
			await loadForms();
		} catch {
			setError("Failed to duplicate form.");
		} finally {
			setActionLoading(null);
		}
	};

	const handlePublish = async (formId: string) => {
		setActionLoading(formId);
		try {
			const res = await apiFetch("forms.publish", { formId });
			if (!res.ok) {
				setError(await getErrorMessage(res, "Failed to publish form"));
				return;
			}
			setForms((prev) =>
				prev.map((f) => (f.formId === formId ? { ...f, status: "published" as const } : f)),
			);
		} catch {
			setError("Failed to publish form.");
		} finally {
			setActionLoading(null);
		}
	};

	if (loading) return <LoadingSpinner message="Loading forms..." />;

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

			{/* Forms Table / Cards */}
			{filtered.length === 0 ? (
				<EmptyState hasAnyForms={forms.length > 0} />
			) : (
				<div className="space-y-3">
					{filtered.map((form) => {
						const statusStyle = STATUS_STYLES[form.status] ?? STATUS_STYLES.draft;
						const isActing = actionLoading === form.formId;
						return (
							<div
								key={form.formId}
								className="flex items-center gap-4 p-4 transition-all duration-200 hover:-translate-y-px group"
								style={{
									backgroundColor: "var(--color-kumo-base)",
									borderRadius: "14px",
									boxShadow: "0 2px 15px rgba(0,0,0,0.05)",
									opacity: isActing ? 0.5 : 1,
									pointerEvents: isActing ? "none" : "auto",
								}}
							>
								{/* Form icon */}
								<div
									className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
									style={{
										backgroundColor: "var(--color-kumo-tint)",
										borderRadius: "12px",
									}}
								>
									<NotePencil className="h-5 w-5" style={{ color: "var(--color-kumo-brand)" }} />
								</div>

								{/* Info */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<h3
											className="text-sm font-semibold truncate"
											style={{ color: "var(--text-color-kumo-default)" }}
										>
											{form.name}
										</h3>
										<span
											className="text-[10px] font-bold uppercase px-2 py-0.5"
											style={{
												backgroundColor: statusStyle.bg,
												color: statusStyle.color,
												borderRadius: "6px",
											}}
										>
											{statusStyle.label}
										</span>
									</div>
									<div
										className="flex items-center gap-4 text-xs"
										style={{ color: "var(--text-color-kumo-inactive)" }}
									>
										<span>
											{form.submissionCount} {form.submissionCount === 1 ? "response" : "responses"}
										</span>
										<span>
											Created{" "}
											{new Date(form.createdAt).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</span>
									</div>
								</div>

								{/* Actions */}
								<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<ActionButton
										icon={NotePencil}
										title="Edit"
										onClick={() => onEditForm(form.formId)}
									/>
									{form.status === "draft" && (
										<ActionButton
											icon={ArrowCircleRight}
											title="Publish"
											onClick={() => handlePublish(form.formId)}
											color="var(--color-kumo-success, #16a34a)"
										/>
									)}
									<ActionButton
										icon={Copy}
										title="Duplicate"
										onClick={() => handleDuplicate(form.formId)}
									/>
									<ActionButton
										icon={Trash}
										title="Delete"
										onClick={() => handleDelete(form.formId)}
										color="var(--color-kumo-danger)"
									/>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Action Button
// =============================================================================

function ActionButton({
	icon: Icon,
	title,
	onClick,
	color,
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	onClick: () => void;
	color?: string;
}) {
	return (
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			title={title}
			className="p-2 transition-all hover:opacity-80"
			style={{
				borderRadius: "8px",
				backgroundColor: "transparent",
				border: "none",
				cursor: "pointer",
				color: color ?? "var(--text-color-kumo-subtle)",
			}}
		>
			<Icon className="h-4 w-4" />
		</button>
	);
}

// =============================================================================
// Empty State
// =============================================================================

function EmptyState({ hasAnyForms }: { hasAnyForms: boolean }) {
	return (
		<div className="text-center py-20">
			<div
				className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
				style={{ backgroundColor: "var(--color-kumo-elevated)" }}
			>
				{hasAnyForms ? (
					<MagnifyingGlass
						className="h-7 w-7"
						style={{ color: "var(--text-color-kumo-inactive)" }}
					/>
				) : (
					<PlusCircle className="h-7 w-7" style={{ color: "var(--text-color-kumo-inactive)" }} />
				)}
			</div>
			<p className="text-sm font-medium" style={{ color: "var(--text-color-kumo-subtle)" }}>
				{hasAnyForms ? "No forms match your search" : "No forms created yet"}
			</p>
			<p className="text-xs mt-1" style={{ color: "var(--text-color-kumo-inactive)" }}>
				{hasAnyForms
					? "Try a different search term or filter"
					: "Go to Create Form to build your first form"}
			</p>
		</div>
	);
}
