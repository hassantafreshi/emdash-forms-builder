/**
 * Forms Builder â€” Field Settings Panel
 *
 * Right-side panel that appears when a field is selected.
 * Organized into tabs: General, Validation, Options, Logic, Style, Advanced.
 */

import { ArrowDown, ArrowUp, CaretDown, Copy, Plus, Trash, X } from "@phosphor-icons/react";
import * as React from "react";

import {
	isChoiceField,
	isDateField,
	isFileField,
	isGroupField,
	isNumberField,
	isRatingField,
	isStructuralField,
	isStepField,
	isTextField,
} from "./field-defaults.js";
import type {
	CanvasField,
	FieldAdvancedConfig,
	FieldOption,
	FieldStyleConfig,
	FieldValidationConfig,
	SettingsTab,
	WidthOption,
	LabelPosition,
} from "./types.js";

/** Strips characters not allowed in a field name/key (letters, digits, underscore). */
const NAME_SANITIZE_RE = /[^a-zA-Z0-9_]/g;

/** Decorative/structural fields that have no user input — no placeholder, default, state, or layout. */
const DECORATIVE_TYPES = new Set(["divider", "heading"]);

/** Fields that don't accept text input and shouldn't show placeholder. */
const NO_PLACEHOLDER_TYPES = new Set([
	"checkbox",
	"radio",
	"toggle",
	"file",
	"rating",
	"five_point",
	"signature",
	"color_picker",
	"range",
	"hidden",
	"divider",
	"step",
	"group",
	"heading",
]);

/** Fields where width selection makes no sense (always full-width). */
const NO_WIDTH_TYPES = new Set(["step", "divider", "heading"]);

// =============================================================================
// Shared styles
// =============================================================================

const panelInput: React.CSSProperties = {
	width: "100%",
	padding: "7px 10px",
	fontSize: "12px",
	border: "1px solid var(--color-kumo-line)",
	borderRadius: "6px",
	backgroundColor: "var(--color-kumo-control)",
	color: "var(--text-color-kumo-default)",
	outline: "none",
};

const panelLabel: React.CSSProperties = {
	display: "block",
	fontSize: "11px",
	fontWeight: 600,
	color: "var(--text-color-kumo-subtle)",
	marginBottom: "3px",
	textTransform: "uppercase",
	letterSpacing: "0.04em",
};

const panelSection: React.CSSProperties = {
	marginBottom: "16px",
};

const panelCheckLabel: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: "6px",
	fontSize: "12px",
	color: "var(--text-color-kumo-default)",
	cursor: "pointer",
};

// =============================================================================
// Field Group â€” collapsible section
// =============================================================================

function FieldGroup({
	title,
	defaultOpen = true,
	children,
}: {
	title: string;
	defaultOpen?: boolean;
	children: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(defaultOpen);
	return (
		<div style={{ marginBottom: 12 }}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					width: "100%",
					padding: "6px 0",
					border: "none",
					background: "none",
					cursor: "pointer",
					fontSize: "11px",
					fontWeight: 700,
					color: "var(--text-color-kumo-subtle)",
					textTransform: "uppercase",
					letterSpacing: "0.05em",
				}}
			>
				{title}
				<CaretDown
					className="h-3 w-3"
					style={{
						transform: open ? "rotate(180deg)" : "rotate(0deg)",
						transition: "transform 0.15s",
						color: "var(--text-color-kumo-inactive)",
					}}
				/>
			</button>
			{open && (
				<div
					style={{
						paddingTop: 6,
						borderTop: "1px solid var(--color-kumo-line)",
					}}
				>
					{children}
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Coming Soon placeholder
// =============================================================================

function ComingSoonTab({ label }: { label: string }) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: "48px 16px",
				textAlign: "center",
				gap: 8,
			}}
		>
			<svg
				width="28"
				height="28"
				viewBox="0 0 256 256"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect
					x="24"
					y="100"
					width="208"
					height="56"
					rx="8"
					stroke="var(--text-color-kumo-inactive)"
					strokeWidth="16"
					fill="none"
				/>
				<line
					x1="72"
					y1="100"
					x2="40"
					y2="156"
					stroke="var(--text-color-kumo-inactive)"
					strokeWidth="16"
				/>
				<line
					x1="144"
					y1="100"
					x2="112"
					y2="156"
					stroke="var(--text-color-kumo-inactive)"
					strokeWidth="16"
				/>
				<line
					x1="216"
					y1="100"
					x2="184"
					y2="156"
					stroke="var(--text-color-kumo-inactive)"
					strokeWidth="16"
				/>
			</svg>
			<p
				style={{
					fontSize: "14px",
					fontWeight: 600,
					color: "var(--text-color-kumo-default)",
				}}
			>
				{label}
			</p>
			<p
				style={{
					fontSize: "12px",
					color: "var(--text-color-kumo-inactive)",
				}}
			>
				Coming Soon
			</p>
		</div>
	);
}

// =============================================================================
// Tab Bar
// =============================================================================

function SettingsTabBar({
	activeTab,
	onTabChange,
	field,
}: {
	activeTab: SettingsTab;
	onTabChange: (tab: SettingsTab) => void;
	field: CanvasField;
}) {
	const tabs: { id: SettingsTab; label: string; show: boolean }[] = [
		{ id: "general", label: "General", show: true },
		{
			id: "validation",
			label: "Validation",
			show: !isStructuralField(field.fieldType) && !DECORATIVE_TYPES.has(field.fieldType),
		},
		{
			id: "options",
			label: "Options",
			show: isChoiceField(field.fieldType),
		},
		{
			id: "logic",
			label: "Logic",
			show: !isStructuralField(field.fieldType) && !DECORATIVE_TYPES.has(field.fieldType),
		},
		{ id: "style", label: "Style", show: true },
		{
			id: "advanced",
			label: "Advanced",
			show: !DECORATIVE_TYPES.has(field.fieldType),
		},
	];

	return (
		<div
			style={{
				display: "flex",
				gap: 0,
				borderBottom: "1px solid var(--color-kumo-line)",
				overflowX: "auto",
				flexShrink: 0,
			}}
		>
			{tabs
				.filter((t) => t.show)
				.map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => onTabChange(tab.id)}
						style={{
							padding: "8px 12px",
							fontSize: "11px",
							fontWeight: activeTab === tab.id ? 700 : 500,
							color:
								activeTab === tab.id ? "var(--color-kumo-brand)" : "var(--text-color-kumo-subtle)",
							border: "none",
							borderBottom:
								activeTab === tab.id
									? "2px solid var(--color-kumo-brand)"
									: "2px solid transparent",
							background: "none",
							cursor: "pointer",
							whiteSpace: "nowrap",
							transition: "all 0.15s",
						}}
					>
						{tab.label}
					</button>
				))}
		</div>
	);
}

// =============================================================================
// General Settings Tab
// =============================================================================

function GeneralTab({
	field,
	onUpdate,
}: {
	field: CanvasField;
	onUpdate: (updates: Partial<CanvasField>) => void;
}) {
	return (
		<div style={{ padding: "12px 0" }}>
			<FieldGroup title="Basic Properties">
				<div style={panelSection}>
					<label style={panelLabel}>Field Label</label>
					<input
						type="text"
						value={field.label}
						onChange={(e) => onUpdate({ label: e.target.value })}
						style={panelInput}
					/>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>Field Name / Key</label>
					<input
						type="text"
						value={field.name}
						onChange={(e) =>
							onUpdate({
								name: e.target.value.replace(NAME_SANITIZE_RE, ""),
							})
						}
						style={panelInput}
					/>
					<p
						style={{
							fontSize: "10px",
							color: "var(--text-color-kumo-inactive)",
							marginTop: 2,
						}}
					>
						Used as the field key in submissions
					</p>
				</div>
				{!isStructuralField(field.fieldType) && (
					<>
						{!NO_PLACEHOLDER_TYPES.has(field.fieldType) && (
							<div style={panelSection}>
								<label style={panelLabel}>Placeholder</label>
								<input
									type="text"
									value={field.placeholder}
									onChange={(e) => onUpdate({ placeholder: e.target.value })}
									style={panelInput}
								/>
							</div>
						)}
						{field.fieldType !== "file" && (
							<div style={panelSection}>
								<label style={panelLabel}>Default Value</label>
								<input
									type="text"
									value={field.defaultValue}
									onChange={(e) => onUpdate({ defaultValue: e.target.value })}
									style={panelInput}
								/>
							</div>
						)}
						<div style={panelSection}>
							<label style={panelLabel}>Help Text</label>
							<input
								type="text"
								value={field.helpText}
								onChange={(e) => onUpdate({ helpText: e.target.value })}
								style={panelInput}
							/>
						</div>
						<div style={panelSection}>
							<label style={panelLabel}>Tooltip</label>
							<input
								type="text"
								value={field.tooltip}
								onChange={(e) => onUpdate({ tooltip: e.target.value })}
								style={panelInput}
							/>
						</div>
					</>
				)}
			</FieldGroup>

			{!DECORATIVE_TYPES.has(field.fieldType) && (
				<FieldGroup title="State">
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 8,
						}}
					>
						{!isStructuralField(field.fieldType) && (
							<label style={panelCheckLabel}>
								<input
									type="checkbox"
									checked={field.required}
									onChange={(e) => onUpdate({ required: e.target.checked })}
									style={{ accentColor: "var(--color-kumo-brand)" }}
								/>
								Required
							</label>
						)}
						{!isStructuralField(field.fieldType) && (
							<label style={panelCheckLabel}>
								<input
									type="checkbox"
									checked={field.readOnly}
									onChange={(e) => onUpdate({ readOnly: e.target.checked })}
									style={{ accentColor: "var(--color-kumo-brand)" }}
								/>
								Read Only
							</label>
						)}
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.disabled}
								onChange={(e) => onUpdate({ disabled: e.target.checked })}
								style={{ accentColor: "var(--color-kumo-brand)" }}
							/>
							Disabled
						</label>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.hidden}
								onChange={(e) => onUpdate({ hidden: e.target.checked })}
								style={{ accentColor: "var(--color-kumo-brand)" }}
							/>
							Hidden
						</label>
					</div>
				</FieldGroup>
			)}

			{!DECORATIVE_TYPES.has(field.fieldType) && (
				<FieldGroup title="Layout">
					{!NO_WIDTH_TYPES.has(field.fieldType) && (
						<div style={panelSection}>
							<label style={panelLabel}>Width</label>
							<div style={{ display: "flex", gap: 4 }}>
								{(
									[
										["full", "Full"],
										["half", "1/2"],
										["third", "1/3"],
										["quarter", "1/4"],
									] as [WidthOption, string][]
								).map(([val, lbl]) => (
									<button
										key={val}
										type="button"
										onClick={() => onUpdate({ width: val })}
										style={{
											flex: 1,
											padding: "5px 0",
											fontSize: "11px",
											fontWeight: field.width === val ? 700 : 500,
											border:
												field.width === val
													? "1px solid var(--color-kumo-brand)"
													: "1px solid var(--color-kumo-line)",
											borderRadius: 5,
											backgroundColor:
												field.width === val ? "var(--color-kumo-info-tint)" : "transparent",
											color:
												field.width === val
													? "var(--color-kumo-brand)"
													: "var(--text-color-kumo-subtle)",
											cursor: "pointer",
											transition: "all 0.15s",
										}}
									>
										{lbl}
									</button>
								))}
							</div>
						</div>
					)}
					{!isStructuralField(field.fieldType) && (
						<>
							<div style={panelSection}>
								<label style={panelLabel}>Label Position</label>
								<select
									value={field.labelPosition}
									onChange={(e) =>
										onUpdate({
											labelPosition: e.target.value as LabelPosition,
										})
									}
									style={panelInput}
								>
									<option value="top">Top</option>
									<option value="left">Left</option>
									<option value="right">Right</option>
									<option value="hidden">Hidden</option>
								</select>
							</div>
							<div style={panelSection}>
								<label style={panelLabel}>Description Position</label>
								<select
									value={field.descriptionPosition}
									onChange={(e) =>
										onUpdate({
											descriptionPosition: e.target.value as "below-label" | "below-input",
										})
									}
									style={panelInput}
								>
									<option value="below-input">Below Input</option>
									<option value="below-label">Below Label</option>
								</select>
							</div>
						</>
					)}
				</FieldGroup>
			)}

			<FieldGroup title="Identification" defaultOpen={false}>
				<div style={panelSection}>
					<label style={panelLabel}>CSS Class</label>
					<input
						type="text"
						value={field.cssClass}
						onChange={(e) => onUpdate({ cssClass: e.target.value })}
						style={panelInput}
						placeholder="e.g. my-custom-class"
					/>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>Custom ID Attribute</label>
					<input
						type="text"
						value={field.customId}
						onChange={(e) => onUpdate({ customId: e.target.value })}
						style={panelInput}
						placeholder="e.g. my-field-id"
					/>
				</div>
				{!DECORATIVE_TYPES.has(field.fieldType) && (
					<>
						<div style={panelSection}>
							<label style={panelLabel}>Icon Before</label>
							<input
								type="text"
								value={field.iconBefore}
								onChange={(e) => onUpdate({ iconBefore: e.target.value })}
								style={panelInput}
								placeholder="Icon name"
							/>
						</div>
						<div style={panelSection}>
							<label style={panelLabel}>Icon After</label>
							<input
								type="text"
								value={field.iconAfter}
								onChange={(e) => onUpdate({ iconAfter: e.target.value })}
								style={panelInput}
								placeholder="Icon name"
							/>
						</div>
					</>
				)}
			</FieldGroup>

			{/* Text-specific settings */}
			{isTextField(field.fieldType) && (
				<FieldGroup title="Text Settings" defaultOpen={false}>
					<div style={panelSection}>
						<label style={panelLabel}>Prefix</label>
						<input
							type="text"
							value={field.textConfig.prefix}
							onChange={(e) =>
								onUpdate({
									textConfig: {
										...field.textConfig,
										prefix: e.target.value,
									},
								})
							}
							style={panelInput}
						/>
					</div>
					<div style={panelSection}>
						<label style={panelLabel}>Suffix</label>
						<input
							type="text"
							value={field.textConfig.suffix}
							onChange={(e) =>
								onUpdate({
									textConfig: {
										...field.textConfig,
										suffix: e.target.value,
									},
								})
							}
							style={panelInput}
						/>
					</div>
					{field.fieldType === "textarea" && (
						<>
							<div style={panelSection}>
								<label style={panelLabel}>Rows</label>
								<input
									type="number"
									value={field.textConfig.rows}
									onChange={(e) =>
										onUpdate({
											textConfig: {
												...field.textConfig,
												rows: parseInt(e.target.value) || 4,
											},
										})
									}
									min={1}
									max={20}
									style={panelInput}
								/>
							</div>
							<label style={panelCheckLabel}>
								<input
									type="checkbox"
									checked={field.textConfig.resizable}
									onChange={(e) =>
										onUpdate({
											textConfig: {
												...field.textConfig,
												resizable: e.target.checked,
											},
										})
									}
									style={{
										accentColor: "var(--color-kumo-brand)",
									}}
								/>
								Resizable
							</label>
						</>
					)}
					<div style={{ marginTop: 8 }}>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.textConfig.showCharCount}
								onChange={(e) =>
									onUpdate({
										textConfig: {
											...field.textConfig,
											showCharCount: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Show Character Counter
						</label>
					</div>
					{field.fieldType === "password" && (
						<div style={{ marginTop: 8 }}>
							<label style={panelCheckLabel}>
								<input
									type="checkbox"
									checked={field.textConfig.showPasswordToggle}
									onChange={(e) =>
										onUpdate({
											textConfig: {
												...field.textConfig,
												showPasswordToggle: e.target.checked,
											},
										})
									}
									style={{
										accentColor: "var(--color-kumo-brand)",
									}}
								/>
								Show/Hide Password Toggle
							</label>
							<label style={{ ...panelCheckLabel, marginTop: 8 }}>
								<input
									type="checkbox"
									checked={field.textConfig.passwordStrengthMeter}
									onChange={(e) =>
										onUpdate({
											textConfig: {
												...field.textConfig,
												passwordStrengthMeter: e.target.checked,
											},
										})
									}
									style={{
										accentColor: "var(--color-kumo-brand)",
									}}
								/>
								Password Strength Meter
							</label>
						</div>
					)}
				</FieldGroup>
			)}

			{/* File-specific settings */}
			{isFileField(field.fieldType) && (
				<FieldGroup title="File Upload Settings" defaultOpen={false}>
					<div style={panelSection}>
						<label style={panelLabel}>Allowed File Types</label>
						<input
							type="text"
							value={field.fileConfig.allowedTypes}
							onChange={(e) =>
								onUpdate({
									fileConfig: {
										...field.fileConfig,
										allowedTypes: e.target.value,
									},
								})
							}
							style={panelInput}
							placeholder="e.g. .jpg,.png,.pdf"
						/>
					</div>
					<div style={panelSection}>
						<label style={panelLabel}>Max File Size (MB)</label>
						<input
							type="number"
							value={field.fileConfig.maxSizeMb}
							onChange={(e) =>
								onUpdate({
									fileConfig: {
										...field.fileConfig,
										maxSizeMb: parseInt(e.target.value) || 10,
									},
								})
							}
							min={1}
							style={panelInput}
						/>
					</div>
					<div style={panelSection}>
						<label style={panelLabel}>Max Number of Files</label>
						<input
							type="number"
							value={field.fileConfig.maxFiles}
							onChange={(e) =>
								onUpdate({
									fileConfig: {
										...field.fileConfig,
										maxFiles: parseInt(e.target.value) || 1,
									},
								})
							}
							min={1}
							style={panelInput}
						/>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 8,
						}}
					>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.fileConfig.multiple}
								onChange={(e) =>
									onUpdate({
										fileConfig: {
											...field.fileConfig,
											multiple: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Allow Multiple Files
						</label>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.fileConfig.showPreview}
								onChange={(e) =>
									onUpdate({
										fileConfig: {
											...field.fileConfig,
											showPreview: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Show File Preview
						</label>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.fileConfig.dragDropArea}
								onChange={(e) =>
									onUpdate({
										fileConfig: {
											...field.fileConfig,
											dragDropArea: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Drag & Drop Upload Area
						</label>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.fileConfig.showProgressBar}
								onChange={(e) =>
									onUpdate({
										fileConfig: {
											...field.fileConfig,
											showProgressBar: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Show Progress Bar
						</label>
					</div>
				</FieldGroup>
			)}

			{/* Multiselect-specific settings */}
			{field.fieldType === "multiselect" && (
				<FieldGroup title="Multiselect Settings" defaultOpen={false}>
					<div style={panelSection}>
						<label style={panelLabel}>Max Selections (0 = unlimited)</label>
						<input
							type="number"
							value={field.multiselectConfig.maxSelections}
							onChange={(e) =>
								onUpdate({
									multiselectConfig: {
										...field.multiselectConfig,
										maxSelections: parseInt(e.target.value) || 0,
									},
								})
							}
							min={0}
							style={panelInput}
						/>
						<p
							style={{
								fontSize: "10px",
								color: "var(--text-color-kumo-inactive)",
								marginTop: 2,
							}}
						>
							Limit how many options a user can select
						</p>
					</div>
				</FieldGroup>
			)}

			{/* Date-specific settings */}
			{isDateField(field.fieldType) && (
				<FieldGroup title="Date Settings" defaultOpen={false}>
					<div style={panelSection}>
						<label style={panelLabel}>Date Format</label>
						<select
							value={field.dateConfig.dateFormat}
							onChange={(e) =>
								onUpdate({
									dateConfig: {
										...field.dateConfig,
										dateFormat: e.target.value,
									},
								})
							}
							style={panelInput}
						>
							<option value="YYYY-MM-DD">YYYY-MM-DD</option>
							<option value="MM/DD/YYYY">MM/DD/YYYY</option>
							<option value="DD/MM/YYYY">DD/MM/YYYY</option>
							<option value="DD.MM.YYYY">DD.MM.YYYY</option>
						</select>
					</div>
					<div style={panelSection}>
						<label style={panelLabel}>Min Date</label>
						<input
							type="date"
							value={field.dateConfig.minDate}
							onChange={(e) =>
								onUpdate({
									dateConfig: {
										...field.dateConfig,
										minDate: e.target.value,
									},
								})
							}
							style={panelInput}
						/>
					</div>
					<div style={panelSection}>
						<label style={panelLabel}>Max Date</label>
						<input
							type="date"
							value={field.dateConfig.maxDate}
							onChange={(e) =>
								onUpdate({
									dateConfig: {
										...field.dateConfig,
										maxDate: e.target.value,
									},
								})
							}
							style={panelInput}
						/>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 8,
						}}
					>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.dateConfig.disablePast}
								onChange={(e) =>
									onUpdate({
										dateConfig: {
											...field.dateConfig,
											disablePast: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Disable Past Dates
						</label>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.dateConfig.disableFuture}
								onChange={(e) =>
									onUpdate({
										dateConfig: {
											...field.dateConfig,
											disableFuture: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Disable Future Dates
						</label>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.dateConfig.disableWeekends}
								onChange={(e) =>
									onUpdate({
										dateConfig: {
											...field.dateConfig,
											disableWeekends: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Disable Weekends
						</label>
					</div>
				</FieldGroup>
			)}

			{/* Number-specific settings */}
			{isNumberField(field.fieldType) && (
				<FieldGroup title="Number Settings" defaultOpen={false}>
					<div style={panelSection}>
						<label style={panelLabel}>Step</label>
						<input
							type="number"
							value={field.numberConfig.step}
							onChange={(e) =>
								onUpdate({
									numberConfig: {
										...field.numberConfig,
										step: parseFloat(e.target.value) || 1,
									},
								})
							}
							min={0.01}
							step={0.01}
							style={panelInput}
						/>
					</div>
					<div style={panelSection}>
						<label style={panelLabel}>Decimal Precision</label>
						<input
							type="number"
							value={field.numberConfig.decimalPrecision}
							onChange={(e) =>
								onUpdate({
									numberConfig: {
										...field.numberConfig,
										decimalPrecision: parseInt(e.target.value) || 0,
									},
								})
							}
							min={0}
							max={10}
							style={panelInput}
						/>
					</div>
					<div style={panelSection}>
						<label style={panelLabel}>Currency Symbol</label>
						<input
							type="text"
							value={field.numberConfig.currency}
							onChange={(e) =>
								onUpdate({
									numberConfig: {
										...field.numberConfig,
										currency: e.target.value,
									},
								})
							}
							style={panelInput}
							placeholder="e.g. $, â‚¬, Â£"
						/>
					</div>
					<div style={panelSection}>
						<label style={panelLabel}>Formula / Calculation</label>
						<input
							type="text"
							value={field.numberConfig.formulaExpression}
							onChange={(e) =>
								onUpdate({
									numberConfig: {
										...field.numberConfig,
										formulaExpression: e.target.value,
									},
								})
							}
							style={panelInput}
							placeholder="e.g. {price} * {quantity}"
						/>
						<p
							style={{
								fontSize: "10px",
								color: "var(--text-color-kumo-inactive)",
								marginTop: 2,
							}}
						>
							Reference other fields with {"{field_name}"}
						</p>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 8,
						}}
					>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.numberConfig.showThousandSeparator}
								onChange={(e) =>
									onUpdate({
										numberConfig: {
											...field.numberConfig,
											showThousandSeparator: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Thousand Separator
						</label>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.numberConfig.allowNegative}
								onChange={(e) =>
									onUpdate({
										numberConfig: {
											...field.numberConfig,
											allowNegative: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Allow Negative Values
						</label>
					</div>
				</FieldGroup>
			)}

			{/* Rating-specific settings */}
			{isRatingField(field.fieldType) && (
				<FieldGroup title="Rating Settings" defaultOpen={false}>
					<div style={panelSection}>
						<label style={panelLabel}>Max Rating</label>
						<input
							type="number"
							value={field.ratingConfig.maxRating}
							onChange={(e) =>
								onUpdate({
									ratingConfig: {
										...field.ratingConfig,
										maxRating: parseInt(e.target.value) || 5,
									},
								})
							}
							min={2}
							max={10}
							style={panelInput}
						/>
					</div>
					<div style={panelSection}>
						<label style={panelLabel}>Icon Type</label>
						<select
							value={field.ratingConfig.iconType}
							onChange={(e) =>
								onUpdate({
									ratingConfig: {
										...field.ratingConfig,
										iconType: e.target.value as RatingFieldConfig["iconType"],
									},
								})
							}
							style={panelInput}
						>
							<option value="star">Stars</option>
							<option value="heart">Hearts</option>
							<option value="emoji">Emoji</option>
							<option value="number">Numbers</option>
						</select>
					</div>
					<label style={panelCheckLabel}>
						<input
							type="checkbox"
							checked={field.ratingConfig.allowHalf}
							onChange={(e) =>
								onUpdate({
									ratingConfig: {
										...field.ratingConfig,
										allowHalf: e.target.checked,
									},
								})
							}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						Allow Half Ratings
					</label>
				</FieldGroup>
			)}

			{/* Step-specific settings */}
			{isStepField(field.fieldType) && (
				<FieldGroup title="Step Settings">
					<div style={panelSection}>
						<label style={panelLabel}>Description</label>
						<input
							type="text"
							value={field.stepConfig.description}
							onChange={(e) =>
								onUpdate({
									stepConfig: {
										...field.stepConfig,
										description: e.target.value,
									},
								})
							}
							style={panelInput}
							placeholder="Step description text"
						/>
					</div>
					<div style={panelSection}>
						<label style={panelLabel}>Next Button Label</label>
						<input
							type="text"
							value={field.stepConfig.nextButtonLabel}
							onChange={(e) =>
								onUpdate({
									stepConfig: {
										...field.stepConfig,
										nextButtonLabel: e.target.value,
									},
								})
							}
							style={panelInput}
							placeholder="Next"
						/>
					</div>
					<div style={panelSection}>
						<label style={panelLabel}>Previous Button Label</label>
						<input
							type="text"
							value={field.stepConfig.prevButtonLabel}
							onChange={(e) =>
								onUpdate({
									stepConfig: {
										...field.stepConfig,
										prevButtonLabel: e.target.value,
									},
								})
							}
							style={panelInput}
							placeholder="Previous"
						/>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 8,
						}}
					>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.stepConfig.showStepNumber}
								onChange={(e) =>
									onUpdate({
										stepConfig: {
											...field.stepConfig,
											showStepNumber: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Show Step Number
						</label>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.stepConfig.showStepTitle}
								onChange={(e) =>
									onUpdate({
										stepConfig: {
											...field.stepConfig,
											showStepTitle: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Show Step Title
						</label>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.stepConfig.showProgressBar}
								onChange={(e) =>
									onUpdate({
										stepConfig: {
											...field.stepConfig,
											showProgressBar: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Show Progress Bar
						</label>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.stepConfig.collapsible}
								onChange={(e) =>
									onUpdate({
										stepConfig: {
											...field.stepConfig,
											collapsible: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Collapsible
						</label>
						{field.stepConfig.collapsible && (
							<label style={panelCheckLabel}>
								<input
									type="checkbox"
									checked={field.stepConfig.initiallyCollapsed}
									onChange={(e) =>
										onUpdate({
											stepConfig: {
												...field.stepConfig,
												initiallyCollapsed: e.target.checked,
											},
										})
									}
									style={{
										accentColor: "var(--color-kumo-brand)",
									}}
								/>
								Initially Collapsed
							</label>
						)}
					</div>
				</FieldGroup>
			)}

			{/* Group-specific settings */}
			{isGroupField(field.fieldType) && (
				<FieldGroup title="Group Settings">
					<div style={panelSection}>
						<label style={panelLabel}>Description</label>
						<input
							type="text"
							value={field.groupConfig.description}
							onChange={(e) =>
								onUpdate({
									groupConfig: {
										...field.groupConfig,
										description: e.target.value,
									},
								})
							}
							style={panelInput}
							placeholder="Group description text"
						/>
					</div>
					<div style={panelSection}>
						<label style={panelLabel}>Columns</label>
						<div style={{ display: "flex", gap: 4 }}>
							{([1, 2, 3] as const).map((val) => (
								<button
									key={val}
									type="button"
									onClick={() =>
										onUpdate({
											groupConfig: {
												...field.groupConfig,
												columns: val,
											},
										})
									}
									style={{
										flex: 1,
										padding: "5px 0",
										fontSize: "11px",
										fontWeight: field.groupConfig.columns === val ? 700 : 500,
										border:
											field.groupConfig.columns === val
												? "1px solid var(--color-kumo-brand)"
												: "1px solid var(--color-kumo-line)",
										borderRadius: 5,
										backgroundColor:
											field.groupConfig.columns === val
												? "var(--color-kumo-info-tint)"
												: "transparent",
										color:
											field.groupConfig.columns === val
												? "var(--color-kumo-brand)"
												: "var(--text-color-kumo-subtle)",
										cursor: "pointer",
										transition: "all 0.15s",
									}}
								>
									{val}
								</button>
							))}
						</div>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 8,
						}}
					>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.groupConfig.showBorder}
								onChange={(e) =>
									onUpdate({
										groupConfig: {
											...field.groupConfig,
											showBorder: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Show Border
						</label>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.groupConfig.showTitle}
								onChange={(e) =>
									onUpdate({
										groupConfig: {
											...field.groupConfig,
											showTitle: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Show Title
						</label>
						<label style={panelCheckLabel}>
							<input
								type="checkbox"
								checked={field.groupConfig.collapsible}
								onChange={(e) =>
									onUpdate({
										groupConfig: {
											...field.groupConfig,
											collapsible: e.target.checked,
										},
									})
								}
								style={{
									accentColor: "var(--color-kumo-brand)",
								}}
							/>
							Collapsible
						</label>
						{field.groupConfig.collapsible && (
							<label style={panelCheckLabel}>
								<input
									type="checkbox"
									checked={field.groupConfig.initiallyCollapsed}
									onChange={(e) =>
										onUpdate({
											groupConfig: {
												...field.groupConfig,
												initiallyCollapsed: e.target.checked,
											},
										})
									}
									style={{
										accentColor: "var(--color-kumo-brand)",
									}}
								/>
								Initially Collapsed
							</label>
						)}
					</div>
				</FieldGroup>
			)}
		</div>
	);
}

// Need to import the type
type RatingFieldConfig = CanvasField["ratingConfig"];

// =============================================================================
// Validation Settings Tab
// =============================================================================

function ValidationTab({
	field,
	onUpdate,
}: {
	field: CanvasField;
	onUpdate: (updates: Partial<CanvasField>) => void;
}) {
	const updateValidation = (updates: Partial<FieldValidationConfig>) => {
		onUpdate({ validation: { ...field.validation, ...updates } });
	};

	return (
		<div style={{ padding: "12px 0" }}>
			<FieldGroup title="Required">
				<label style={panelCheckLabel}>
					<input
						type="checkbox"
						checked={field.required}
						onChange={(e) => onUpdate({ required: e.target.checked })}
						style={{ accentColor: "var(--color-kumo-brand)" }}
					/>
					Field is required
				</label>
				{field.required && (
					<div style={{ ...panelSection, marginTop: 8 }}>
						<label style={panelLabel}>Required Error Message</label>
						<input
							type="text"
							value={field.validation.requiredMessage}
							onChange={(e) =>
								updateValidation({
									requiredMessage: e.target.value,
								})
							}
							style={panelInput}
							placeholder="This field is required"
						/>
					</div>
				)}
			</FieldGroup>

			<FieldGroup title="Length Constraints">
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 8,
					}}
				>
					<div>
						<label style={panelLabel}>Min Length</label>
						<input
							type="number"
							value={field.validation.minLength ?? ""}
							onChange={(e) =>
								updateValidation({
									minLength: e.target.value ? parseInt(e.target.value) : undefined,
								})
							}
							min={0}
							style={panelInput}
						/>
					</div>
					<div>
						<label style={panelLabel}>Max Length</label>
						<input
							type="number"
							value={field.validation.maxLength ?? ""}
							onChange={(e) =>
								updateValidation({
									maxLength: e.target.value ? parseInt(e.target.value) : undefined,
								})
							}
							min={0}
							style={panelInput}
						/>
					</div>
				</div>
			</FieldGroup>

			<FieldGroup title="Value Constraints">
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 8,
					}}
				>
					<div>
						<label style={panelLabel}>Min Value</label>
						<input
							type="number"
							value={field.validation.minValue ?? ""}
							onChange={(e) =>
								updateValidation({
									minValue: e.target.value ? parseFloat(e.target.value) : undefined,
								})
							}
							style={panelInput}
						/>
					</div>
					<div>
						<label style={panelLabel}>Max Value</label>
						<input
							type="number"
							value={field.validation.maxValue ?? ""}
							onChange={(e) =>
								updateValidation({
									maxValue: e.target.value ? parseFloat(e.target.value) : undefined,
								})
							}
							style={panelInput}
						/>
					</div>
				</div>
			</FieldGroup>

			<FieldGroup title="Pattern">
				<div style={panelSection}>
					<label style={panelLabel}>Regex Pattern</label>
					<input
						type="text"
						value={field.validation.pattern ?? ""}
						onChange={(e) =>
							updateValidation({
								pattern: e.target.value || undefined,
							})
						}
						style={panelInput}
						placeholder="e.g. ^[A-Z].*"
					/>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>Pattern Error Message</label>
					<input
						type="text"
						value={field.validation.patternMessage ?? ""}
						onChange={(e) =>
							updateValidation({
								patternMessage: e.target.value || undefined,
							})
						}
						style={panelInput}
						placeholder="Invalid format"
					/>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>Input Mask</label>
					<input
						type="text"
						value={field.validation.inputMask ?? ""}
						onChange={(e) =>
							updateValidation({
								inputMask: e.target.value || undefined,
							})
						}
						style={panelInput}
						placeholder="e.g. (999) 999-9999"
					/>
				</div>
			</FieldGroup>

			<FieldGroup title="Format Validation">
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 8,
					}}
				>
					<label style={panelCheckLabel}>
						<input
							type="checkbox"
							checked={field.validation.emailValidation}
							onChange={(e) =>
								updateValidation({
									emailValidation: e.target.checked,
								})
							}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						Email Validation
					</label>
					<label style={panelCheckLabel}>
						<input
							type="checkbox"
							checked={field.validation.phoneValidation}
							onChange={(e) =>
								updateValidation({
									phoneValidation: e.target.checked,
								})
							}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						Phone Validation
					</label>
					<label style={panelCheckLabel}>
						<input
							type="checkbox"
							checked={field.validation.urlValidation}
							onChange={(e) =>
								updateValidation({
									urlValidation: e.target.checked,
								})
							}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						URL Validation
					</label>
					<label style={panelCheckLabel}>
						<input
							type="checkbox"
							checked={field.validation.numericOnly}
							onChange={(e) =>
								updateValidation({
									numericOnly: e.target.checked,
								})
							}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						Numeric Only
					</label>
					<label style={panelCheckLabel}>
						<input
							type="checkbox"
							checked={field.validation.integerOnly}
							onChange={(e) =>
								updateValidation({
									integerOnly: e.target.checked,
								})
							}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						Integer Only
					</label>
					<label style={panelCheckLabel}>
						<input
							type="checkbox"
							checked={field.validation.trimInput}
							onChange={(e) =>
								updateValidation({
									trimInput: e.target.checked,
								})
							}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						Trim Whitespace
					</label>
				</div>
			</FieldGroup>

			<FieldGroup title="Custom Error">
				<div style={panelSection}>
					<label style={panelLabel}>Custom Error Message</label>
					<input
						type="text"
						value={field.validation.customErrorMessage}
						onChange={(e) =>
							updateValidation({
								customErrorMessage: e.target.value,
							})
						}
						style={panelInput}
						placeholder="Enter a custom error message"
					/>
				</div>
			</FieldGroup>
		</div>
	);
}

// =============================================================================
// Options Settings Tab (for choice fields)
// =============================================================================

function OptionsTab({
	field,
	onUpdate,
}: {
	field: CanvasField;
	onUpdate: (updates: Partial<CanvasField>) => void;
}) {
	const addOption = () => {
		const newId = `opt_${Date.now()}`;
		const num = field.options.length + 1;
		const newOpt: FieldOption = {
			id: newId,
			label: `Option ${num}`,
			value: `option_${num}`,
		};
		onUpdate({ options: [...field.options, newOpt] });
	};

	const removeOption = (optId: string) => {
		onUpdate({
			options: field.options.filter((o) => o.id !== optId),
		});
	};

	const updateOption = (optId: string, updates: Partial<FieldOption>) => {
		onUpdate({
			options: field.options.map((o) => (o.id === optId ? { ...o, ...updates } : o)),
		});
	};

	const moveOption = (fromIdx: number, toIdx: number) => {
		const next = [...field.options];
		const [moved] = next.splice(fromIdx, 1);
		if (moved) {
			next.splice(toIdx, 0, moved);
			onUpdate({ options: next });
		}
	};

	return (
		<div style={{ padding: "12px 0" }}>
			<FieldGroup title="Options List">
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 6,
					}}
				>
					{field.options.map((opt, idx) => (
						<div
							key={opt.id}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 4,
								padding: "4px 6px",
								borderRadius: 6,
								backgroundColor: "var(--color-kumo-tint)",
							}}
						>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 1,
								}}
							>
								<button
									type="button"
									onClick={() => idx > 0 && moveOption(idx, idx - 1)}
									disabled={idx === 0}
									style={{
										background: "none",
										border: "none",
										cursor: idx > 0 ? "pointer" : "not-allowed",
										padding: 0,
										color: "var(--text-color-kumo-inactive)",
										opacity: idx === 0 ? 0.3 : 1,
									}}
								>
									<ArrowUp className="h-3 w-3" />
								</button>
								<button
									type="button"
									onClick={() => idx < field.options.length - 1 && moveOption(idx, idx + 1)}
									disabled={idx === field.options.length - 1}
									style={{
										background: "none",
										border: "none",
										cursor: idx < field.options.length - 1 ? "pointer" : "not-allowed",
										padding: 0,
										color: "var(--text-color-kumo-inactive)",
										opacity: idx === field.options.length - 1 ? 0.3 : 1,
									}}
								>
									<ArrowDown className="h-3 w-3" />
								</button>
							</div>
							<input
								type="text"
								value={opt.label}
								onChange={(e) =>
									updateOption(opt.id, {
										label: e.target.value,
									})
								}
								style={{
									...panelInput,
									flex: 1,
									fontSize: "11px",
									padding: "4px 6px",
								}}
								placeholder="Label"
							/>
							<input
								type="text"
								value={opt.value}
								onChange={(e) =>
									updateOption(opt.id, {
										value: e.target.value,
									})
								}
								style={{
									...panelInput,
									width: 80,
									fontSize: "11px",
									padding: "4px 6px",
								}}
								placeholder="Value"
							/>
							<button
								type="button"
								onClick={() => removeOption(opt.id)}
								style={{
									background: "none",
									border: "none",
									cursor: "pointer",
									padding: 2,
									color: "var(--color-kumo-danger)",
								}}
							>
								<X className="h-3 w-3" />
							</button>
						</div>
					))}
				</div>
				<button
					type="button"
					onClick={addOption}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 4,
						marginTop: 8,
						padding: "6px 10px",
						fontSize: "11px",
						fontWeight: 600,
						color: "var(--color-kumo-brand)",
						backgroundColor: "var(--color-kumo-info-tint)",
						border: "1px dashed var(--color-kumo-brand)",
						borderRadius: 6,
						cursor: "pointer",
						width: "100%",
						justifyContent: "center",
					}}
				>
					<Plus className="h-3 w-3" />
					Add Option
				</button>
			</FieldGroup>

			<FieldGroup title="Default Selection" defaultOpen={false}>
				<div style={panelSection}>
					<label style={panelLabel}>Default Selected Value</label>
					<select
						value={field.defaultValue}
						onChange={(e) => onUpdate({ defaultValue: e.target.value })}
						style={panelInput}
					>
						<option value="">None</option>
						{field.options.map((opt) => (
							<option key={opt.id} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>
			</FieldGroup>
		</div>
	);
}

// =============================================================================
// Style Settings Tab
// =============================================================================

function StyleTab({
	field,
	onUpdate,
}: {
	field: CanvasField;
	onUpdate: (updates: Partial<CanvasField>) => void;
}) {
	const updateStyle = (updates: Partial<FieldStyleConfig>) => {
		onUpdate({ style: { ...field.style, ...updates } });
	};

	return (
		<div style={{ padding: "12px 0" }}>
			<FieldGroup title="Spacing">
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 8,
					}}
				>
					<div>
						<label style={panelLabel}>Margin Top</label>
						<input
							type="text"
							value={field.style.marginTop}
							onChange={(e) => updateStyle({ marginTop: e.target.value })}
							style={panelInput}
							placeholder="e.g. 8px"
						/>
					</div>
					<div>
						<label style={panelLabel}>Margin Bottom</label>
						<input
							type="text"
							value={field.style.marginBottom}
							onChange={(e) => updateStyle({ marginBottom: e.target.value })}
							style={panelInput}
							placeholder="e.g. 8px"
						/>
					</div>
				</div>
				<div style={{ ...panelSection, marginTop: 8 }}>
					<label style={panelLabel}>Padding</label>
					<input
						type="text"
						value={field.style.padding}
						onChange={(e) => updateStyle({ padding: e.target.value })}
						style={panelInput}
						placeholder="e.g. 8px 12px"
					/>
				</div>
			</FieldGroup>

			<FieldGroup title="Appearance">
				<div style={panelSection}>
					<label style={panelLabel}>Border Radius</label>
					<input
						type="text"
						value={field.style.borderRadius}
						onChange={(e) => updateStyle({ borderRadius: e.target.value })}
						style={panelInput}
						placeholder="e.g. 6px"
					/>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>Border Style</label>
					<select
						value={field.style.borderStyle}
						onChange={(e) => updateStyle({ borderStyle: e.target.value })}
						style={panelInput}
					>
						<option value="">Default</option>
						<option value="solid">Solid</option>
						<option value="dashed">Dashed</option>
						<option value="dotted">Dotted</option>
						<option value="none">None</option>
					</select>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>Background Color</label>
					<div style={{ display: "flex", gap: 6, alignItems: "center" }}>
						<input
							type="color"
							value={field.style.backgroundColor || "#ffffff"}
							onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
							style={{
								width: 32,
								height: 32,
								padding: 2,
								border: "1px solid var(--color-kumo-line)",
								borderRadius: 6,
								cursor: "pointer",
							}}
						/>
						<input
							type="text"
							value={field.style.backgroundColor}
							onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
							style={{ ...panelInput, flex: 1 }}
							placeholder="#ffffff"
						/>
					</div>
				</div>
			</FieldGroup>

			{!isStructuralField(field.fieldType) && (
				<>
					<FieldGroup title="Label Typography">
						<div style={panelSection}>
							<label style={panelLabel}>Label Font Size</label>
							<input
								type="text"
								value={field.style.labelFontSize}
								onChange={(e) => updateStyle({ labelFontSize: e.target.value })}
								style={panelInput}
								placeholder="e.g. 14px"
							/>
						</div>
						<div style={panelSection}>
							<label style={panelLabel}>Label Font Weight</label>
							<select
								value={field.style.labelFontWeight}
								onChange={(e) => updateStyle({ labelFontWeight: e.target.value })}
								style={panelInput}
							>
								<option value="">Default</option>
								<option value="400">Normal (400)</option>
								<option value="500">Medium (500)</option>
								<option value="600">Semi-Bold (600)</option>
								<option value="700">Bold (700)</option>
							</select>
						</div>
					</FieldGroup>

					<FieldGroup title="Input Styling">
						<div style={panelSection}>
							<label style={panelLabel}>Input Font Size</label>
							<input
								type="text"
								value={field.style.inputFontSize}
								onChange={(e) => updateStyle({ inputFontSize: e.target.value })}
								style={panelInput}
								placeholder="e.g. 14px"
							/>
						</div>
						<div style={panelSection}>
							<label style={panelLabel}>Placeholder Color</label>
							<div style={{ display: "flex", gap: 6, alignItems: "center" }}>
								<input
									type="color"
									value={field.style.placeholderColor || "#999999"}
									onChange={(e) => updateStyle({ placeholderColor: e.target.value })}
									style={{
										width: 32,
										height: 32,
										padding: 2,
										border: "1px solid var(--color-kumo-line)",
										borderRadius: 6,
										cursor: "pointer",
									}}
								/>
								<input
									type="text"
									value={field.style.placeholderColor}
									onChange={(e) => updateStyle({ placeholderColor: e.target.value })}
									style={{ ...panelInput, flex: 1 }}
									placeholder="#999999"
								/>
							</div>
						</div>
						<div style={panelSection}>
							<label style={panelLabel}>Focus Border Color</label>
							<div style={{ display: "flex", gap: 6, alignItems: "center" }}>
								<input
									type="color"
									value={field.style.focusBorderColor || "#3b82f6"}
									onChange={(e) => updateStyle({ focusBorderColor: e.target.value })}
									style={{
										width: 32,
										height: 32,
										padding: 2,
										border: "1px solid var(--color-kumo-line)",
										borderRadius: 6,
										cursor: "pointer",
									}}
								/>
								<input
									type="text"
									value={field.style.focusBorderColor}
									onChange={(e) => updateStyle({ focusBorderColor: e.target.value })}
									style={{ ...panelInput, flex: 1 }}
									placeholder="#3b82f6"
								/>
							</div>
						</div>
						<div style={panelSection}>
							<label style={panelLabel}>Error Border Color</label>
							<div style={{ display: "flex", gap: 6, alignItems: "center" }}>
								<input
									type="color"
									value={field.style.errorBorderColor || "#ef4444"}
									onChange={(e) => updateStyle({ errorBorderColor: e.target.value })}
									style={{
										width: 32,
										height: 32,
										padding: 2,
										border: "1px solid var(--color-kumo-line)",
										borderRadius: 6,
										cursor: "pointer",
									}}
								/>
								<input
									type="text"
									value={field.style.errorBorderColor}
									onChange={(e) => updateStyle({ errorBorderColor: e.target.value })}
									style={{ ...panelInput, flex: 1 }}
									placeholder="#ef4444"
								/>
							</div>
						</div>
					</FieldGroup>
				</>
			)}
		</div>
	);
}

// =============================================================================
// Advanced Settings Tab
// =============================================================================

function AdvancedTab({
	field,
	onUpdate,
}: {
	field: CanvasField;
	onUpdate: (updates: Partial<CanvasField>) => void;
}) {
	const updateAdvanced = (updates: Partial<FieldAdvancedConfig>) => {
		onUpdate({ advanced: { ...field.advanced, ...updates } });
	};

	return (
		<div style={{ padding: "12px 0" }}>
			<FieldGroup title="Data Mapping">
				<div style={panelSection}>
					<label style={panelLabel}>Database Key</label>
					<input
						type="text"
						value={field.advanced.databaseKey}
						onChange={(e) => updateAdvanced({ databaseKey: e.target.value })}
						style={panelInput}
						placeholder="Custom database column name"
					/>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>API Mapping Key</label>
					<input
						type="text"
						value={field.advanced.apiMappingKey}
						onChange={(e) => updateAdvanced({ apiMappingKey: e.target.value })}
						style={panelInput}
						placeholder="Key for API integrations"
					/>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>Export Label</label>
					<input
						type="text"
						value={field.advanced.exportLabel}
						onChange={(e) => updateAdvanced({ exportLabel: e.target.value })}
						style={panelInput}
						placeholder="Label used in exports"
					/>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>Custom Meta Key</label>
					<input
						type="text"
						value={field.advanced.customMetaKey}
						onChange={(e) => updateAdvanced({ customMetaKey: e.target.value })}
						style={panelInput}
						placeholder="Custom metadata key"
					/>
				</div>
			</FieldGroup>

			<FieldGroup title="Accessibility">
				<div style={panelSection}>
					<label style={panelLabel}>ARIA Label</label>
					<input
						type="text"
						value={field.advanced.ariaLabel}
						onChange={(e) => updateAdvanced({ ariaLabel: e.target.value })}
						style={panelInput}
						placeholder="Accessible label"
					/>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>ARIA Described By</label>
					<input
						type="text"
						value={field.advanced.ariaDescribedBy}
						onChange={(e) => updateAdvanced({ ariaDescribedBy: e.target.value })}
						style={panelInput}
						placeholder="ID of describing element"
					/>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>Tab Index</label>
					<input
						type="number"
						value={field.advanced.tabIndex ?? ""}
						onChange={(e) =>
							updateAdvanced({
								tabIndex: e.target.value ? parseInt(e.target.value) : undefined,
							})
						}
						style={panelInput}
						placeholder="Auto"
					/>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>Autocomplete</label>
					<input
						type="text"
						value={field.advanced.autocomplete}
						onChange={(e) => updateAdvanced({ autocomplete: e.target.value })}
						style={panelInput}
						placeholder="e.g. email, name, tel"
					/>
				</div>
			</FieldGroup>

			<FieldGroup title="Output">
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 8,
					}}
				>
					<label style={panelCheckLabel}>
						<input
							type="checkbox"
							checked={field.advanced.includeInEmail}
							onChange={(e) => updateAdvanced({ includeInEmail: e.target.checked })}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						Include in Email Notifications
					</label>
					<label style={panelCheckLabel}>
						<input
							type="checkbox"
							checked={field.advanced.includeInExport}
							onChange={(e) => updateAdvanced({ includeInExport: e.target.checked })}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						Include in Data Export
					</label>
					<label style={panelCheckLabel}>
						<input
							type="checkbox"
							checked={field.advanced.includeInPdf}
							onChange={(e) => updateAdvanced({ includeInPdf: e.target.checked })}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						Include in PDF Export
					</label>
				</div>
			</FieldGroup>

			<FieldGroup title="Security">
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 8,
					}}
				>
					<label style={panelCheckLabel}>
						<input
							type="checkbox"
							checked={field.advanced.sanitizeInput}
							onChange={(e) => updateAdvanced({ sanitizeInput: e.target.checked })}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						Sanitize Input
					</label>
					<label style={panelCheckLabel}>
						<input
							type="checkbox"
							checked={field.advanced.encryptField}
							onChange={(e) => updateAdvanced({ encryptField: e.target.checked })}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						Encrypt Field Data
					</label>
					<label style={panelCheckLabel}>
						<input
							type="checkbox"
							checked={field.advanced.doNotStore}
							onChange={(e) => updateAdvanced({ doNotStore: e.target.checked })}
							style={{ accentColor: "var(--color-kumo-brand)" }}
						/>
						Do Not Store (transient)
					</label>
				</div>
			</FieldGroup>

			<FieldGroup title="Event Hooks" defaultOpen={false}>
				<div style={panelSection}>
					<label style={panelLabel}>On Change Action</label>
					<input
						type="text"
						value={field.advanced.onChangeAction}
						onChange={(e) => updateAdvanced({ onChangeAction: e.target.value })}
						style={panelInput}
						placeholder="Action name on value change"
					/>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>On Focus Action</label>
					<input
						type="text"
						value={field.advanced.onFocusAction}
						onChange={(e) => updateAdvanced({ onFocusAction: e.target.value })}
						style={panelInput}
						placeholder="Action name on focus"
					/>
				</div>
				<div style={panelSection}>
					<label style={panelLabel}>On Blur Action</label>
					<input
						type="text"
						value={field.advanced.onBlurAction}
						onChange={(e) => updateAdvanced({ onBlurAction: e.target.value })}
						style={panelInput}
						placeholder="Action name on blur"
					/>
				</div>
			</FieldGroup>
		</div>
	);
}

// =============================================================================
// Main Settings Panel
// =============================================================================

export function FieldSettingsPanel({
	field,
	allFields,
	onUpdate,
	onClose,
	onDuplicate,
	onDelete,
	onMoveUp,
	onMoveDown,
	onCopy,
}: {
	field: CanvasField;
	allFields: CanvasField[];
	onUpdate: (updates: Partial<CanvasField>) => void;
	onClose: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onCopy: () => void;
}) {
	const [activeTab, setActiveTab] = React.useState<SettingsTab>("general");
	const fieldIdx = allFields.findIndex((f) => f.instanceId === field.instanceId);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				backgroundColor: "var(--color-kumo-base)",
			}}
		>
			{/* Header */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "10px 12px",
					borderBottom: "1px solid var(--color-kumo-line)",
					flexShrink: 0,
				}}
			>
				<div>
					<h4
						style={{
							fontSize: "13px",
							fontWeight: 700,
							color: "var(--text-color-kumo-default)",
							margin: 0,
						}}
					>
						{field.label}
					</h4>
					<p
						style={{
							fontSize: "10px",
							color: "var(--text-color-kumo-inactive)",
							margin: 0,
							marginTop: 1,
							textTransform: "uppercase",
							letterSpacing: "0.04em",
						}}
					>
						{field.fieldType}
					</p>
				</div>
				<button
					type="button"
					onClick={onClose}
					style={{
						background: "none",
						border: "none",
						cursor: "pointer",
						padding: 4,
						color: "var(--text-color-kumo-subtle)",
					}}
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			{/* Action buttons */}
			<div
				style={{
					display: "flex",
					gap: 2,
					padding: "6px 12px",
					borderBottom: "1px solid var(--color-kumo-line)",
					flexShrink: 0,
				}}
			>
				<button
					type="button"
					onClick={onMoveUp}
					disabled={fieldIdx === 0}
					title="Move Up"
					style={{
						flex: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "5px 0",
						fontSize: "10px",
						border: "none",
						borderRadius: 4,
						backgroundColor: "var(--color-kumo-tint)",
						color: "var(--text-color-kumo-subtle)",
						cursor: fieldIdx === 0 ? "not-allowed" : "pointer",
						opacity: fieldIdx === 0 ? 0.4 : 1,
					}}
				>
					<ArrowUp className="h-3.5 w-3.5" />
				</button>
				<button
					type="button"
					onClick={onMoveDown}
					disabled={fieldIdx === allFields.length - 1}
					title="Move Down"
					style={{
						flex: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "5px 0",
						fontSize: "10px",
						border: "none",
						borderRadius: 4,
						backgroundColor: "var(--color-kumo-tint)",
						color: "var(--text-color-kumo-subtle)",
						cursor: fieldIdx === allFields.length - 1 ? "not-allowed" : "pointer",
						opacity: fieldIdx === allFields.length - 1 ? 0.4 : 1,
					}}
				>
					<ArrowDown className="h-3.5 w-3.5" />
				</button>
				<button
					type="button"
					onClick={onCopy}
					title="Copy"
					style={{
						flex: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "5px 0",
						border: "none",
						borderRadius: 4,
						backgroundColor: "var(--color-kumo-tint)",
						color: "var(--text-color-kumo-subtle)",
						cursor: "pointer",
					}}
				>
					<Copy className="h-3.5 w-3.5" />
				</button>
				<button
					type="button"
					onClick={onDuplicate}
					title="Duplicate"
					style={{
						flex: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "5px 0",
						border: "none",
						borderRadius: 4,
						backgroundColor: "var(--color-kumo-info-tint)",
						color: "var(--color-kumo-brand)",
						cursor: "pointer",
					}}
				>
					<Plus className="h-3.5 w-3.5" />
				</button>
				<button
					type="button"
					onClick={onDelete}
					title="Delete"
					style={{
						flex: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "5px 0",
						border: "none",
						borderRadius: 4,
						backgroundColor: "var(--color-kumo-danger-tint)",
						color: "var(--color-kumo-danger)",
						cursor: "pointer",
					}}
				>
					<Trash className="h-3.5 w-3.5" />
				</button>
			</div>

			{/* Tab bar */}
			<SettingsTabBar activeTab={activeTab} onTabChange={setActiveTab} field={field} />

			{/* Tab content */}
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "0 12px",
				}}
			>
				{activeTab === "general" && <GeneralTab field={field} onUpdate={onUpdate} />}
				{activeTab === "validation" && <ValidationTab field={field} onUpdate={onUpdate} />}
				{activeTab === "options" && <OptionsTab field={field} onUpdate={onUpdate} />}
				{activeTab === "logic" && <ComingSoonTab label="Conditional Logic" />}
				{activeTab === "style" && <StyleTab field={field} onUpdate={onUpdate} />}
				{activeTab === "advanced" && <AdvancedTab field={field} onUpdate={onUpdate} />}
			</div>
		</div>
	);
}
