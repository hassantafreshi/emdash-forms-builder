/**
 * Forms Builder — Field Renderer
 *
 * Renders actual form field elements in the canvas.
 * Each field type gets a real HTML control (input, select, textarea, etc.)
 * so users see exactly what the form will look like.
 */

import {
	CaretDown,
	CheckSquare,
	Calendar,
	CurrencyDollar,
	Eye,
	EyeSlash,
	Hash,
	Lock,
	MapPin,
	PenNib,
	RadioButton,
	Sliders,
	Star,
	TextAlignLeft,
	TextT,
	ToggleLeft,
	Upload,
	User,
	Envelope,
	Phone,
	DeviceMobile,
	ListChecks,
	LinkSimple,
	GlobeSimple,
	ClipboardText,
	Palette,
	Code,
	Gauge,
	Image,
	Table,
	Minus,
	ArrowsLeftRight,
	Rows,
} from "@phosphor-icons/react";
import * as React from "react";

import type { CanvasField } from "./types.js";

// =============================================================================
// Icon map for field types
// =============================================================================

const FIELD_ICONS: Record<string, React.ComponentType<{ className?: string; weight?: string }>> = {
	text: TextT,
	name: User,
	password: Lock,
	email: Envelope,
	number: Hash,
	textarea: TextAlignLeft,
	checkbox: CheckSquare,
	radio: RadioButton,
	select: CaretDown,
	multiselect: ListChecks,
	tel: Phone,
	mobile: DeviceMobile,
	range: Sliders,
	date: Calendar,
	file: Upload,
	toggle: ToggleLeft,
	yesNo: ToggleLeft,
	yes_no: ToggleLeft,
	prcfld: CurrencyDollar,
	ttlprc: CurrencyDollar,
	stripe: CurrencyDollar,
	paypal: CurrencyDollar,
	address: MapPin,
	url: LinkSimple,
	countries_dd: GlobeSimple,
	state_dd: GlobeSimple,
	signature: PenNib,
	rating: Star,
	rating_star: Star,
	nps: Gauge,
	five_point: Gauge,
	heading: TextT,
	html_code: Code,
	color_picker: Palette,
	imgRadio: Image,
	terms: ClipboardText,
	table_matrix: Table,
	hidden: Eye,
	divider: Minus,
	step: Rows,
	group: ArrowsLeftRight,
};

export function getFieldIcon(
	fieldType: string,
): React.ComponentType<{ className?: string; weight?: string }> {
	return FIELD_ICONS[fieldType] ?? TextT;
}

// =============================================================================
// Shared input styles
// =============================================================================

const inputBase: React.CSSProperties = {
	width: "100%",
	padding: "8px 12px",
	fontSize: "13px",
	border: "1px solid var(--color-kumo-line)",
	borderRadius: "8px",
	backgroundColor: "var(--color-kumo-control)",
	color: "var(--text-color-kumo-default)",
	outline: "none",
	transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
	display: "block",
	fontSize: "13px",
	fontWeight: 600,
	color: "var(--text-color-kumo-default)",
	marginBottom: "4px",
};

const helpStyle: React.CSSProperties = {
	fontSize: "11px",
	color: "var(--text-color-kumo-inactive)",
	marginTop: "3px",
};

const requiredStar: React.CSSProperties = {
	color: "var(--color-kumo-danger)",
	marginLeft: "2px",
};

// =============================================================================
// Helpers — build runtime styles from field config
// =============================================================================

function getInputStyle(field: CanvasField): React.CSSProperties {
	const s = field.style;
	return {
		...inputBase,
		...(s.borderRadius ? { borderRadius: s.borderRadius } : {}),
		...(s.borderStyle ? { borderStyle: s.borderStyle } : {}),
		...(s.backgroundColor ? { backgroundColor: s.backgroundColor } : {}),
		...(s.inputFontSize ? { fontSize: s.inputFontSize } : {}),
	};
}

function getLabelStyle(field: CanvasField): React.CSSProperties {
	const s = field.style;
	return {
		...labelStyle,
		...(s.labelFontSize ? { fontSize: s.labelFontSize } : {}),
		...(s.labelFontWeight ? { fontWeight: s.labelFontWeight } : {}),
	};
}

function getWrapperStyle(field: CanvasField): React.CSSProperties {
	const s = field.style;
	return {
		...(s.marginTop ? { marginTop: s.marginTop } : {}),
		...(s.marginBottom ? { marginBottom: s.marginBottom } : {}),
		...(s.padding ? { padding: s.padding } : {}),
	};
}

/**
 * Generates a <style> tag for pseudo-class/pseudo-element styles that
 * can't be applied via inline styles (placeholder color, focus border, error border).
 */
function FieldPseudoStyles({ field }: { field: CanvasField }) {
	const s = field.style;
	if (!s.placeholderColor && !s.focusBorderColor && !s.errorBorderColor) return null;
	const id = CSS.escape(field.instanceId);
	let css = "";
	if (s.placeholderColor) {
		css += `[data-field-id="${id}"] input::placeholder, [data-field-id="${id}"] textarea::placeholder { color: ${s.placeholderColor} !important; }\n`;
	}
	if (s.focusBorderColor) {
		css += `[data-field-id="${id}"] input:focus, [data-field-id="${id}"] textarea:focus, [data-field-id="${id}"] select:focus { border-color: ${s.focusBorderColor} !important; }\n`;
	}
	if (s.errorBorderColor) {
		css += `[data-field-id="${id}"] input:invalid, [data-field-id="${id}"] textarea:invalid, [data-field-id="${id}"] select:invalid { border-color: ${s.errorBorderColor} !important; }\n`;
	}
	return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function IconBadge({ icon, position }: { icon: string; position: "before" | "after" }) {
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 2,
				fontSize: "10px",
				color: "var(--text-color-kumo-inactive)",
				padding: "1px 4px",
				borderRadius: 4,
				border: "1px dashed var(--color-kumo-line)",
				marginRight: position === "before" ? 4 : 0,
				marginLeft: position === "after" ? 4 : 0,
			}}
		>
			🔤 {icon}
		</span>
	);
}

// =============================================================================
// Field Label
// =============================================================================

function FieldLabel({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	const [editing, setEditing] = React.useState(false);
	const [draft, setDraft] = React.useState(field.label);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const dynLabel = getLabelStyle(field);

	React.useEffect(() => {
		setDraft(field.label);
	}, [field.label]);

	React.useEffect(() => {
		if (editing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [editing]);

	if (field.labelPosition === "hidden") return null;

	if (editing && onLabelChange) {
		return (
			<input
				ref={inputRef}
				type="text"
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				onBlur={() => {
					setEditing(false);
					if (draft.trim()) onLabelChange(draft.trim());
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						setEditing(false);
						if (draft.trim()) onLabelChange(draft.trim());
					} else if (e.key === "Escape") {
						setEditing(false);
						setDraft(field.label);
					}
				}}
				style={{
					...dynLabel,
					border: "1px solid var(--color-kumo-brand)",
					borderRadius: "4px",
					padding: "2px 6px",
					backgroundColor: "var(--color-kumo-control)",
					outline: "none",
					width: "100%",
				}}
				onClick={(e) => e.stopPropagation()}
			/>
		);
	}

	return (
		<label
			style={dynLabel}
			onDoubleClick={(e) => {
				e.stopPropagation();
				if (onLabelChange) setEditing(true);
			}}
			title="Double-click to edit label"
		>
			{field.label}
			{field.required && <span style={requiredStar}>*</span>}
		</label>
	);
}

function HelpText({ field }: { field: CanvasField }) {
	if (!field.helpText) return null;
	return <p style={helpStyle}>{field.helpText}</p>;
}

// =============================================================================
// Individual Field Renderers
// =============================================================================

function TextFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	const type =
		field.fieldType === "email"
			? "email"
			: field.fieldType === "password"
				? "password"
				: field.fieldType === "tel" || field.fieldType === "mobile"
					? "tel"
					: field.fieldType === "url"
						? "url"
						: "text";

	const [showPw, setShowPw] = React.useState(false);

	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<div style={{ position: "relative" }}>
				{field.textConfig.prefix && (
					<span
						style={{
							position: "absolute",
							left: 10,
							top: "50%",
							transform: "translateY(-50%)",
							fontSize: "12px",
							color: "var(--text-color-kumo-inactive)",
						}}
					>
						{field.textConfig.prefix}
					</span>
				)}
				<input
					type={field.fieldType === "password" && showPw ? "text" : type}
					placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
					defaultValue={field.defaultValue}
					disabled={field.disabled}
					readOnly={field.readOnly}
					style={{
						...getInputStyle(field),
						paddingLeft: field.textConfig.prefix ? "32px" : "12px",
						paddingRight:
							field.textConfig.suffix || field.fieldType === "password" ? "36px" : "12px",
					}}
					onClick={(e) => e.stopPropagation()}
				/>
				{field.fieldType === "password" && field.textConfig.showPasswordToggle && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							setShowPw((v) => !v);
						}}
						style={{
							position: "absolute",
							right: 8,
							top: "50%",
							transform: "translateY(-50%)",
							background: "none",
							border: "none",
							cursor: "pointer",
							padding: 4,
							color: "var(--text-color-kumo-inactive)",
						}}
					>
						{showPw ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
					</button>
				)}
				{field.textConfig.suffix && (
					<span
						style={{
							position: "absolute",
							right: 10,
							top: "50%",
							transform: "translateY(-50%)",
							fontSize: "12px",
							color: "var(--text-color-kumo-inactive)",
						}}
					>
						{field.textConfig.suffix}
					</span>
				)}
			</div>
			{field.textConfig.showCharCount && (
				<p style={{ ...helpStyle, textAlign: "right" }}>0 / {field.validation.maxLength ?? "∞"}</p>
			)}
			<HelpText field={field} />
		</div>
	);
}

function NumberFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<div style={{ position: "relative" }}>
				{field.numberConfig.currency && (
					<span
						style={{
							position: "absolute",
							left: 10,
							top: "50%",
							transform: "translateY(-50%)",
							fontSize: "12px",
							color: "var(--text-color-kumo-inactive)",
						}}
					>
						{field.numberConfig.currency}
					</span>
				)}
				<input
					type="number"
					placeholder={field.placeholder || "0"}
					defaultValue={field.defaultValue}
					min={field.validation.minValue}
					max={field.validation.maxValue}
					step={field.numberConfig.step}
					disabled={field.disabled}
					style={{
						...getInputStyle(field),
						paddingLeft: field.numberConfig.currency ? "28px" : "12px",
					}}
					onClick={(e) => e.stopPropagation()}
				/>
			</div>
			<HelpText field={field} />
		</div>
	);
}

function TextareaFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<textarea
				placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
				defaultValue={field.defaultValue}
				rows={field.textConfig.rows || 4}
				disabled={field.disabled}
				readOnly={field.readOnly}
				style={{
					...getInputStyle(field),
					resize: field.textConfig.resizable ? "vertical" : "none",
					minHeight: "80px",
				}}
				onClick={(e) => e.stopPropagation()}
			/>
			{field.textConfig.showCharCount && (
				<p style={{ ...helpStyle, textAlign: "right" }}>0 / {field.validation.maxLength ?? "∞"}</p>
			)}
			<HelpText field={field} />
		</div>
	);
}

function SelectFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<select
				disabled={field.disabled}
				style={{
					...getInputStyle(field),
					appearance: "none",
					WebkitAppearance: "none",
					backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
					backgroundRepeat: "no-repeat",
					backgroundPosition: "right 10px center",
					paddingRight: "30px",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{field.options.length === 0 && <option>Select...</option>}
				{field.options.map((opt) => (
					<option key={opt.id} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
			<HelpText field={field} />
		</div>
	);
}

function RadioFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
				{field.options.map((opt) => (
					<label
						key={opt.id}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							fontSize: "13px",
							color: "var(--text-color-kumo-default)",
							cursor: "pointer",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<input
							type="radio"
							name={`radio_${field.instanceId}`}
							value={opt.value}
							defaultChecked={field.defaultValue === opt.value}
							disabled={field.disabled}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						{opt.label}
					</label>
				))}
			</div>
			<HelpText field={field} />
		</div>
	);
}

function CheckboxFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
				{field.options.map((opt) => (
					<label
						key={opt.id}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							fontSize: "13px",
							color: "var(--text-color-kumo-default)",
							cursor: "pointer",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<input
							type="checkbox"
							value={opt.value}
							disabled={field.disabled}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						{opt.label}
					</label>
				))}
			</div>
			<HelpText field={field} />
		</div>
	);
}

function ToggleFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	const [on, setOn] = React.useState(field.defaultValue === "true");
	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					setOn((v) => !v);
				}}
				style={{
					width: 44,
					height: 24,
					borderRadius: 12,
					border: "none",
					backgroundColor: on ? "var(--color-kumo-brand)" : "var(--color-kumo-recessed)",
					cursor: "pointer",
					position: "relative",
					transition: "background-color 0.2s",
				}}
			>
				<span
					style={{
						position: "absolute",
						top: 2,
						left: on ? 22 : 2,
						width: 20,
						height: 20,
						borderRadius: 10,
						backgroundColor: "white",
						transition: "left 0.2s",
						boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
					}}
				/>
			</button>
			<HelpText field={field} />
		</div>
	);
}

function DateFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<input
				type="date"
				disabled={field.disabled}
				style={getInputStyle(field)}
				onClick={(e) => e.stopPropagation()}
			/>
			<HelpText field={field} />
		</div>
	);
}

function FileFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			{field.fileConfig.dragDropArea ? (
				<div
					style={{
						border: "2px dashed var(--color-kumo-line)",
						borderRadius: "12px",
						padding: "24px",
						textAlign: "center",
						backgroundColor: "var(--color-kumo-tint)",
					}}
					onClick={(e) => e.stopPropagation()}
				>
					<Upload
						className="h-8 w-8 mx-auto mb-2"
						style={{ color: "var(--text-color-kumo-inactive)" }}
					/>
					<p
						style={{
							fontSize: "13px",
							color: "var(--text-color-kumo-subtle)",
							margin: 0,
						}}
					>
						Drag & drop files here or{" "}
						<span style={{ color: "var(--color-kumo-brand)", cursor: "pointer" }}>browse</span>
					</p>
					<p
						style={{
							fontSize: "11px",
							color: "var(--text-color-kumo-inactive)",
							marginTop: 4,
						}}
					>
						{field.fileConfig.allowedTypes
							? `Allowed: ${field.fileConfig.allowedTypes}`
							: "All file types accepted"}
						{" · "}Max {field.fileConfig.maxSizeMb}MB
					</p>
				</div>
			) : (
				<input
					type="file"
					disabled={field.disabled}
					multiple={field.fileConfig.multiple}
					style={getInputStyle(field)}
					onClick={(e) => e.stopPropagation()}
				/>
			)}
			<HelpText field={field} />
		</div>
	);
}

function RangeFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	const [val, setVal] = React.useState(Number(field.defaultValue) || 50);
	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
				}}
			>
				<input
					type="range"
					min={field.validation.minValue ?? 0}
					max={field.validation.maxValue ?? 100}
					step={field.numberConfig.step || 1}
					value={val}
					onChange={(e) => setVal(Number(e.target.value))}
					style={{ flex: 1, accentColor: "var(--color-kumo-brand)" }}
					onClick={(e) => e.stopPropagation()}
				/>
				<span
					style={{
						fontSize: "13px",
						fontWeight: 600,
						color: "var(--text-color-kumo-default)",
						minWidth: 30,
						textAlign: "right",
					}}
				>
					{val}
				</span>
			</div>
			<HelpText field={field} />
		</div>
	);
}

function RatingFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	const [hovered, setHovered] = React.useState(0);
	const [selected, setSelected] = React.useState(0);
	const max = field.ratingConfig.maxRating || 5;

	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<div style={{ display: "flex", gap: "4px" }}>
				{Array.from({ length: max }, (_, i) => i + 1).map((n) => (
					<button
						key={n}
						type="button"
						onMouseEnter={() => setHovered(n)}
						onMouseLeave={() => setHovered(0)}
						onClick={(e) => {
							e.stopPropagation();
							setSelected(n);
						}}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							padding: 2,
							color: n <= (hovered || selected) ? "#f59e0b" : "var(--color-kumo-recessed)",
							transition: "color 0.1s",
						}}
					>
						<Star className="h-6 w-6" weight={n <= (hovered || selected) ? "fill" : "regular"} />
					</button>
				))}
			</div>
			<HelpText field={field} />
		</div>
	);
}

function NpsFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	const [selected, setSelected] = React.useState<number | null>(null);

	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
				{Array.from({ length: 11 }, (_, i) => i).map((n) => (
					<button
						key={n}
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							setSelected(n);
						}}
						style={{
							width: 36,
							height: 36,
							borderRadius: 8,
							border:
								selected === n
									? "2px solid var(--color-kumo-brand)"
									: "1px solid var(--color-kumo-line)",
							backgroundColor:
								selected === n ? "var(--color-kumo-info-tint)" : "var(--color-kumo-control)",
							color: selected === n ? "var(--color-kumo-brand)" : "var(--text-color-kumo-default)",
							fontSize: "13px",
							fontWeight: selected === n ? 700 : 500,
							cursor: "pointer",
							transition: "all 0.15s",
						}}
					>
						{n}
					</button>
				))}
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginTop: 4,
				}}
			>
				<span style={{ fontSize: "11px", color: "var(--text-color-kumo-inactive)" }}>
					Not likely
				</span>
				<span style={{ fontSize: "11px", color: "var(--text-color-kumo-inactive)" }}>
					Very likely
				</span>
			</div>
			<HelpText field={field} />
		</div>
	);
}

function SignatureFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<div
				style={{
					border: "1px solid var(--color-kumo-line)",
					borderRadius: "8px",
					height: 100,
					backgroundColor: "var(--color-kumo-control)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div style={{ textAlign: "center" }}>
					<PenNib
						className="h-6 w-6 mx-auto mb-1"
						style={{ color: "var(--text-color-kumo-inactive)" }}
					/>
					<p
						style={{
							fontSize: "12px",
							color: "var(--text-color-kumo-inactive)",
							margin: 0,
						}}
					>
						Click to sign
					</p>
				</div>
			</div>
			<HelpText field={field} />
		</div>
	);
}

function ColorPickerFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
				<input
					type="color"
					defaultValue={field.defaultValue || "#3b82f6"}
					style={{
						width: 40,
						height: 36,
						border: "1px solid var(--color-kumo-line)",
						borderRadius: 6,
						cursor: "pointer",
						padding: 2,
					}}
					onClick={(e) => e.stopPropagation()}
				/>
				<input
					type="text"
					defaultValue={field.defaultValue || "#3b82f6"}
					placeholder="#000000"
					style={{ ...getInputStyle(field), flex: 1 }}
					onClick={(e) => e.stopPropagation()}
				/>
			</div>
			<HelpText field={field} />
		</div>
	);
}

function HeadingFieldRender({
	field,
	onLabelChange: _onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	return (
		<div>
			<h3
				style={{
					fontSize: "18px",
					fontWeight: 700,
					color: "var(--text-color-kumo-default)",
					margin: 0,
					cursor: "text",
				}}
				onDoubleClick={(e) => e.stopPropagation()}
			>
				{field.label}
			</h3>
			{field.helpText && (
				<p
					style={{
						fontSize: "13px",
						color: "var(--text-color-kumo-subtle)",
						marginTop: 4,
					}}
				>
					{field.helpText}
				</p>
			)}
		</div>
	);
}

function DividerFieldRender() {
	return (
		<div style={{ padding: "8px 0" }}>
			<hr
				style={{
					border: "none",
					borderTop: "1px solid var(--color-kumo-line)",
					margin: 0,
				}}
			/>
		</div>
	);
}

function HiddenFieldRender({ field }: { field: CanvasField }) {
	return (
		<div
			style={{
				padding: "8px 12px",
				borderRadius: 8,
				backgroundColor: "var(--color-kumo-tint)",
				border: "1px dashed var(--color-kumo-line)",
				display: "flex",
				alignItems: "center",
				gap: 8,
			}}
		>
			<EyeSlash className="h-4 w-4" style={{ color: "var(--text-color-kumo-inactive)" }} />
			<span
				style={{
					fontSize: "12px",
					color: "var(--text-color-kumo-inactive)",
					fontStyle: "italic",
				}}
			>
				Hidden field: {field.name}
			</span>
		</div>
	);
}

function TermsFieldRender({
	field,
	onLabelChange: _onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	return (
		<div>
			<label
				style={{
					display: "flex",
					alignItems: "flex-start",
					gap: "8px",
					fontSize: "13px",
					color: "var(--text-color-kumo-default)",
					cursor: "pointer",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<input
					type="checkbox"
					style={{
						marginTop: 2,
						accentColor: "var(--color-kumo-brand)",
					}}
				/>
				<span>
					{field.label}
					{field.required && <span style={requiredStar}>*</span>}
				</span>
			</label>
			<HelpText field={field} />
		</div>
	);
}

function AddressFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	const cfg = field.addressConfig;
	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "8px",
				}}
			>
				{cfg.showStreet && (
					<input
						type="text"
						placeholder="Street address"
						style={{ ...getInputStyle(field), gridColumn: "1 / -1" }}
						onClick={(e) => e.stopPropagation()}
					/>
				)}
				{cfg.showApartment && (
					<input
						type="text"
						placeholder="Apt / Unit"
						style={{ ...getInputStyle(field), gridColumn: "1 / -1" }}
						onClick={(e) => e.stopPropagation()}
					/>
				)}
				{cfg.showCity && (
					<input
						type="text"
						placeholder="City"
						style={getInputStyle(field)}
						onClick={(e) => e.stopPropagation()}
					/>
				)}
				{cfg.showState && (
					<input
						type="text"
						placeholder="State / Province"
						style={getInputStyle(field)}
						onClick={(e) => e.stopPropagation()}
					/>
				)}
				{cfg.showPostalCode && (
					<input
						type="text"
						placeholder="Postal code"
						style={getInputStyle(field)}
						onClick={(e) => e.stopPropagation()}
					/>
				)}
				{cfg.showCountry && (
					<select style={getInputStyle(field)} onClick={(e) => e.stopPropagation()}>
						<option>Select country...</option>
					</select>
				)}
			</div>
			<HelpText field={field} />
		</div>
	);
}

function PriceFieldRender({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	return (
		<div>
			<FieldLabel field={field} onLabelChange={onLabelChange} />
			<div style={{ position: "relative" }}>
				<span
					style={{
						position: "absolute",
						left: 10,
						top: "50%",
						transform: "translateY(-50%)",
						fontSize: "13px",
						fontWeight: 600,
						color: "var(--text-color-kumo-subtle)",
					}}
				>
					$
				</span>
				<input
					type="number"
					placeholder="0.00"
					step="0.01"
					min="0"
					disabled={field.disabled}
					style={{ ...getInputStyle(field), paddingLeft: "24px" }}
					onClick={(e) => e.stopPropagation()}
				/>
			</div>
			<HelpText field={field} />
		</div>
	);
}

function HtmlCodeFieldRender({ field }: { field: CanvasField }) {
	return (
		<div
			style={{
				padding: "12px",
				borderRadius: 8,
				backgroundColor: "var(--color-kumo-tint)",
				border: "1px solid var(--color-kumo-line)",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 6,
					marginBottom: 6,
				}}
			>
				<Code className="h-4 w-4" style={{ color: "var(--text-color-kumo-inactive)" }} />
				<span
					style={{
						fontSize: "12px",
						fontWeight: 600,
						color: "var(--text-color-kumo-subtle)",
					}}
				>
					Custom HTML Block
				</span>
			</div>
			<pre
				style={{
					fontSize: "11px",
					color: "var(--text-color-kumo-inactive)",
					margin: 0,
					fontFamily: "monospace",
					whiteSpace: "pre-wrap",
				}}
			>
				{field.defaultValue || "<div>Custom content here</div>"}
			</pre>
		</div>
	);
}

function StepFieldRender({
	field,
	onLabelChange: _onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	const cfg = field.stepConfig;
	return (
		<div
			style={{
				padding: "16px",
				borderRadius: 12,
				backgroundColor: "var(--color-kumo-info-tint)",
				border: "2px dashed var(--color-kumo-brand)",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 8,
					marginBottom: cfg.description ? 6 : 0,
				}}
			>
				<Rows className="h-5 w-5" style={{ color: "var(--color-kumo-brand)" }} />
				{cfg.showStepNumber && (
					<span
						style={{
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							width: 24,
							height: 24,
							borderRadius: "50%",
							backgroundColor: "var(--color-kumo-brand)",
							color: "white",
							fontSize: "12px",
							fontWeight: 700,
						}}
					>
						#
					</span>
				)}
				<span
					style={{
						fontSize: "15px",
						fontWeight: 700,
						color: "var(--color-kumo-brand)",
					}}
				>
					{field.label}
				</span>
			</div>
			{cfg.description && (
				<p
					style={{
						fontSize: "12px",
						color: "var(--text-color-kumo-subtle)",
						margin: 0,
						marginLeft: cfg.showStepNumber ? 40 : 28,
					}}
				>
					{cfg.description}
				</p>
			)}
			{cfg.showProgressBar && (
				<div
					style={{
						marginTop: 10,
						height: 4,
						borderRadius: 2,
						backgroundColor: "var(--color-kumo-recessed)",
						overflow: "hidden",
					}}
				>
					<div
						style={{
							width: "33%",
							height: "100%",
							borderRadius: 2,
							backgroundColor: "var(--color-kumo-brand)",
						}}
					/>
				</div>
			)}
			<div
				style={{
					display: "flex",
					gap: 8,
					marginTop: 10,
					justifyContent: "flex-end",
				}}
			>
				<span
					style={{
						fontSize: "11px",
						padding: "4px 12px",
						borderRadius: 6,
						backgroundColor: "var(--color-kumo-recessed)",
						color: "var(--text-color-kumo-subtle)",
					}}
				>
					{cfg.prevButtonLabel || "Previous"}
				</span>
				<span
					style={{
						fontSize: "11px",
						padding: "4px 12px",
						borderRadius: 6,
						backgroundColor: "var(--color-kumo-brand)",
						color: "white",
					}}
				>
					{cfg.nextButtonLabel || "Next"}
				</span>
			</div>
		</div>
	);
}

function GroupFieldRender({
	field,
	onLabelChange: _onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	const cfg = field.groupConfig;
	return (
		<div
			style={{
				padding: "14px",
				borderRadius: 10,
				backgroundColor: "var(--color-kumo-tint)",
				border: cfg.showBorder
					? "1px solid var(--color-kumo-line)"
					: "1px dashed var(--color-kumo-line)",
			}}
		>
			{cfg.showTitle && (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 6,
						marginBottom: cfg.description ? 4 : 8,
					}}
				>
					<ArrowsLeftRight className="h-4 w-4" style={{ color: "var(--text-color-kumo-subtle)" }} />
					<span
						style={{
							fontSize: "14px",
							fontWeight: 700,
							color: "var(--text-color-kumo-default)",
						}}
					>
						{field.label}
					</span>
					{cfg.collapsible && (
						<CaretDown
							className="h-3 w-3"
							style={{ color: "var(--text-color-kumo-inactive)", marginLeft: "auto" }}
						/>
					)}
				</div>
			)}
			{cfg.description && (
				<p
					style={{
						fontSize: "12px",
						color: "var(--text-color-kumo-subtle)",
						margin: 0,
						marginBottom: 8,
					}}
				>
					{cfg.description}
				</p>
			)}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: `repeat(${cfg.columns}, 1fr)`,
					gap: "8px",
					minHeight: 48,
					padding: "8px",
					borderRadius: 6,
					border: "1px dashed var(--color-kumo-line)",
					backgroundColor: "var(--color-kumo-base)",
				}}
			>
				<p
					style={{
						fontSize: "11px",
						color: "var(--text-color-kumo-inactive)",
						textAlign: "center",
						margin: 0,
						gridColumn: "1 / -1",
						alignSelf: "center",
					}}
				>
					Drop fields inside this group
				</p>
			</div>
		</div>
	);
}

// =============================================================================
// Main Field Renderer (dispatch by type)
// =============================================================================

function FieldInner({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	switch (field.fieldType) {
		case "text":
		case "name":
		case "email":
		case "password":
		case "tel":
		case "mobile":
		case "url":
			return <TextFieldRender field={field} onLabelChange={onLabelChange} />;
		case "number":
		case "prcfld":
		case "ttlprc":
			if (field.fieldType === "prcfld" || field.fieldType === "ttlprc") {
				return <PriceFieldRender field={field} onLabelChange={onLabelChange} />;
			}
			return <NumberFieldRender field={field} onLabelChange={onLabelChange} />;
		case "textarea":
			return <TextareaFieldRender field={field} onLabelChange={onLabelChange} />;
		case "select":
		case "multiselect":
		case "countries_dd":
		case "state_dd":
		case "cities_dd":
			return <SelectFieldRender field={field} onLabelChange={onLabelChange} />;
		case "radio":
		case "yesNo":
		case "yes_no":
		case "imgRadio":
			return <RadioFieldRender field={field} onLabelChange={onLabelChange} />;
		case "checkbox":
			return <CheckboxFieldRender field={field} onLabelChange={onLabelChange} />;
		case "toggle":
			return <ToggleFieldRender field={field} onLabelChange={onLabelChange} />;
		case "date":
		case "jalali_date":
		case "hijri_date":
			return <DateFieldRender field={field} onLabelChange={onLabelChange} />;
		case "file":
		case "dadfile":
			return <FileFieldRender field={field} onLabelChange={onLabelChange} />;
		case "range":
			return <RangeFieldRender field={field} onLabelChange={onLabelChange} />;
		case "rating":
		case "rating_star":
		case "five_point":
			return <RatingFieldRender field={field} onLabelChange={onLabelChange} />;
		case "nps":
			return <NpsFieldRender field={field} onLabelChange={onLabelChange} />;
		case "signature":
			return <SignatureFieldRender field={field} onLabelChange={onLabelChange} />;
		case "color_picker":
			return <ColorPickerFieldRender field={field} onLabelChange={onLabelChange} />;
		case "heading":
			return <HeadingFieldRender field={field} onLabelChange={onLabelChange} />;
		case "divider":
			return <DividerFieldRender />;
		case "hidden":
			return <HiddenFieldRender field={field} />;
		case "terms":
			return <TermsFieldRender field={field} onLabelChange={onLabelChange} />;
		case "address":
			return <AddressFieldRender field={field} onLabelChange={onLabelChange} />;
		case "html_code":
			return <HtmlCodeFieldRender field={field} />;
		case "step":
			return <StepFieldRender field={field} onLabelChange={onLabelChange} />;
		case "group":
			return <GroupFieldRender field={field} onLabelChange={onLabelChange} />;
		default:
			// Fallback: generic text input
			return <TextFieldRender field={field} onLabelChange={onLabelChange} />;
	}
}

// =============================================================================
// Public wrapper — applies style, layout, identification props
// =============================================================================

export function FieldRenderer({
	field,
	onLabelChange,
}: {
	field: CanvasField;
	onLabelChange?: (label: string) => void;
}) {
	const wrapperStyle = getWrapperStyle(field);
	const isHorizontal = field.labelPosition === "left" || field.labelPosition === "right";

	return (
		<div
			style={wrapperStyle}
			className={field.cssClass || undefined}
			id={field.customId || undefined}
			data-field-id={field.instanceId}
		>
			<FieldPseudoStyles field={field} />
			{(field.iconBefore || field.iconAfter) && (
				<div style={{ marginBottom: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
					{field.iconBefore && <IconBadge icon={field.iconBefore} position="before" />}
					{field.iconAfter && <IconBadge icon={field.iconAfter} position="after" />}
				</div>
			)}
			{isHorizontal ? (
				<div
					style={{
						display: "flex",
						alignItems: "flex-start",
						gap: 12,
						flexDirection: field.labelPosition === "right" ? "row-reverse" : "row",
					}}
				>
					<div style={{ flexShrink: 0, minWidth: 80, paddingTop: 8 }}>
						<FieldLabel field={field} onLabelChange={onLabelChange} />
						{field.descriptionPosition === "below-label" && field.helpText && (
							<HelpText field={field} />
						)}
					</div>
					<div style={{ flex: 1, minWidth: 0 }}>
						<FieldInner field={{ ...field, labelPosition: "hidden" }} />
						{field.descriptionPosition !== "below-label" && field.helpText && (
							<HelpText field={field} />
						)}
					</div>
				</div>
			) : (
				<>
					{field.descriptionPosition === "below-label" && (
						<>
							<FieldLabel field={field} onLabelChange={onLabelChange} />
							{field.helpText && <HelpText field={field} />}
							<FieldInner field={{ ...field, labelPosition: "hidden" }} />
						</>
					)}
					{field.descriptionPosition !== "below-label" && (
						<FieldInner field={field} onLabelChange={onLabelChange} />
					)}
				</>
			)}
		</div>
	);
}
