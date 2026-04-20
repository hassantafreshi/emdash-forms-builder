/**
 * PoweredByFooter — renders the "Powered by {pluginName} · Made by {studioName}" footer
 * with both names as anchor links. Template comes from i18n `common.poweredBy`.
 */

import * as React from "react";

import type { PortalTranslations } from "./i18n.js";

interface PoweredByFooterProps {
	t: PortalTranslations;
	pluginName: string;
	pluginUrl: string;
	studioName: string;
	studioUrl: string;
}

/**
 * Parses a template string with `{pluginName}` and `{studioName}` placeholders,
 * returning an array of React nodes with anchor elements for each placeholder.
 */
function renderTemplate(
	template: string,
	pluginName: string,
	pluginUrl: string,
	studioName: string,
	studioUrl: string,
): React.ReactNode[] {
	const parts: React.ReactNode[] = [];
	let remaining = template;
	let key = 0;

	while (remaining.length > 0) {
		const pluginIdx = remaining.indexOf("{pluginName}");
		const studioIdx = remaining.indexOf("{studioName}");

		// Find the next placeholder
		let nextIdx = -1;
		let nextType: "plugin" | "studio" | null = null;

		if (pluginIdx >= 0 && (studioIdx < 0 || pluginIdx < studioIdx)) {
			nextIdx = pluginIdx;
			nextType = "plugin";
		} else if (studioIdx >= 0) {
			nextIdx = studioIdx;
			nextType = "studio";
		}

		if (nextIdx < 0 || nextType === null) {
			// No more placeholders
			parts.push(<React.Fragment key={key++}>{remaining}</React.Fragment>);
			break;
		}

		// Text before placeholder
		if (nextIdx > 0) {
			parts.push(<React.Fragment key={key++}>{remaining.slice(0, nextIdx)}</React.Fragment>);
		}

		// The link
		if (nextType === "plugin") {
			parts.push(
				<a
					key={key++}
					href={pluginUrl}
					target="_blank"
					rel="noopener noreferrer"
					style={{
						color: "inherit",
						textDecoration: "underline",
						textUnderlineOffset: "2px",
					}}
				>
					{pluginName}
				</a>,
			);
			remaining = remaining.slice(nextIdx + "{pluginName}".length);
		} else {
			parts.push(
				<a
					key={key++}
					href={studioUrl}
					target="_blank"
					rel="noopener noreferrer"
					style={{
						color: "inherit",
						textDecoration: "underline",
						textUnderlineOffset: "2px",
					}}
				>
					{studioName}
				</a>,
			);
			remaining = remaining.slice(nextIdx + "{studioName}".length);
		}
	}

	return parts;
}

export function PoweredByFooter({
	t,
	pluginName,
	pluginUrl,
	studioName,
	studioUrl,
}: PoweredByFooterProps) {
	const template = t["common.poweredBy"];

	return (
		<footer
			style={{
				textAlign: "center",
				padding: "16px 12px",
				fontSize: "11px",
				color: "#9ca3af",
				fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
			}}
		>
			{renderTemplate(template, pluginName, pluginUrl, studioName, studioUrl)}
		</footer>
	);
}
