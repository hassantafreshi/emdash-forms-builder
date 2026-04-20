# @emdash-cms/plugin-forms-builder

EmForm Builder plugin for EmDash CMS.

Build forms in the admin panel, embed them in content, collect submissions, and manage responses.

## Requirements

- `emdash` `>=0.1.1`
- `astro` `>=6.0.0-beta.0`
- `react` `^18.0.0 || ^19.0.0`

## Install

```bash
pnpm add @emdash-cms/plugin-forms-builder
```

## Install From GitHub

Install directly from this repository when you want to use the plugin before it is published to a package registry:

```bash
pnpm add "git+https://github.com/hassantafreshi/emdash-forms-builder.git#main"
```

To pin the exact snapshot currently uploaded to GitHub:

```bash
pnpm add "git+https://github.com/hassantafreshi/emdash-forms-builder.git#f5775a7"
```

## Register In EmDash

```ts
// astro.config.mjs
import { defineConfig } from "astro/config";
import emdash from "emdash";
import { formsBuilderPlugin } from "@emdash-cms/plugin-forms-builder";

export default defineConfig({
	integrations: [
		emdash({
			plugins: [formsBuilderPlugin()],
		}),
	],
});
```

## Use Embedded Form Block

After creating a form in the plugin admin page:

1. Open the EmDash editor.
2. Insert the `Form` portable text block.
3. Select a form from the dropdown.

## Astro Exports

The package provides Astro exports via:

- `@emdash-cms/plugin-forms-builder/astro`
- `@emdash-cms/plugin-forms-builder/astro/portal-page`

## Local Development

```bash
pnpm --filter @emdash-cms/plugin-forms-builder build
pnpm --filter @emdash-cms/plugin-forms-builder typecheck
```

## License

MIT
