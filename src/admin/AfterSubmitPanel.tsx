/**
 * Forms Builder — After Submission Settings Panel
 *
 * Configures what happens after a user submits a form:
 * - Thank-you message or redirect URL
 * - Show/hide tracking code
 * - Submission mode (standard, survey, payment, login, register)
 *
 * Displayed as a right-sidebar panel in the form builder.
 */

import {
	ChatCircleDots,
	ArrowSquareOut,
	Hash,
	X,
	CheckCircle,
	ListBullets,
} from "@phosphor-icons/react";
import * as React from "react";

import type { AfterSubmitConfig, SubmissionMode } from "./types.js";

// =============================================================================
// Submission Mode metadata — extensible for future form types
// =============================================================================

interface SubmissionModeOption {
	value: SubmissionMode;
	label: string;
	description: string;
}

const SUBMISSION_MODES: SubmissionModeOption[] = [
	{
		value: "standard",
		label: "Standard Form",
		description: "General purpose contact or data collection form",
	},
	{
		value: "survey",
		label: "Survey / Poll",
		description: "Gather opinions with ratings and choices",
	},
	{ value: "payment", label: "Payment Form", description: "Collect payment information" },
	{ value: "login", label: "Login", description: "User authentication form" },
	{ value: "register", label: "Registration", description: "New user registration form" },
];

// =============================================================================
// Component
// =============================================================================

export function AfterSubmitPanel({
	config,
	onUpdate,
	onClose,
}: {
	config: AfterSubmitConfig;
	onUpdate: (updates: Partial<AfterSubmitConfig>) => void;
	onClose: () => void;
}) {
	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div
				className="flex items-center justify-between px-4 py-3 flex-shrink-0"
				style={{
					borderBottom: "1px solid var(--color-kumo-line)",
				}}
			>
				<div className="flex items-center gap-2">
					<CheckCircle className="h-4 w-4" style={{ color: "var(--color-kumo-brand)" }} />
					<span className="text-sm font-bold" style={{ color: "var(--text-color-kumo-default)" }}>
						After Submission
					</span>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="p-1.5 rounded-lg transition-colors"
					style={{ color: "var(--text-color-kumo-subtle)" }}
					title="Close"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-4 space-y-5">
				{/* -- Submission Mode -- */}
				<SettingSection icon={<ListBullets className="h-4 w-4" />} title="Form Type">
					<select
						value={config.submissionMode}
						onChange={(e) => onUpdate({ submissionMode: e.target.value as SubmissionMode })}
						className="w-full text-sm rounded-lg px-3 py-2 outline-none"
						style={{
							border: "1px solid var(--color-kumo-line)",
							backgroundColor: "var(--color-kumo-tint)",
							color: "var(--text-color-kumo-default)",
						}}
					>
						{SUBMISSION_MODES.map((m) => (
							<option key={m.value} value={m.value}>
								{m.label}
							</option>
						))}
					</select>
					<p className="text-xs mt-1" style={{ color: "var(--text-color-kumo-subtle)" }}>
						{SUBMISSION_MODES.find((m) => m.value === config.submissionMode)?.description ?? ""}
					</p>
				</SettingSection>

				{/* -- Show Tracking Code -- */}
				<SettingSection icon={<Hash className="h-4 w-4" />} title="Display Tracking Code">
					<label className="flex items-center gap-3 cursor-pointer">
						<ToggleSwitch
							checked={config.showTrackingCode}
							onChange={(v) => onUpdate({ showTrackingCode: v })}
						/>
						<span className="text-sm" style={{ color: "var(--text-color-kumo-default)" }}>
							{config.showTrackingCode ? "Show reference number to user" : "Hidden from user"}
						</span>
					</label>
					<p className="text-xs mt-1" style={{ color: "var(--text-color-kumo-subtle)" }}>
						When enabled, users will see a unique reference number after submitting the form so they
						can track their submission.
					</p>
				</SettingSection>

				{/* -- Thank You Mode -- */}
				<SettingSection
					icon={
						config.thankYouMode === "message" ? (
							<ChatCircleDots className="h-4 w-4" />
						) : (
							<ArrowSquareOut className="h-4 w-4" />
						)
					}
					title="After Submission Action"
				>
					<div className="flex gap-2 mb-3">
						<ModeButton
							active={config.thankYouMode === "message"}
							label="Show Message"
							onClick={() => onUpdate({ thankYouMode: "message" })}
						/>
						<ModeButton
							active={config.thankYouMode === "redirect"}
							label="Redirect to URL"
							onClick={() => onUpdate({ thankYouMode: "redirect" })}
						/>
					</div>

					{config.thankYouMode === "message" ? (
						<div>
							<label
								className="block text-xs font-medium mb-1.5"
								style={{ color: "var(--text-color-kumo-subtle)" }}
							>
								Thank You Message
							</label>
							<textarea
								value={config.thankYouMessage}
								onChange={(e) => onUpdate({ thankYouMessage: e.target.value })}
								rows={3}
								className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-vertical"
								style={{
									border: "1px solid var(--color-kumo-line)",
									backgroundColor: "var(--color-kumo-tint)",
									color: "var(--text-color-kumo-default)",
								}}
								placeholder="Thank you! Your submission has been received."
							/>
							<p className="text-xs mt-1" style={{ color: "var(--text-color-kumo-subtle)" }}>
								This message is shown to the user after they submit the form.
							</p>
						</div>
					) : (
						<div>
							<label
								className="block text-xs font-medium mb-1.5"
								style={{ color: "var(--text-color-kumo-subtle)" }}
							>
								Redirect URL
							</label>
							<input
								type="url"
								value={config.redirectUrl}
								onChange={(e) => onUpdate({ redirectUrl: e.target.value })}
								className="w-full text-sm rounded-lg px-3 py-2 outline-none"
								style={{
									border: "1px solid var(--color-kumo-line)",
									backgroundColor: "var(--color-kumo-tint)",
									color: "var(--text-color-kumo-default)",
								}}
								placeholder="https://example.com/thank-you"
							/>
							<p className="text-xs mt-1" style={{ color: "var(--text-color-kumo-subtle)" }}>
								After submission, the user will be redirected to this URL.
							</p>
						</div>
					)}
				</SettingSection>

				{/* -- Preview -- */}
				<SettingSection icon={<CheckCircle className="h-4 w-4" />} title="Preview">
					<div
						className="rounded-lg p-4 text-sm"
						style={{
							backgroundColor: "#f0fdf4",
							color: "#166534",
							border: "1px solid #bbf7d0",
						}}
					>
						{config.thankYouMode === "redirect" ? (
							<p>
								↗ User will be redirected to:{" "}
								<strong>{config.redirectUrl || "(no URL set)"}</strong>
							</p>
						) : (
							<>
								<p>{config.thankYouMessage || "Thank you! Your submission has been received."}</p>
								{config.showTrackingCode && (
									<p className="mt-1 text-xs" style={{ color: "#15803d" }}>
										(Ref: 20260420-A3X)
									</p>
								)}
							</>
						)}
					</div>
				</SettingSection>
			</div>
		</div>
	);
}

// =============================================================================
// Sub-components
// =============================================================================

function SettingSection({
	icon,
	title,
	children,
}: {
	icon: React.ReactNode;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<div
				className="flex items-center gap-2 mb-2"
				style={{ color: "var(--text-color-kumo-strong)" }}
			>
				<span style={{ color: "var(--color-kumo-brand)" }}>{icon}</span>
				<span className="text-xs font-bold uppercase tracking-wide">{title}</span>
			</div>
			<div
				className="rounded-xl p-3"
				style={{
					backgroundColor: "var(--color-kumo-elevated)",
					border: "1px solid var(--color-kumo-line)",
				}}
			>
				{children}
			</div>
		</div>
	);
}

function ModeButton({
	active,
	label,
	onClick,
}: {
	active: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all"
			style={{
				backgroundColor: active ? "var(--color-kumo-brand)" : "var(--color-kumo-tint)",
				color: active ? "var(--color-kumo-base)" : "var(--text-color-kumo-subtle)",
				border: active ? "none" : "1px solid var(--color-kumo-line)",
			}}
		>
			{label}
		</button>
	);
}

function ToggleSwitch({
	checked,
	onChange,
}: {
	checked: boolean;
	onChange: (value: boolean) => void;
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={() => onChange(!checked)}
			className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
			style={{
				backgroundColor: checked ? "var(--color-kumo-brand)" : "var(--color-kumo-line)",
			}}
		>
			<span
				className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
				style={{
					transform: checked ? "translateX(18px)" : "translateX(3px)",
				}}
			/>
		</button>
	);
}
