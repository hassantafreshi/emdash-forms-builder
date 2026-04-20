/**
 * Forms Builder — Loading Spinner
 *
 * Animated spinner used while sections are loading data from the backend.
 */

import * as React from "react";

export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-32 gap-4">
			<div className="relative" style={{ width: 48, height: 48 }}>
				{/* Outer ring */}
				<div
					className="absolute inset-0 rounded-full"
					style={{
						border: "3px solid var(--color-kumo-line)",
					}}
				/>
				{/* Spinning arc */}
				<div
					className="absolute inset-0 rounded-full animate-spin"
					style={{
						border: "3px solid transparent",
						borderTopColor: "var(--color-kumo-brand)",
						borderRightColor: "var(--color-kumo-brand)",
					}}
				/>
				{/* Inner dot pulse */}
				<div
					className="absolute rounded-full animate-pulse"
					style={{
						width: 10,
						height: 10,
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						backgroundColor: "var(--color-kumo-brand)",
					}}
				/>
			</div>
			<p
				className="text-sm font-medium animate-pulse"
				style={{ color: "var(--text-color-kumo-subtle)" }}
			>
				{message}
			</p>
		</div>
	);
}
