/**
 * Forms Builder — Main Builder Layout
 *
 * Three-panel layout:
 *   Left sidebar  — field palette (categorized, searchable, draggable)
 *   Center canvas — drop zone with real rendered fields, DnD reorder, selection
 *   Right sidebar — FieldSettingsPanel (appears when a field is selected)
 *
 * Toolbar: back, form name, save, preview toggle, undo/redo, import/export.
 */

import {
	ArrowCounterClockwise,
	ArrowClockwise,
	ArrowLeft,
	Download,
	FloppyDisk,
	GearSix,
	MagnifyingGlass,
	Plus,
	Trash,
	Upload,
	DotsSixVertical,
	ArrowRight,
	ArrowsClockwise,
	Rows,
	X,
} from "@phosphor-icons/react";
import * as React from "react";

import { AfterSubmitPanel } from "./AfterSubmitPanel.js";
import { apiFetch } from "./api.js";
import { FIELD_TYPE_REGISTRY, type FieldTypeMeta } from "./field-defaults.js";
import { FieldRenderer, getFieldIcon } from "./FieldRenderer.js";
import { FieldSettingsPanel } from "./FieldSettingsPanel.js";
import { loadFormDefinition } from "./loadFormDefinition.js";
import type {
	AfterSubmitConfig,
	ButtonAlign,
	ButtonSize,
	ButtonVariant,
	CanvasField,
	NextButtonConfig,
	SubmitButtonConfig,
	WidthOption,
} from "./types.js";
import {
	DEFAULT_NEXT_BUTTON,
	DEFAULT_SUBMIT_BUTTON,
	useFormBuilder,
	type FormBuilderActions,
} from "./useFormBuilder.js";

// =============================================================================
// Save callback type
// =============================================================================

export interface FormBuilderSaveData {
	formId: string | null;
	name: string;
	description: string;
	fields: CanvasField[];
	submitButton?: SubmitButtonConfig;
	afterSubmit?: AfterSubmitConfig;
}

export type FormBuilderOnSave = (data: FormBuilderSaveData) => Promise<{ formId: string }>;

// =============================================================================
// Width helpers
// =============================================================================

const WIDTH_MAP: Record<WidthOption, string> = {
	full: "100%",
	half: "calc(50% - 6px)",
	third: "calc(33.333% - 8px)",
	quarter: "calc(25% - 9px)",
};

// =============================================================================
// Canvas organization — step/group containment model
//
// Steps are positional dividers: fields between two step fields belong to that step.
// Groups use reference-based containment: fields with groupId render inside their group.
// =============================================================================

type CanvasItem =
	| { kind: "field"; field: CanvasField; flatIndex: number }
	| {
			kind: "group";
			group: CanvasField;
			flatIndex: number;
			children: { field: CanvasField; flatIndex: number }[];
	  };

interface CanvasSection {
	step: CanvasField | null;
	stepFlatIndex: number;
	items: CanvasItem[];
}

function organizeCanvas(fields: CanvasField[]): CanvasSection[] {
	// Collect fields that belong to groups
	const groupChildren = new Map<string, { field: CanvasField; flatIndex: number }[]>();
	for (let i = 0; i < fields.length; i++) {
		const f = fields[i]!;
		if (f.groupId) {
			const arr = groupChildren.get(f.groupId) ?? [];
			arr.push({ field: f, flatIndex: i });
			groupChildren.set(f.groupId, arr);
		}
	}

	const sections: CanvasSection[] = [];
	let current: CanvasSection = { step: null, stepFlatIndex: -1, items: [] };

	for (let i = 0; i < fields.length; i++) {
		const f = fields[i]!;
		if (f.fieldType === "step") {
			if (current.step !== null || current.items.length > 0) {
				sections.push(current);
			}
			current = { step: f, stepFlatIndex: i, items: [] };
		} else if (f.groupId) {
			// Rendered inside its group container, skip at top level
			continue;
		} else if (f.fieldType === "group") {
			current.items.push({
				kind: "group",
				group: f,
				flatIndex: i,
				children: groupChildren.get(f.instanceId) ?? [],
			});
		} else {
			current.items.push({ kind: "field", field: f, flatIndex: i });
		}
	}

	if (current.step !== null || current.items.length > 0) {
		sections.push(current);
	}

	return sections;
}

// =============================================================================
// Shared palette category types
// =============================================================================

type PaletteCategory = "all" | "basic" | "payment" | "advanced" | "structural";

const PALETTE_CATEGORIES: { id: PaletteCategory; label: string }[] = [
	{ id: "all", label: "All" },
	{ id: "basic", label: "Basic" },
	{ id: "payment", label: "Payment" },
	{ id: "advanced", label: "Advanced" },
	{ id: "structural", label: "Layout" },
];

// =============================================================================
// Palette Field Item (draggable, clickable)
// =============================================================================

function PaletteFieldItem({
	meta,
	onAdd,
}: {
	meta: FieldTypeMeta;
	onAdd: (fieldType: string) => void;
}) {
	const Icon = getFieldIcon(meta.type);

	const handleDragStart = (e: React.DragEvent) => {
		e.dataTransfer.setData("application/x-form-field", meta.type);
		e.dataTransfer.effectAllowed = "copy";
	};

	return (
		<button
			type="button"
			draggable
			onDragStart={handleDragStart}
			onClick={() => onAdd(meta.type)}
			className="flex flex-col items-center justify-center gap-2 px-3 py-4 cursor-grab active:cursor-grabbing group transition-all duration-200 hover:-translate-y-0.5"
			style={{
				backgroundColor: "var(--color-kumo-base)",
				borderRadius: "20px",
				boxShadow: "0 2px 15px rgba(0,0,0,0.06)",
			}}
			title={`Drag or click to add ${meta.label}`}
		>
			<div
				className="w-10 h-10 flex items-center justify-center transition-colors"
				style={{
					backgroundColor: "var(--color-kumo-tint)",
					borderRadius: "14px",
				}}
			>
				<Icon
					className="h-5 w-5"
					style={
						{
							color: "var(--text-color-kumo-strong)",
						} as React.CSSProperties
					}
				/>
			</div>
			<span
				className="text-[11px] font-medium text-center leading-tight"
				style={{ color: "var(--text-color-kumo-strong)" }}
			>
				{meta.label}
			</span>
		</button>
	);
}

// =============================================================================
// Canvas Field Card (rendered field with selection, drag handle, actions)
// =============================================================================

function CanvasFieldCard({
	field,
	isSelected,
	onSelect,
	onRemove,
	onLabelChange,
	onDragStart,
	onDragOver,
	onDrop,
}: {
	field: CanvasField;
	isSelected: boolean;
	onSelect: () => void;
	onRemove: () => void;
	onLabelChange: (newLabel: string) => void;
	onDragStart: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
}) {
	return (
		<div
			draggable
			onDragStart={onDragStart}
			onClick={onSelect}
			onDragOver={onDragOver}
			onDrop={onDrop}
			className="group cursor-grab active:cursor-grabbing transition-all duration-150"
			style={{
				padding: "12px 14px",
				borderRadius: "16px",
				backgroundColor: "var(--color-kumo-base)",
				border: isSelected ? "2px solid var(--color-kumo-brand)" : "2px solid transparent",
				boxShadow: isSelected ? "0 4px 20px rgba(34,113,177,0.1)" : "0 2px 12px rgba(0,0,0,0.04)",
				position: "relative",
				opacity: field.hidden ? 0.45 : field.disabled ? 0.7 : 1,
			}}
		>
			{/* Hidden / disabled badge */}
			{(field.hidden || field.disabled) && (
				<div
					style={{
						position: "absolute",
						top: 6,
						right: 40,
						fontSize: "9px",
						fontWeight: 700,
						textTransform: "uppercase",
						letterSpacing: "0.06em",
						padding: "2px 6px",
						borderRadius: 4,
						backgroundColor: field.hidden
							? "var(--color-kumo-warning-tint, rgba(245,158,11,0.12))"
							: "var(--color-kumo-tint)",
						color: field.hidden
							? "var(--color-kumo-warning, #b45309)"
							: "var(--text-color-kumo-inactive)",
						zIndex: 1,
					}}
				>
					{field.hidden ? "Hidden" : "Disabled"}
				</div>
			)}
			{/* Top bar — drag handle + remove */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: 8,
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 4,
						padding: "2px 6px",
						borderRadius: 6,
						color: "var(--text-color-kumo-inactive)",
					}}
				>
					<DotsSixVertical className="h-4 w-4" />
					<span
						style={{
							fontSize: "10px",
							fontWeight: 600,
							textTransform: "uppercase",
							letterSpacing: "0.04em",
							color: "var(--text-color-kumo-inactive)",
						}}
					>
						{field.fieldType}
					</span>
				</div>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					className="opacity-0 group-hover:opacity-100 transition-opacity"
					style={{
						background: "none",
						border: "none",
						cursor: "pointer",
						padding: 4,
						color: "var(--color-kumo-danger)",
					}}
				>
					<Trash className="h-3.5 w-3.5" />
				</button>
			</div>

			{/* Actual field render */}
			<FieldRenderer field={field} onLabelChange={onLabelChange} />

			{/* Selection ring indicator */}
			{isSelected && (
				<div
					style={{
						position: "absolute",
						top: -2,
						right: -2,
						width: 10,
						height: 10,
						borderRadius: "50%",
						backgroundColor: "var(--color-kumo-brand)",
						border: "2px solid var(--color-kumo-base)",
					}}
				/>
			)}
		</div>
	);
}

// =============================================================================
// Step Section Card — renders a step header that contains its child fields
// =============================================================================

function StepSectionCard({
	step,
	stepNumber,
	totalSteps,
	isSelected,
	onSelect,
	onRemove,
	onDragStart,
	onDragOver,
	onDrop,
	children,
}: {
	step: CanvasField;
	stepNumber: number;
	totalSteps: number;
	isSelected: boolean;
	onSelect: () => void;
	onRemove: () => void;
	onDragStart: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
	children: React.ReactNode;
}) {
	const cfg = step.stepConfig;
	return (
		<div style={{ marginBottom: 4 }}>
			{/* Step header — clickable, draggable, selectable */}
			<div
				draggable
				onDragStart={onDragStart}
				onClick={onSelect}
				onDragOver={onDragOver}
				onDrop={onDrop}
				className="group cursor-grab active:cursor-grabbing transition-all duration-150"
				style={{
					padding: "12px 16px",
					borderRadius: "14px 14px 0 0",
					backgroundColor: "var(--color-kumo-info-tint)",
					border: isSelected
						? "2px solid var(--color-kumo-brand)"
						: "2px solid var(--color-kumo-recessed)",
					borderBottom: "none",
					position: "relative",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<DotsSixVertical
						className="h-4 w-4 flex-shrink-0"
						style={{ color: "var(--text-color-kumo-inactive)" }}
					/>
					<Rows className="h-4 w-4 flex-shrink-0" style={{ color: "var(--color-kumo-brand)" }} />
					{cfg.showStepNumber && (
						<span
							style={{
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								width: 22,
								height: 22,
								borderRadius: "50%",
								backgroundColor: "var(--color-kumo-brand)",
								color: "white",
								fontSize: "11px",
								fontWeight: 700,
								flexShrink: 0,
							}}
						>
							{stepNumber}
						</span>
					)}
					<span
						style={{
							fontSize: "14px",
							fontWeight: 700,
							color: "var(--color-kumo-brand)",
							flex: 1,
						}}
					>
						{step.label}
					</span>
					<span
						style={{
							fontSize: "10px",
							fontWeight: 600,
							textTransform: "uppercase",
							letterSpacing: "0.04em",
							color: "var(--text-color-kumo-inactive)",
						}}
					>
						Step {stepNumber} of {totalSteps}
					</span>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							padding: 4,
							color: "var(--color-kumo-danger)",
						}}
					>
						<Trash className="h-3.5 w-3.5" />
					</button>
				</div>
				{cfg.description && (
					<p
						style={{
							fontSize: "12px",
							color: "var(--text-color-kumo-subtle)",
							margin: "4px 0 0 0",
							paddingLeft: cfg.showStepNumber ? 62 : 40,
						}}
					>
						{cfg.description}
					</p>
				)}
				{cfg.showProgressBar && (
					<div
						style={{
							marginTop: 8,
							height: 3,
							borderRadius: 2,
							backgroundColor: "var(--color-kumo-recessed)",
							overflow: "hidden",
						}}
					>
						<div
							style={{
								width: `${Math.round((stepNumber / totalSteps) * 100)}%`,
								height: "100%",
								borderRadius: 2,
								backgroundColor: "var(--color-kumo-brand)",
								transition: "width 0.3s ease",
							}}
						/>
					</div>
				)}
				{isSelected && (
					<div
						style={{
							position: "absolute",
							top: -2,
							right: -2,
							width: 10,
							height: 10,
							borderRadius: "50%",
							backgroundColor: "var(--color-kumo-brand)",
							border: "2px solid var(--color-kumo-base)",
						}}
					/>
				)}
			</div>
			{/* Step body — contains child fields */}
			<div
				style={{
					padding: "12px",
					borderRadius: "0 0 14px 14px",
					border: isSelected
						? "2px solid var(--color-kumo-brand)"
						: "2px solid var(--color-kumo-recessed)",
					borderTop: "1px dashed var(--color-kumo-line)",
					backgroundColor: "var(--color-kumo-base)",
					minHeight: 60,
				}}
			>
				{children}
			</div>
		</div>
	);
}

// =============================================================================
// Group Container Card — renders a group with its child fields inside
// =============================================================================

function GroupContainerCard({
	group,
	isSelected,
	onSelect,
	onRemove,
	onDragStart,
	onDragOver,
	onDrop,
	onDropInside,
	children,
}: {
	group: CanvasField;
	isSelected: boolean;
	onSelect: () => void;
	onRemove: () => void;
	onDragStart: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
	onDropInside: (e: React.DragEvent) => void;
	children: React.ReactNode;
}) {
	const cfg = group.groupConfig;
	const [innerDragOver, setInnerDragOver] = React.useState(false);

	const handleInnerDragOver = (e: React.DragEvent) => {
		if (
			e.dataTransfer.types.includes("application/x-form-field") ||
			e.dataTransfer.types.includes("application/x-reorder")
		) {
			e.preventDefault();
			e.stopPropagation();
			e.dataTransfer.dropEffect = e.dataTransfer.types.includes("application/x-form-field")
				? "copy"
				: "move";
			setInnerDragOver(true);
		}
	};

	const handleInnerDragLeave = (e: React.DragEvent) => {
		const rect = e.currentTarget.getBoundingClientRect();
		if (
			e.clientX < rect.left ||
			e.clientX > rect.right ||
			e.clientY < rect.top ||
			e.clientY > rect.bottom
		) {
			setInnerDragOver(false);
		}
	};

	const handleInnerDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setInnerDragOver(false);
		onDropInside(e);
	};

	return (
		<div
			draggable
			onDragStart={onDragStart}
			onClick={onSelect}
			onDragOver={onDragOver}
			onDrop={onDrop}
			className="group cursor-grab active:cursor-grabbing transition-all duration-150"
			style={{
				borderRadius: "14px",
				backgroundColor: "var(--color-kumo-tint)",
				border: isSelected
					? "2px solid var(--color-kumo-brand)"
					: cfg.showBorder
						? "2px solid var(--color-kumo-line)"
						: "2px dashed var(--color-kumo-line)",
				padding: "12px",
				position: "relative",
			}}
		>
			{/* Group header */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 6,
					marginBottom: 8,
				}}
			>
				<DotsSixVertical
					className="h-4 w-4 flex-shrink-0"
					style={{ color: "var(--text-color-kumo-inactive)" }}
				/>
				<span
					style={{
						fontSize: "10px",
						fontWeight: 600,
						textTransform: "uppercase",
						letterSpacing: "0.04em",
						color: "var(--text-color-kumo-inactive)",
					}}
				>
					group
				</span>
				{cfg.showTitle && (
					<span
						style={{
							fontSize: "13px",
							fontWeight: 700,
							color: "var(--text-color-kumo-default)",
						}}
					>
						{group.label}
					</span>
				)}
				{cfg.description && (
					<span
						style={{
							fontSize: "11px",
							color: "var(--text-color-kumo-subtle)",
							flex: 1,
						}}
					>
						— {cfg.description}
					</span>
				)}
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
					style={{
						background: "none",
						border: "none",
						cursor: "pointer",
						padding: 4,
						color: "var(--color-kumo-danger)",
					}}
				>
					<Trash className="h-3.5 w-3.5" />
				</button>
			</div>
			{/* Group body — drop zone for child fields */}
			<div
				onDragOver={handleInnerDragOver}
				onDragLeave={handleInnerDragLeave}
				onDrop={handleInnerDrop}
				style={{
					display: "grid",
					gridTemplateColumns: `repeat(${cfg.columns}, 1fr)`,
					gap: 8,
					minHeight: 48,
					padding: 8,
					borderRadius: 8,
					border: innerDragOver
						? "2px dashed var(--color-kumo-brand)"
						: "2px dashed var(--color-kumo-line)",
					backgroundColor: innerDragOver ? "var(--color-kumo-info-tint)" : "var(--color-kumo-base)",
					transition: "all 0.15s ease",
				}}
			>
				{children}
			</div>
			{isSelected && (
				<div
					style={{
						position: "absolute",
						top: -2,
						right: -2,
						width: 10,
						height: 10,
						borderRadius: "50%",
						backgroundColor: "var(--color-kumo-brand)",
						border: "2px solid var(--color-kumo-base)",
					}}
				/>
			)}
		</div>
	);
}

// =============================================================================
// Grouped Field Card — a field inside a group, with ungroup button
// =============================================================================

function GroupedFieldCard({
	field,
	isSelected,
	onSelect,
	onRemove,
	onUngroup,
	onLabelChange,
	onDragStart,
	onDragOver,
	onDrop,
}: {
	field: CanvasField;
	isSelected: boolean;
	onSelect: () => void;
	onRemove: () => void;
	onUngroup: () => void;
	onLabelChange: (newLabel: string) => void;
	onDragStart: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
}) {
	return (
		<div
			draggable
			onDragStart={onDragStart}
			onClick={(e) => {
				e.stopPropagation();
				onSelect();
			}}
			onDragOver={onDragOver}
			onDrop={onDrop}
			className="group/inner cursor-grab active:cursor-grabbing transition-all duration-150"
			style={{
				padding: "10px 12px",
				borderRadius: "12px",
				backgroundColor: "var(--color-kumo-base)",
				border: isSelected ? "2px solid var(--color-kumo-brand)" : "2px solid transparent",
				boxShadow: isSelected ? "0 4px 20px rgba(34,113,177,0.1)" : "0 1px 4px rgba(0,0,0,0.04)",
				position: "relative",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: 6,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
					<DotsSixVertical
						className="h-3.5 w-3.5"
						style={{ color: "var(--text-color-kumo-inactive)" }}
					/>
					<span
						style={{
							fontSize: "9px",
							fontWeight: 600,
							textTransform: "uppercase",
							color: "var(--text-color-kumo-inactive)",
						}}
					>
						{field.fieldType}
					</span>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 2 }}>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onUngroup();
						}}
						className="opacity-0 group-hover/inner:opacity-100 transition-opacity"
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							padding: 2,
							color: "var(--text-color-kumo-subtle)",
						}}
						title="Remove from group"
					>
						<X className="h-3 w-3" />
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
						className="opacity-0 group-hover/inner:opacity-100 transition-opacity"
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							padding: 2,
							color: "var(--color-kumo-danger)",
						}}
					>
						<Trash className="h-3 w-3" />
					</button>
				</div>
			</div>
			<FieldRenderer field={field} onLabelChange={onLabelChange} />
		</div>
	);
}

// =============================================================================
// Empty Canvas State
// =============================================================================

function EmptyCanvas({ isDragOver }: { isDragOver: boolean }) {
	return (
		<div className="flex flex-col items-center justify-center min-h-[520px] text-center p-8">
			<div
				className="w-20 h-20 flex items-center justify-center mb-5 transition-colors"
				style={{
					borderRadius: "20px",
					backgroundColor: isDragOver ? "var(--color-kumo-info-tint)" : "var(--color-kumo-tint)",
				}}
			>
				<Plus
					className="h-8 w-8 transition-colors"
					style={{
						color: isDragOver ? "var(--color-kumo-brand)" : "var(--text-color-kumo-inactive)",
					}}
				/>
			</div>
			<p
				className="text-sm font-semibold transition-colors"
				style={{
					color: isDragOver ? "var(--color-kumo-brand)" : "var(--text-color-kumo-subtle)",
				}}
			>
				{isDragOver ? "Drop field here!" : "Drag & drop fields here"}
			</p>
			<p
				className="text-xs mt-2 max-w-xs leading-relaxed"
				style={{ color: "var(--text-color-kumo-inactive)" }}
			>
				Drag fields from the left panel or click a field to add it to your form
			</p>
			<div className="mt-5 flex flex-wrap items-center justify-center gap-2">
				<div
					className="rounded-full px-3 py-1.5 text-[11px] font-medium"
					style={{
						backgroundColor: "var(--color-kumo-tint)",
						color: "var(--text-color-kumo-subtle)",
					}}
				>
					Drag from library
				</div>
				<div
					className="rounded-full px-3 py-1.5 text-[11px] font-medium"
					style={{
						backgroundColor: "var(--color-kumo-tint)",
						color: "var(--text-color-kumo-subtle)",
					}}
				>
					Click to add instantly
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// Submit / Next Button Preview (shown below fields in canvas)
// =============================================================================

const BTN_SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
	sm: { fontSize: "12px", padding: "6px 16px" },
	md: { fontSize: "14px", padding: "10px 24px" },
	lg: { fontSize: "16px", padding: "12px 32px" },
};

const BTN_ALIGN_MAP: Record<ButtonAlign, string> = {
	left: "flex-start",
	center: "center",
	right: "flex-end",
	full: "stretch",
};

function buildButtonStyle(cfg: {
	variant: ButtonVariant;
	backgroundColor: string;
	textColor: string;
	borderRadius: string;
	borderColor: string;
	fontSize: string;
	fontWeight: string;
	paddingX: string;
	paddingY: string;
	size: ButtonSize;
}): React.CSSProperties {
	const sizeStyle = BTN_SIZE_STYLES[cfg.size];
	const base: React.CSSProperties = {
		borderRadius: cfg.borderRadius || "8px",
		fontSize: cfg.fontSize || sizeStyle.fontSize,
		fontWeight: cfg.fontWeight || "600",
		padding: cfg.paddingY && cfg.paddingX ? `${cfg.paddingY} ${cfg.paddingX}` : sizeStyle.padding,
		cursor: "pointer",
		transition: "all 0.15s ease",
		display: "inline-flex",
		alignItems: "center",
		gap: "6px",
	};

	if (cfg.variant === "filled") {
		return {
			...base,
			backgroundColor: cfg.backgroundColor || "var(--color-kumo-brand)",
			color: cfg.textColor || "#fff",
			border: "none",
		};
	}
	if (cfg.variant === "outline") {
		return {
			...base,
			backgroundColor: "transparent",
			color: cfg.textColor || "var(--color-kumo-brand)",
			border: `2px solid ${cfg.borderColor || cfg.backgroundColor || "var(--color-kumo-brand)"}`,
		};
	}
	// ghost
	return {
		...base,
		backgroundColor: "transparent",
		color: cfg.textColor || "var(--color-kumo-brand)",
		border: "none",
	};
}

function SubmitButtonPreview({
	submitButton,
	nextButton,
	hasSteps,
	onClickSettings,
	settingsTarget,
}: {
	submitButton: SubmitButtonConfig;
	nextButton: NextButtonConfig;
	hasSteps: boolean;
	onClickSettings: (target: "submit" | "next") => void;
	settingsTarget: "submit" | "next" | null;
}) {
	const submitStyle = buildButtonStyle(submitButton);
	const nextStyle = hasSteps ? buildButtonStyle(nextButton) : undefined;
	const align = hasSteps ? nextButton.align : submitButton.align;

	return (
		<div
			style={{
				marginTop: 16,
				padding: "16px",
				borderRadius: "12px",
				border: "1px dashed var(--color-kumo-line)",
				backgroundColor: "var(--color-kumo-tint)",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: 12,
				}}
			>
				<span
					style={{
						fontSize: "10px",
						fontWeight: 700,
						textTransform: "uppercase",
						letterSpacing: "0.06em",
						color: "var(--text-color-kumo-inactive)",
					}}
				>
					Form Buttons
				</span>
			</div>

			<div
				style={{
					display: "flex",
					justifyContent: BTN_ALIGN_MAP[align],
					gap: 10,
					flexWrap: "wrap",
				}}
			>
				{/* Reset button (only with submit, if enabled) */}
				{submitButton.showReset && !hasSteps && (
					<button
						type="button"
						style={{
							...buildButtonStyle({ ...submitButton, variant: "outline" }),
							...(align === "full" ? { flex: 1 } : {}),
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{submitButton.resetLabel || "Reset"}
					</button>
				)}

				{/* Step mode: Previous + Next */}
				{hasSteps && nextButton.showPrev && (
					<button
						type="button"
						style={{
							...buildButtonStyle({ ...nextButton, variant: "outline" }),
							...(align === "full" ? { flex: 1 } : {}),
							opacity: settingsTarget === "next" ? 1 : 0.85,
						}}
						onClick={(e) => {
							e.stopPropagation();
							onClickSettings("next");
						}}
						title="Click to configure navigation buttons"
					>
						{nextButton.prevLabel || "Previous"}
					</button>
				)}

				{hasSteps && (
					<button
						type="button"
						style={{
							...nextStyle,
							...(align === "full" ? { flex: 1 } : {}),
							boxShadow:
								settingsTarget === "next" ? "0 0 0 2px var(--color-kumo-brand)" : undefined,
						}}
						onClick={(e) => {
							e.stopPropagation();
							onClickSettings("next");
						}}
						title="Click to configure navigation buttons"
					>
						{nextButton.label || "Next"}
						<ArrowRight className="h-3.5 w-3.5" />
					</button>
				)}

				{/* Submit button */}
				<button
					type="button"
					style={{
						...submitStyle,
						...(align === "full" ? { flex: 1 } : {}),
						boxShadow:
							settingsTarget === "submit" ? "0 0 0 2px var(--color-kumo-brand)" : undefined,
					}}
					onClick={(e) => {
						e.stopPropagation();
						onClickSettings("submit");
					}}
					title="Click to configure submit button"
				>
					{submitButton.label || "Submit"}
				</button>
			</div>
		</div>
	);
}

// =============================================================================
// Button Settings Panel (right sidebar)
// =============================================================================

const btnPanelLabel: React.CSSProperties = {
	display: "block",
	fontSize: "11px",
	fontWeight: 600,
	color: "var(--text-color-kumo-subtle)",
	marginBottom: "3px",
	textTransform: "uppercase",
	letterSpacing: "0.04em",
};

const btnPanelInput: React.CSSProperties = {
	width: "100%",
	padding: "7px 10px",
	fontSize: "12px",
	border: "1px solid var(--color-kumo-line)",
	borderRadius: "6px",
	backgroundColor: "var(--color-kumo-control)",
	color: "var(--text-color-kumo-default)",
	outline: "none",
};

const btnPanelSection: React.CSSProperties = {
	marginBottom: "16px",
};

const btnPanelCheckLabel: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: "6px",
	fontSize: "12px",
	color: "var(--text-color-kumo-default)",
	cursor: "pointer",
};

function ButtonSettingsPanel({
	target,
	submitButton,
	nextButton,
	hasSteps,
	onUpdateSubmit,
	onUpdateNext,
	onClose,
	onSwitchTarget,
}: {
	target: "submit" | "next";
	submitButton: SubmitButtonConfig;
	nextButton: NextButtonConfig;
	hasSteps: boolean;
	onUpdateSubmit: (u: Partial<SubmitButtonConfig>) => void;
	onUpdateNext: (u: Partial<NextButtonConfig>) => void;
	onClose: () => void;
	onSwitchTarget: (t: "submit" | "next") => void;
}) {
	const isSubmit = target === "submit";
	const cfg = isSubmit ? submitButton : nextButton;
	const update = (u: Partial<SubmitButtonConfig> | Partial<NextButtonConfig>) => {
		if (isSubmit) onUpdateSubmit(u as Partial<SubmitButtonConfig>);
		else onUpdateNext(u as Partial<NextButtonConfig>);
	};

	return (
		<div className="h-full flex flex-col">
			{/* Header */}
			<div
				className="flex items-center justify-between px-4 py-3 flex-shrink-0"
				style={{ borderBottom: "1px solid var(--color-kumo-line)" }}
			>
				<div className="flex items-center gap-2">
					<GearSix className="h-4 w-4" style={{ color: "var(--color-kumo-brand)" }} />
					<span className="text-sm font-bold" style={{ color: "var(--text-color-kumo-default)" }}>
						{isSubmit ? "Submit Button" : "Navigation Buttons"}
					</span>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="p-1.5 rounded-lg transition-colors"
					style={{ color: "var(--text-color-kumo-subtle)" }}
				>
					<span style={{ fontSize: 16, lineHeight: 1 }}>✕</span>
				</button>
			</div>

			{/* Tab toggle (if steps exist) */}
			{hasSteps && (
				<div
					className="flex gap-1 p-2"
					style={{ borderBottom: "1px solid var(--color-kumo-line)" }}
				>
					<button
						type="button"
						onClick={() => onSwitchTarget("submit")}
						className="flex-1 px-3 py-1.5 text-[11px] font-semibold transition-all"
						style={{
							borderRadius: "6px",
							backgroundColor: isSubmit ? "var(--color-kumo-brand)" : "transparent",
							color: isSubmit ? "#fff" : "var(--text-color-kumo-subtle)",
						}}
					>
						Submit
					</button>
					<button
						type="button"
						onClick={() => onSwitchTarget("next")}
						className="flex-1 px-3 py-1.5 text-[11px] font-semibold transition-all"
						style={{
							borderRadius: "6px",
							backgroundColor: !isSubmit ? "var(--color-kumo-brand)" : "transparent",
							color: !isSubmit ? "#fff" : "var(--text-color-kumo-subtle)",
						}}
					>
						Next / Prev
					</button>
				</div>
			)}

			{/* Scrollable body */}
			<div className="flex-1 overflow-y-auto p-4 space-y-1">
				{/* Label */}
				<div style={btnPanelSection}>
					<label style={btnPanelLabel}>Button Label</label>
					<input
						type="text"
						value={cfg.label}
						onChange={(e) => update({ label: e.target.value })}
						style={btnPanelInput}
					/>
				</div>

				{/* Size */}
				<div style={btnPanelSection}>
					<label style={btnPanelLabel}>Size</label>
					<div className="flex gap-1">
						{(["sm", "md", "lg"] as ButtonSize[]).map((s) => (
							<button
								key={s}
								type="button"
								onClick={() => update({ size: s })}
								className="flex-1 px-2 py-1.5 text-[11px] font-semibold transition-all"
								style={{
									borderRadius: "6px",
									border:
										cfg.size === s
											? "2px solid var(--color-kumo-brand)"
											: "1px solid var(--color-kumo-line)",
									backgroundColor: cfg.size === s ? "var(--color-kumo-info-tint)" : "transparent",
									color:
										cfg.size === s ? "var(--color-kumo-brand)" : "var(--text-color-kumo-subtle)",
								}}
							>
								{s.toUpperCase()}
							</button>
						))}
					</div>
				</div>

				{/* Alignment */}
				<div style={btnPanelSection}>
					<label style={btnPanelLabel}>Alignment</label>
					<div className="flex gap-1">
						{(["left", "center", "right", "full"] as ButtonAlign[]).map((a) => (
							<button
								key={a}
								type="button"
								onClick={() => update({ align: a })}
								className="flex-1 px-2 py-1.5 text-[11px] font-semibold capitalize transition-all"
								style={{
									borderRadius: "6px",
									border:
										cfg.align === a
											? "2px solid var(--color-kumo-brand)"
											: "1px solid var(--color-kumo-line)",
									backgroundColor: cfg.align === a ? "var(--color-kumo-info-tint)" : "transparent",
									color:
										cfg.align === a ? "var(--color-kumo-brand)" : "var(--text-color-kumo-subtle)",
								}}
							>
								{a}
							</button>
						))}
					</div>
				</div>

				{/* Variant */}
				<div style={btnPanelSection}>
					<label style={btnPanelLabel}>Style</label>
					<div className="flex gap-1">
						{(["filled", "outline", "ghost"] as ButtonVariant[]).map((v) => (
							<button
								key={v}
								type="button"
								onClick={() => update({ variant: v })}
								className="flex-1 px-2 py-1.5 text-[11px] font-semibold capitalize transition-all"
								style={{
									borderRadius: "6px",
									border:
										cfg.variant === v
											? "2px solid var(--color-kumo-brand)"
											: "1px solid var(--color-kumo-line)",
									backgroundColor:
										cfg.variant === v ? "var(--color-kumo-info-tint)" : "transparent",
									color:
										cfg.variant === v ? "var(--color-kumo-brand)" : "var(--text-color-kumo-subtle)",
								}}
							>
								{v}
							</button>
						))}
					</div>
				</div>

				{/* Colors */}
				<div style={btnPanelSection}>
					<label style={btnPanelLabel}>Background Color</label>
					<div className="flex gap-2 items-center">
						<input
							type="color"
							value={cfg.backgroundColor || "#2271b1"}
							onChange={(e) => update({ backgroundColor: e.target.value })}
							style={{ width: 32, height: 32, border: "none", cursor: "pointer", borderRadius: 4 }}
						/>
						<input
							type="text"
							value={cfg.backgroundColor}
							onChange={(e) => update({ backgroundColor: e.target.value })}
							placeholder="var(--color-kumo-brand)"
							style={{ ...btnPanelInput, flex: 1 }}
						/>
					</div>
				</div>

				<div style={btnPanelSection}>
					<label style={btnPanelLabel}>Text Color</label>
					<div className="flex gap-2 items-center">
						<input
							type="color"
							value={cfg.textColor || "#ffffff"}
							onChange={(e) => update({ textColor: e.target.value })}
							style={{ width: 32, height: 32, border: "none", cursor: "pointer", borderRadius: 4 }}
						/>
						<input
							type="text"
							value={cfg.textColor}
							onChange={(e) => update({ textColor: e.target.value })}
							placeholder="#ffffff"
							style={{ ...btnPanelInput, flex: 1 }}
						/>
					</div>
				</div>

				{cfg.variant === "outline" && (
					<div style={btnPanelSection}>
						<label style={btnPanelLabel}>Border Color</label>
						<div className="flex gap-2 items-center">
							<input
								type="color"
								value={cfg.borderColor || "#2271b1"}
								onChange={(e) => update({ borderColor: e.target.value })}
								style={{
									width: 32,
									height: 32,
									border: "none",
									cursor: "pointer",
									borderRadius: 4,
								}}
							/>
							<input
								type="text"
								value={cfg.borderColor}
								onChange={(e) => update({ borderColor: e.target.value })}
								placeholder="var(--color-kumo-brand)"
								style={{ ...btnPanelInput, flex: 1 }}
							/>
						</div>
					</div>
				)}

				{/* Border radius */}
				<div style={btnPanelSection}>
					<label style={btnPanelLabel}>Border Radius</label>
					<input
						type="text"
						value={cfg.borderRadius}
						onChange={(e) => update({ borderRadius: e.target.value })}
						placeholder="8px"
						style={btnPanelInput}
					/>
				</div>

				{/* Font */}
				<div style={{ ...btnPanelSection, display: "flex", gap: 8 }}>
					<div style={{ flex: 1 }}>
						<label style={btnPanelLabel}>Font Size</label>
						<input
							type="text"
							value={cfg.fontSize}
							onChange={(e) => update({ fontSize: e.target.value })}
							placeholder="14px"
							style={btnPanelInput}
						/>
					</div>
					<div style={{ flex: 1 }}>
						<label style={btnPanelLabel}>Font Weight</label>
						<input
							type="text"
							value={cfg.fontWeight}
							onChange={(e) => update({ fontWeight: e.target.value })}
							placeholder="600"
							style={btnPanelInput}
						/>
					</div>
				</div>

				{/* Padding */}
				<div style={{ ...btnPanelSection, display: "flex", gap: 8 }}>
					<div style={{ flex: 1 }}>
						<label style={btnPanelLabel}>Padding X</label>
						<input
							type="text"
							value={cfg.paddingX}
							onChange={(e) => update({ paddingX: e.target.value })}
							placeholder="24px"
							style={btnPanelInput}
						/>
					</div>
					<div style={{ flex: 1 }}>
						<label style={btnPanelLabel}>Padding Y</label>
						<input
							type="text"
							value={cfg.paddingY}
							onChange={(e) => update({ paddingY: e.target.value })}
							placeholder="10px"
							style={btnPanelInput}
						/>
					</div>
				</div>

				{/* Custom CSS class */}
				<div style={btnPanelSection}>
					<label style={btnPanelLabel}>Custom CSS Class</label>
					<input
						type="text"
						value={cfg.customClass}
						onChange={(e) => update({ customClass: e.target.value })}
						placeholder="e.g. btn-primary"
						style={btnPanelInput}
					/>
				</div>

				{/* --- Submit-specific settings --- */}
				{isSubmit && (
					<>
						<div
							style={{
								borderTop: "1px solid var(--color-kumo-line)",
								margin: "12px 0",
								paddingTop: 12,
							}}
						>
							<span
								style={{
									fontSize: "10px",
									fontWeight: 700,
									textTransform: "uppercase",
									letterSpacing: "0.06em",
									color: "var(--text-color-kumo-inactive)",
								}}
							>
								Behavior
							</span>
						</div>

						<div style={btnPanelSection}>
							<label style={btnPanelLabel}>Loading Text</label>
							<input
								type="text"
								value={submitButton.loadingText}
								onChange={(e) => onUpdateSubmit({ loadingText: e.target.value })}
								placeholder="Submitting..."
								style={btnPanelInput}
							/>
						</div>

						<div style={btnPanelSection}>
							<label style={btnPanelLabel}>Success Text</label>
							<input
								type="text"
								value={submitButton.successText}
								onChange={(e) => onUpdateSubmit({ successText: e.target.value })}
								placeholder="Submitted!"
								style={btnPanelInput}
							/>
						</div>

						<div style={btnPanelSection}>
							<label style={btnPanelCheckLabel}>
								<input
									type="checkbox"
									checked={submitButton.disableAfterSubmit}
									onChange={(e) => onUpdateSubmit({ disableAfterSubmit: e.target.checked })}
								/>
								Disable after submit
							</label>
						</div>

						<div
							style={{
								borderTop: "1px solid var(--color-kumo-line)",
								margin: "12px 0",
								paddingTop: 12,
							}}
						>
							<span
								style={{
									fontSize: "10px",
									fontWeight: 700,
									textTransform: "uppercase",
									letterSpacing: "0.06em",
									color: "var(--text-color-kumo-inactive)",
								}}
							>
								Reset Button
							</span>
						</div>

						<div style={btnPanelSection}>
							<label style={btnPanelCheckLabel}>
								<input
									type="checkbox"
									checked={submitButton.showReset}
									onChange={(e) => onUpdateSubmit({ showReset: e.target.checked })}
								/>
								Show reset button
							</label>
						</div>

						{submitButton.showReset && (
							<div style={btnPanelSection}>
								<label style={btnPanelLabel}>Reset Label</label>
								<input
									type="text"
									value={submitButton.resetLabel}
									onChange={(e) => onUpdateSubmit({ resetLabel: e.target.value })}
									placeholder="Reset"
									style={btnPanelInput}
								/>
							</div>
						)}
					</>
				)}

				{/* --- Next-specific settings --- */}
				{!isSubmit && (
					<>
						<div
							style={{
								borderTop: "1px solid var(--color-kumo-line)",
								margin: "12px 0",
								paddingTop: 12,
							}}
						>
							<span
								style={{
									fontSize: "10px",
									fontWeight: 700,
									textTransform: "uppercase",
									letterSpacing: "0.06em",
									color: "var(--text-color-kumo-inactive)",
								}}
							>
								Navigation
							</span>
						</div>

						<div style={btnPanelSection}>
							<label style={btnPanelCheckLabel}>
								<input
									type="checkbox"
									checked={nextButton.showPrev}
									onChange={(e) => onUpdateNext({ showPrev: e.target.checked })}
								/>
								Show Previous button
							</label>
						</div>

						{nextButton.showPrev && (
							<div style={btnPanelSection}>
								<label style={btnPanelLabel}>Previous Label</label>
								<input
									type="text"
									value={nextButton.prevLabel}
									onChange={(e) => onUpdateNext({ prevLabel: e.target.value })}
									placeholder="Previous"
									style={btnPanelInput}
								/>
							</div>
						)}
					</>
				)}

				{/* Reset to defaults */}
				<div style={{ paddingTop: 8 }}>
					<button
						type="button"
						onClick={() => {
							if (isSubmit) onUpdateSubmit(DEFAULT_SUBMIT_BUTTON);
							else onUpdateNext(DEFAULT_NEXT_BUTTON);
						}}
						className="flex items-center gap-1.5 text-[11px] font-medium transition-colors"
						style={{
							color: "var(--text-color-kumo-inactive)",
							background: "none",
							border: "none",
							cursor: "pointer",
						}}
					>
						<ArrowsClockwise className="h-3.5 w-3.5" />
						Reset to defaults
					</button>
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// Canvas Fields — renders organized step/group sections
// =============================================================================

function CanvasFields({
	sections,
	totalSteps,
	selectedFieldId,
	actions,
	setButtonSettingsTarget,
	handleReorderDragStart,
	handleReorderDragOver,
	handleReorderDrop,
	handleGroupDrop,
	handleUngroup,
}: {
	sections: CanvasSection[];
	totalSteps: number;
	selectedFieldId: string | null;
	actions: FormBuilderActions;
	setButtonSettingsTarget: (t: "submit" | "next" | null) => void;
	handleReorderDragStart: (e: React.DragEvent, idx: number) => void;
	handleReorderDragOver: (e: React.DragEvent) => void;
	handleReorderDrop: (e: React.DragEvent, toIdx: number) => void;
	handleGroupDrop: (e: React.DragEvent, groupId: string) => void;
	handleUngroup: (fieldId: string) => void;
}) {
	let stepCounter = 0;

	function renderItem(item: CanvasItem) {
		if (item.kind === "group") {
			return (
				<div key={item.group.instanceId} style={{ width: "100%", minWidth: 0 }}>
					<GroupContainerCard
						group={item.group}
						isSelected={selectedFieldId === item.group.instanceId}
						onSelect={() => {
							actions.selectField(item.group.instanceId);
							setButtonSettingsTarget(null);
						}}
						onRemove={() => actions.removeField(item.group.instanceId)}
						onDragStart={(e) => handleReorderDragStart(e, item.flatIndex)}
						onDragOver={handleReorderDragOver}
						onDrop={(e) => handleReorderDrop(e, item.flatIndex)}
						onDropInside={(e) => handleGroupDrop(e, item.group.instanceId)}
					>
						{item.children.length === 0 ? (
							<p
								style={{
									fontSize: "11px",
									color: "var(--text-color-kumo-inactive)",
									textAlign: "center",
									margin: 0,
									gridColumn: "1 / -1",
									alignSelf: "center",
									padding: "8px 0",
								}}
							>
								Drag fields here to group them
							</p>
						) : (
							item.children.map((child) => (
								<GroupedFieldCard
									key={child.field.instanceId}
									field={child.field}
									isSelected={selectedFieldId === child.field.instanceId}
									onSelect={() => {
										actions.selectField(child.field.instanceId);
										setButtonSettingsTarget(null);
									}}
									onRemove={() => actions.removeField(child.field.instanceId)}
									onUngroup={() => handleUngroup(child.field.instanceId)}
									onLabelChange={(newLabel) =>
										actions.updateField(child.field.instanceId, {
											label: newLabel,
										})
									}
									onDragStart={(e) => handleReorderDragStart(e, child.flatIndex)}
									onDragOver={handleReorderDragOver}
									onDrop={(e) => handleReorderDrop(e, child.flatIndex)}
								/>
							))
						)}
					</GroupContainerCard>
				</div>
			);
		}

		return (
			<div
				key={item.field.instanceId}
				style={{
					width: WIDTH_MAP[item.field.width] || "100%",
					minWidth: 0,
					transition: "width 0.2s ease",
				}}
			>
				<CanvasFieldCard
					field={item.field}
					isSelected={selectedFieldId === item.field.instanceId}
					onSelect={() => {
						actions.selectField(item.field.instanceId);
						setButtonSettingsTarget(null);
					}}
					onRemove={() => actions.removeField(item.field.instanceId)}
					onLabelChange={(newLabel) =>
						actions.updateField(item.field.instanceId, {
							label: newLabel,
						})
					}
					onDragStart={(e) => handleReorderDragStart(e, item.flatIndex)}
					onDragOver={handleReorderDragOver}
					onDrop={(e) => handleReorderDrop(e, item.flatIndex)}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{sections.map((section, sectionIdx) => {
				if (section.step) {
					stepCounter++;
					const currentStepNum = stepCounter;
					return (
						<StepSectionCard
							key={section.step.instanceId}
							step={section.step}
							stepNumber={currentStepNum}
							totalSteps={totalSteps}
							isSelected={selectedFieldId === section.step.instanceId}
							onSelect={() => {
								actions.selectField(section.step!.instanceId);
								setButtonSettingsTarget(null);
							}}
							onRemove={() => actions.removeField(section.step!.instanceId)}
							onDragStart={(e) => handleReorderDragStart(e, section.stepFlatIndex)}
							onDragOver={handleReorderDragOver}
							onDrop={(e) => handleReorderDrop(e, section.stepFlatIndex)}
						>
							{section.items.length === 0 ? (
								<p
									style={{
										fontSize: "12px",
										color: "var(--text-color-kumo-inactive)",
										textAlign: "center",
										padding: "12px 0",
									}}
								>
									Add fields below this step
								</p>
							) : (
								<div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
									{section.items.map(renderItem)}
								</div>
							)}
						</StepSectionCard>
					);
				}

				// Section without step header (fields before any step, or no steps at all)
				return (
					<div key={`section-${sectionIdx}`} style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
						{section.items.map(renderItem)}
					</div>
				);
			})}
		</div>
	);
}

// =============================================================================
// Main FormBuilder Component
// =============================================================================

export function FormBuilder({
	templateId,
	editFormId,
	onBack,
	onSave,
}: {
	templateId: string;
	editFormId?: string;
	onBack: () => void;
	onSave?: FormBuilderOnSave;
}) {
	const builder = useFormBuilder(templateId);
	const {
		fields,
		selectedFieldId,
		selectedField,
		previewMode,
		submitButton,
		nextButton,
		afterSubmit,
		hasSteps,
		actions,
	} = builder;
	const [paletteCategory, setPaletteCategory] = React.useState<PaletteCategory>("all");
	const [paletteSearch, setPaletteSearch] = React.useState("");
	const [isDragOver, setIsDragOver] = React.useState(false);
	const [_dragReorderIdx, setDragReorderIdx] = React.useState<number | null>(null);
	const [buttonSettingsTarget, setButtonSettingsTarget] = React.useState<"submit" | "next" | null>(
		null,
	);
	const [showAfterSubmitPanel, setShowAfterSubmitPanel] = React.useState(false);
	const [saveState, setSaveState] = React.useState<"idle" | "saving" | "success" | "error">("idle");
	const [saveError, setSaveError] = React.useState<string | null>(null);
	const [showSuccessPopup, setShowSuccessPopup] = React.useState(false);
	const [loadError, setLoadError] = React.useState<string | null>(null);

	// Close after-submit panel when a field is selected, and vice versa
	React.useEffect(() => {
		if (selectedFieldId) setShowAfterSubmitPanel(false);
	}, [selectedFieldId]);
	React.useEffect(() => {
		if (showAfterSubmitPanel) setButtonSettingsTarget(null);
	}, [showAfterSubmitPanel]);

	// ---- Load existing form for editing ----
	React.useEffect(() => {
		if (!editFormId) return;
		let cancelled = false;
		async function load() {
			try {
				const res = await apiFetch("forms.get", { formId: editFormId });
				if (!res.ok) {
					if (!cancelled) setLoadError("Failed to load form");
					return;
				}
				const body = await res.json();
				const formData = body?.data?.form;
				if (cancelled) return;
				// formData is { name, status, definition, ... }
				const definition = formData?.definition;
				if (!definition) {
					setLoadError("Form data not found");
					return;
				}
				const loaded = loadFormDefinition(definition);
				actions.loadForm(loaded);
			} catch {
				if (!cancelled) setLoadError("Failed to load form");
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [editFormId]); // eslint-disable-line react-hooks/exhaustive-deps

	// ---- Save handler ----
	const handleSave = React.useCallback(async () => {
		if (!onSave || saveState === "saving") return;
		setSaveState("saving");
		setSaveError(null);
		try {
			const result = await onSave({
				formId: builder.formId,
				name: builder.formName,
				description: builder.formDescription,
				fields: builder.fields,
				submitButton: builder.submitButton,
				afterSubmit: builder.afterSubmit,
			});
			const savedFormId = result.formId;
			if (savedFormId && !builder.formId) {
				builder.setFormId(savedFormId);
			}
			// Auto-publish after save so forms are immediately embeddable
			if (savedFormId) {
				await apiFetch("forms.publish", { formId: savedFormId }).catch(() => {
					// Non-fatal — form is saved even if publish fails
				});
			}
			builder.actions.markClean();
			setSaveState("success");
			setShowSuccessPopup(true);
		} catch (err) {
			setSaveState("error");
			setSaveError(err instanceof Error ? err.message : "Failed to save");
		}
	}, [onSave, saveState, builder]);

	// ---- Filtered palette fields ----
	const filteredPalette = React.useMemo(() => {
		return FIELD_TYPE_REGISTRY.filter((m) => {
			const byCat = paletteCategory === "all" || m.category === paletteCategory;
			const q = paletteSearch.trim().toLowerCase();
			const bySearch =
				!q ||
				m.label.toLowerCase().includes(q) ||
				m.aliases.some((a) => a.toLowerCase().includes(q));
			return byCat && bySearch;
		});
	}, [paletteCategory, paletteSearch]);

	// ---- Canvas DnD: drop new field from palette ----
	const handleCanvasDragOver = React.useCallback(
		(e: React.DragEvent) => {
			if (e.dataTransfer.types.includes("application/x-form-field")) {
				e.preventDefault();
				e.dataTransfer.dropEffect = "copy";
				if (!isDragOver) setIsDragOver(true);
			}
		},
		[isDragOver],
	);

	const handleCanvasDragLeave = React.useCallback((e: React.DragEvent) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX;
		const y = e.clientY;
		if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
			setIsDragOver(false);
		}
	}, []);

	const handleCanvasDrop = React.useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragOver(false);
			const fieldType = e.dataTransfer.getData("application/x-form-field");
			if (!fieldType) return;
			actions.addField(fieldType);
		},
		[actions],
	);

	// ---- Canvas DnD: reorder existing fields ----
	const handleReorderDragStart = React.useCallback((e: React.DragEvent, idx: number) => {
		e.dataTransfer.setData("application/x-reorder", String(idx));
		e.dataTransfer.effectAllowed = "move";
		setDragReorderIdx(idx);
	}, []);

	const handleReorderDragOver = React.useCallback((e: React.DragEvent) => {
		if (e.dataTransfer.types.includes("application/x-reorder")) {
			e.preventDefault();
			e.dataTransfer.dropEffect = "move";
		}
	}, []);

	const handleReorderDrop = React.useCallback(
		(e: React.DragEvent, toIdx: number) => {
			e.preventDefault();
			const fromStr = e.dataTransfer.getData("application/x-reorder");
			if (fromStr === "") return;
			const fromIdx = parseInt(fromStr, 10);
			if (fromIdx !== toIdx) {
				actions.moveField(fromIdx, toIdx);
			}
			setDragReorderIdx(null);
		},
		[actions],
	);

	// ---- Drop into group: palette field or reorder into group ----
	const handleGroupDrop = React.useCallback(
		(e: React.DragEvent, groupId: string) => {
			// New field from palette
			const fieldType = e.dataTransfer.getData("application/x-form-field");
			if (fieldType) {
				// Don't allow nesting steps or groups inside a group
				if (fieldType === "step" || fieldType === "group") return;
				actions.addFieldToGroup(fieldType, groupId);
				return;
			}
			// Reorder existing field into group
			const fromStr = e.dataTransfer.getData("application/x-reorder");
			if (fromStr !== "") {
				const fromIdx = parseInt(fromStr, 10);
				const field = builder.fields[fromIdx];
				if (field && field.fieldType !== "step" && field.fieldType !== "group") {
					actions.updateField(field.instanceId, { groupId });
				}
				setDragReorderIdx(null);
			}
		},
		[actions, builder.fields],
	);

	// ---- Remove field from group ----
	const handleUngroup = React.useCallback(
		(fieldId: string) => {
			actions.updateField(fieldId, { groupId: undefined });
		},
		[actions],
	);

	// ---- Organized canvas sections ----
	const canvasSections = React.useMemo(() => organizeCanvas(fields), [fields]);
	const totalSteps = React.useMemo(
		() => canvasSections.filter((s) => s.step !== null).length,
		[canvasSections],
	);

	// ---- Import/Export handlers ----
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const handleExport = React.useCallback(() => {
		const json = actions.exportJson();
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `form-${builder.formName || "untitled"}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}, [actions, builder.formName]);

	const handleImport = React.useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === "string") {
					actions.importJson(reader.result);
				}
			};
			reader.readAsText(file);
			// Reset input so re-selecting the same file works
			e.target.value = "";
		},
		[actions],
	);

	// ---- Preview mode width class ----
	const canvasMaxWidth =
		previewMode === "mobile" ? "max-w-sm" : previewMode === "tablet" ? "max-w-xl" : "max-w-2xl";

	return (
		<div
			className="min-h-screen flex flex-col"
			style={{ backgroundColor: "var(--color-kumo-elevated)" }}
		>
			{/* ===== Top Toolbar ===== */}
			<div
				className="px-5 py-3 flex items-center justify-between flex-shrink-0 shadow-sm"
				style={{
					backgroundColor: "var(--color-kumo-base)",
					borderBottom: "1px solid var(--color-kumo-line)",
				}}
			>
				{/* Left cluster */}
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={onBack}
						className="p-2.5 rounded-xl transition-colors"
						style={{
							color: "var(--text-color-kumo-subtle)",
						}}
						title="Back to templates"
					>
						<ArrowLeft className="h-5 w-5" />
					</button>
					<div
						className="h-6 w-px"
						style={{
							backgroundColor: "var(--color-kumo-line)",
						}}
					/>
					<input
						type="text"
						value={builder.formName}
						onChange={(e) => actions.setFormName(e.target.value)}
						className="text-sm font-bold border-none bg-transparent outline-none"
						style={{
							color: "var(--text-color-kumo-default)",
							width: Math.max(120, builder.formName.length * 8),
						}}
						placeholder="Form Name"
					/>
					{builder.isDirty && (
						<span
							className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide"
							style={{
								backgroundColor: "var(--color-kumo-warning-tint)",
								color: "var(--text-color-kumo-warning)",
							}}
						>
							Unsaved
						</span>
					)}
				</div>

				{/* Right cluster */}
				<div className="flex items-center gap-2">
					{/* Undo / Redo */}
					<button
						type="button"
						onClick={actions.undo}
						disabled={!actions.canUndo}
						className="p-2 rounded-lg transition-colors"
						style={{
							color: "var(--text-color-kumo-subtle)",
							opacity: actions.canUndo ? 1 : 0.35,
						}}
						title="Undo (Ctrl+Z)"
					>
						<ArrowCounterClockwise className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={actions.redo}
						disabled={!actions.canRedo}
						className="p-2 rounded-lg transition-colors"
						style={{
							color: "var(--text-color-kumo-subtle)",
							opacity: actions.canRedo ? 1 : 0.35,
						}}
						title="Redo (Ctrl+Y)"
					>
						<ArrowClockwise className="h-4 w-4" />
					</button>

					<div
						className="h-5 w-px mx-1"
						style={{
							backgroundColor: "var(--color-kumo-line)",
						}}
					/>

					{/* Import / Export */}
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="p-2 rounded-lg transition-colors"
						style={{
							color: "var(--text-color-kumo-subtle)",
						}}
						title="Import JSON"
					>
						<Upload className="h-4 w-4" />
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept=".json"
						onChange={handleImport}
						style={{ display: "none" }}
					/>
					<button
						type="button"
						onClick={handleExport}
						className="p-2 rounded-lg transition-colors"
						style={{
							color: "var(--text-color-kumo-subtle)",
						}}
						title="Export JSON"
					>
						<Download className="h-4 w-4" />
					</button>

					{/* Preview mode toggle — hidden for now
					<div
						className="h-5 w-px mx-1"
						style={{
							backgroundColor: "var(--color-kumo-line)",
						}}
					/>
					<div
						className="inline-flex overflow-hidden"
						style={{
							border: "1px solid var(--color-kumo-line)",
							borderRadius: "100px",
						}}
					>
						{(
							[
								["desktop", Monitor],
								["tablet", DeviceTablet],
								["mobile", DeviceMobile],
							] as [PreviewMode, typeof Monitor][]
						).map(([mode, Icon]) => (
							<button
								key={mode}
								type="button"
								onClick={() => actions.setPreviewMode(mode)}
								className="px-3.5 py-2 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
								style={{
									backgroundColor:
										previewMode === mode ? "var(--color-kumo-info-tint)" : "transparent",
									color:
										previewMode === mode
											? "var(--color-kumo-brand)"
											: "var(--text-color-kumo-subtle)",
								}}
							>
								<Icon className="h-4 w-4" />
							</button>
						))}
					</div>
					*/}

					{/* After Submission Settings */}
					<button
						type="button"
						onClick={() => {
							actions.selectField(null);
							setButtonSettingsTarget(null);
							setShowAfterSubmitPanel((p) => !p);
						}}
						className="p-2 rounded-lg transition-colors"
						style={{
							color: showAfterSubmitPanel
								? "var(--color-kumo-brand)"
								: "var(--text-color-kumo-subtle)",
							backgroundColor: showAfterSubmitPanel ? "var(--color-kumo-info-tint)" : "transparent",
						}}
						title="After Submission Settings"
					>
						<GearSix className="h-4 w-4" />
					</button>

					{/* Save */}
					<button
						type="button"
						onClick={handleSave}
						disabled={saveState === "saving"}
						className="mx-2 px-10 py-2 text-xs font-bold transition-all hover:opacity-90 inline-flex items-center gap-2"
						style={{
							backgroundColor: "var(--color-kumo-brand)",
							color: "var(--color-kumo-base)",
							borderRadius: "100px",
							boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
							opacity: saveState === "saving" ? 0.7 : 1,
						}}
					>
						<FloppyDisk className="h-4 w-4" />
						{saveState === "saving" ? "Saving..." : "Save"}
					</button>
				</div>
			</div>

			{/* ===== Main Body ===== */}
			{loadError && (
				<div
					className="px-5 py-3 text-sm font-medium flex items-center gap-2"
					style={{
						backgroundColor: "var(--color-kumo-danger-tint, rgba(239,68,68,0.08))",
						color: "var(--color-kumo-danger)",
					}}
				>
					{loadError}
				</div>
			)}
			<div className="flex flex-1 overflow-hidden">
				{/* ----- Left Palette ----- */}
				<div
					className="w-72 flex flex-col flex-shrink-0"
					style={{
						backgroundColor: "var(--color-kumo-base)",
						borderRight: "1px solid var(--color-kumo-line)",
					}}
				>
					{/* Category tabs */}
					<div
						className="flex gap-0.5 p-2.5 flex-wrap"
						style={{
							backgroundColor: "var(--color-kumo-tint)",
							borderBottom: "1px solid var(--color-kumo-line)",
						}}
					>
						{PALETTE_CATEGORIES.map((cat) => (
							<button
								key={cat.id}
								type="button"
								onClick={() => setPaletteCategory(cat.id)}
								className="px-3 py-2 text-[11px] font-semibold capitalize transition-all duration-200"
								style={{
									borderRadius: "100px",
									backgroundColor:
										paletteCategory === cat.id ? "var(--color-kumo-brand)" : "transparent",
									color:
										paletteCategory === cat.id
											? "var(--color-kumo-base)"
											: "var(--text-color-kumo-subtle)",
									boxShadow: paletteCategory === cat.id ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
								}}
							>
								{cat.label}
							</button>
						))}
					</div>

					{/* Search */}
					<div className="p-3">
						<div className="relative">
							<MagnifyingGlass
								className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
								style={{
									color: "var(--text-color-kumo-inactive)",
								}}
							/>
							<input
								type="text"
								value={paletteSearch}
								onChange={(e) => setPaletteSearch(e.target.value)}
								placeholder="Search fields..."
								className="w-full pl-8 pr-4 py-3 text-xs focus:outline-none focus:ring-2"
								style={{
									backgroundColor: "var(--color-kumo-tint)",
									border: "1px solid var(--color-kumo-line)",
									color: "var(--text-color-kumo-default)",
									borderRadius: "16px",
								}}
							/>
						</div>
					</div>

					{/* Field grid */}
					<div className="flex-1 overflow-y-auto px-3 pb-3">
						<div className="grid grid-cols-3 gap-2">
							{filteredPalette.map((meta) => (
								<PaletteFieldItem key={meta.type} meta={meta} onAdd={(t) => actions.addField(t)} />
							))}
						</div>
						{filteredPalette.length === 0 && (
							<div className="text-center py-12">
								<MagnifyingGlass
									className="h-8 w-8 mx-auto mb-3"
									style={{
										color: "var(--text-color-kumo-inactive)",
									}}
								/>
								<p
									className="text-xs font-medium"
									style={{
										color: "var(--text-color-kumo-inactive)",
									}}
								>
									No fields match
								</p>
							</div>
						)}
					</div>
				</div>

				{/* ----- Center Canvas ----- */}
				<main
					className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
					style={{
						background:
							"radial-gradient(circle at top right, var(--color-kumo-info-tint) 0%, transparent 28%), linear-gradient(180deg, var(--color-kumo-elevated) 0%, var(--color-kumo-base) 100%)",
					}}
				>
					<div className="mx-auto max-w-5xl">
						{/* Header card */}
						{/* Canvas zone */}
						<div className={`mx-auto transition-all duration-300 ${canvasMaxWidth}`}>
							<div
								onDragOver={handleCanvasDragOver}
								onDragLeave={handleCanvasDragLeave}
								onDrop={handleCanvasDrop}
								className="transition-all duration-200 min-h-[520px]"
								style={{
									borderRadius: "20px",
									backgroundColor: isDragOver
										? "var(--color-kumo-info-tint)"
										: "var(--color-kumo-base)",
									border: isDragOver
										? "2px solid var(--color-kumo-brand)"
										: fields.length > 0
											? "2px solid var(--color-kumo-recessed)"
											: "2px dashed var(--color-kumo-line)",
									boxShadow: isDragOver
										? "0 8px 30px rgba(34,113,177,0.1)"
										: "0 20px 45px rgba(15,23,42,0.08)",
								}}
							>
								{fields.length === 0 ? (
									<EmptyCanvas isDragOver={isDragOver} />
								) : (
									<div className="p-5 space-y-3">
										{/* Form header */}
										<div
											className="flex items-center gap-3 mb-4 pb-4"
											style={{
												borderBottom: "1px solid var(--color-kumo-tint)",
											}}
										>
											<div
												className="w-4 h-4 rounded"
												style={{
													backgroundColor: "var(--color-kumo-brand)",
												}}
											/>
											<h3
												className="text-lg font-bold"
												style={{
													color: "var(--text-color-kumo-default)",
												}}
											>
												{builder.formName || "Untitled Form"}
											</h3>
											<div
												className="ml-auto rounded-full px-3 py-1.5 text-[11px] font-medium"
												style={{
													backgroundColor: "var(--color-kumo-info-tint)",
													color: "var(--color-kumo-brand)",
												}}
											>
												Live layout preview
											</div>
										</div>

										{/* Rendered fields — organized by step/group containment */}
										<CanvasFields
											sections={canvasSections}
											totalSteps={totalSteps}
											selectedFieldId={selectedFieldId}
											actions={actions}
											setButtonSettingsTarget={setButtonSettingsTarget}
											handleReorderDragStart={handleReorderDragStart}
											handleReorderDragOver={handleReorderDragOver}
											handleReorderDrop={handleReorderDrop}
											handleGroupDrop={handleGroupDrop}
											handleUngroup={handleUngroup}
										/>

										{/* Trailing drop hint */}
										<div
											className="rounded-xl py-4 text-center transition-all"
											style={{
												border: isDragOver
													? "2px dashed var(--color-kumo-brand)"
													: "2px dashed var(--color-kumo-recessed)",
												backgroundColor: isDragOver ? "var(--color-kumo-info-tint)" : "transparent",
											}}
										>
											<p
												className="text-xs font-medium"
												style={{
													color: "var(--text-color-kumo-inactive)",
												}}
											>
												{isDragOver ? "Drop here to add" : "Drag more fields here"}
											</p>
										</div>

										{/* Submit / Next button preview */}
										<SubmitButtonPreview
											submitButton={submitButton}
											nextButton={nextButton}
											hasSteps={hasSteps}
											settingsTarget={buttonSettingsTarget}
											onClickSettings={(t) => {
												actions.selectField(null);
												setButtonSettingsTarget(t);
												setShowAfterSubmitPanel(false);
											}}
										/>
									</div>
								)}
							</div>
						</div>
					</div>
				</main>

				{/* ----- Right Sidebar — Settings ----- */}
				{selectedField && (
					<div
						className="w-80 flex-shrink-0 overflow-hidden"
						style={{
							borderLeft: "1px solid var(--color-kumo-line)",
							backgroundColor: "var(--color-kumo-base)",
						}}
					>
						<FieldSettingsPanel
							field={selectedField}
							allFields={fields}
							onUpdate={(updates) => actions.updateField(selectedField.instanceId, updates)}
							onClose={() => actions.selectField(null)}
							onDuplicate={() => actions.duplicateField(selectedField.instanceId)}
							onDelete={() => actions.removeField(selectedField.instanceId)}
							onMoveUp={() => actions.moveFieldUp(selectedField.instanceId)}
							onMoveDown={() => actions.moveFieldDown(selectedField.instanceId)}
							onCopy={() => actions.copyField(selectedField.instanceId)}
						/>
					</div>
				)}
				{!selectedField && buttonSettingsTarget && (
					<div
						className="w-80 flex-shrink-0 overflow-hidden"
						style={{
							borderLeft: "1px solid var(--color-kumo-line)",
							backgroundColor: "var(--color-kumo-base)",
						}}
					>
						<ButtonSettingsPanel
							target={buttonSettingsTarget}
							submitButton={submitButton}
							nextButton={nextButton}
							hasSteps={hasSteps}
							onUpdateSubmit={actions.updateSubmitButton}
							onUpdateNext={actions.updateNextButton}
							onClose={() => setButtonSettingsTarget(null)}
							onSwitchTarget={setButtonSettingsTarget}
						/>
					</div>
				)}
				{!selectedField && !buttonSettingsTarget && showAfterSubmitPanel && (
					<div
						className="w-80 flex-shrink-0 overflow-hidden"
						style={{
							borderLeft: "1px solid var(--color-kumo-line)",
							backgroundColor: "var(--color-kumo-base)",
						}}
					>
						<AfterSubmitPanel
							config={afterSubmit}
							onUpdate={actions.updateAfterSubmit}
							onClose={() => setShowAfterSubmitPanel(false)}
						/>
					</div>
				)}
			</div>

			{/* Save Success Popup */}
			{showSuccessPopup && (
				<div
					style={{
						position: "fixed",
						inset: 0,
						zIndex: 1000,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "rgba(0,0,0,0.4)",
					}}
					onClick={() => setShowSuccessPopup(false)}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						style={{
							backgroundColor: "var(--color-kumo-base)",
							borderRadius: "20px",
							padding: "32px",
							maxWidth: "440px",
							width: "90%",
							boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
						}}
					>
						{/* Success icon */}
						<div
							style={{
								width: 56,
								height: 56,
								borderRadius: "50%",
								backgroundColor: "var(--color-kumo-success-tint, #dcfce7)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								margin: "0 auto 16px",
							}}
						>
							<svg
								width="28"
								height="28"
								viewBox="0 0 24 24"
								fill="none"
								stroke="var(--color-kumo-success, #16a34a)"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						</div>

						<h3
							style={{
								fontSize: "18px",
								fontWeight: 700,
								textAlign: "center",
								color: "var(--text-color-kumo-default)",
								marginBottom: "8px",
							}}
						>
							Form Saved Successfully!
						</h3>

						<p
							style={{
								fontSize: "13px",
								textAlign: "center",
								color: "var(--text-color-kumo-subtle)",
								marginBottom: "20px",
								lineHeight: 1.6,
							}}
						>
							Your form has been saved. To embed it in a page:
						</p>

						{/* Embed guide steps */}
						<div
							style={{
								backgroundColor: "var(--color-kumo-tint)",
								borderRadius: "12px",
								padding: "16px",
								marginBottom: "20px",
							}}
						>
							{[
								{
									step: 1,
									text: (
										<>
											Open any <strong>page</strong> or <strong>post</strong> in the editor
										</>
									),
								},
								{
									step: 2,
									text: (
										<>
											Type{" "}
											<code
												style={{
													backgroundColor: "var(--color-kumo-elevated)",
													padding: "2px 6px",
													borderRadius: 4,
													fontSize: 12,
													fontWeight: 600,
												}}
											>
												/Form
											</code>{" "}
											to open the embed menu
										</>
									),
								},
								{
									step: 3,
									text: (
										<>
											Select <strong>&ldquo;{builder.formName}&rdquo;</strong> from the list and
											publish
										</>
									),
								},
							].map((item) => (
								<div
									key={item.step}
									style={{
										display: "flex",
										gap: 12,
										marginBottom: item.step < 3 ? 12 : 0,
									}}
								>
									<div
										style={{
											width: 24,
											height: 24,
											borderRadius: "50%",
											backgroundColor: "var(--color-kumo-brand)",
											color: "#fff",
											fontSize: 12,
											fontWeight: 700,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
										}}
									>
										{item.step}
									</div>
									<p
										style={{
											fontSize: 12,
											color: "var(--text-color-kumo-default)",
											lineHeight: 1.5,
										}}
									>
										{item.text}
									</p>
								</div>
							))}
						</div>

						{/* Form ID for reference */}
						{builder.formId && (
							<div
								style={{
									fontSize: 11,
									color: "var(--text-color-kumo-inactive)",
									textAlign: "center",
									marginBottom: 16,
								}}
							>
								Form ID:{" "}
								<code
									style={{
										backgroundColor: "var(--color-kumo-tint)",
										padding: "2px 6px",
										borderRadius: 4,
									}}
								>
									{builder.formId}
								</code>
							</div>
						)}

						<button
							type="button"
							onClick={() => setShowSuccessPopup(false)}
							style={{
								width: "100%",
								padding: "10px",
								fontSize: "13px",
								fontWeight: 600,
								backgroundColor: "var(--color-kumo-brand)",
								color: "#fff",
								border: "none",
								borderRadius: "100px",
								cursor: "pointer",
							}}
						>
							Got it!
						</button>
					</div>
				</div>
			)}

			{/* Error toast */}
			{saveState === "error" && saveError && (
				<div
					style={{
						position: "fixed",
						bottom: 24,
						right: 24,
						zIndex: 1000,
						backgroundColor: "var(--color-kumo-danger, #dc2626)",
						color: "#fff",
						padding: "12px 20px",
						borderRadius: "12px",
						fontSize: "13px",
						fontWeight: 500,
						boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
						display: "flex",
						alignItems: "center",
						gap: 8,
						cursor: "pointer",
					}}
					onClick={() => setSaveState("idle")}
				>
					Save failed: {saveError}
				</div>
			)}
		</div>
	);
}
