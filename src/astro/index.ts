/**
 * Astro component exports for the Forms Builder plugin.
 *
 * `blockComponents` is auto-wired via `virtual:emdash/block-components`.
 *
 * Usage in an Astro page:
 * ```astro
 * ---
 * import { FormsBuilderForm } from "@emdash-cms/plugin-forms-builder/astro";
 * ---
 * <FormsBuilderForm />
 * ```
 */

import FormsBuilderForm from "./Form.astro";
import FormEmbed from "./FormEmbed.astro";
import FormsBuilderPortal from "./Portal.astro";

export { FormsBuilderForm, FormsBuilderPortal };

export const blockComponents = {
	formEmbed: FormEmbed,
	portalEmbed: FormsBuilderPortal,
};
