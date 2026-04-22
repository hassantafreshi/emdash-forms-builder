# @emdash-cms/plugin-forms-builder

A full-featured form builder plugin for [EmDash CMS](https://emdash.dev).
Build drag-and-drop forms in the admin panel, embed them in content, collect
submissions, manage responses, and give submitters a self-service support
portal — all without leaving your CMS.

---

## Features

### Form Builder

- Drag-and-drop field editor with live preview
- **24 field types** across six categories:
  - **Basic** — text, name, email, phone, mobile, number, textarea, date,
    password
  - **Choice** — select, multiselect, radio, checkbox, yes/no
  - **Survey** — star rating, NPS, 5-point scale
  - **Advanced** — file upload, signature, location picker
  - **Commerce** — price, total price
  - **Structural** — step (multi-page), group
- Multi-step (wizard) forms with per-step field grouping
- Per-field conditional logic (show / hide on value match)
- Global and per-field style overrides (colours, border-radius, fonts …)
- Submit button customisation (size, variant, colours, loading / success text)
- Form-level appearance theming (accent colour, background, font size …)
- Two form layout options: single-column, two-column
- Status lifecycle: **draft → published → archived**
- One-click **Duplicate** a form

### Starter Templates

Four ready-made templates to jump-start common use cases:

| Template | Category |
|---|---|
| Contact Form | General |
| Support Ticket | Support |
| Customer Satisfaction | Survey |
| Blank Form | General |

### Submissions & Responses

- Inbox with **open / read / closed** status management
- Per-submission detail view with all field answers
- Admin ↔ submitter **reply thread** (bidirectional messaging)
- **CSV export** of all submissions for a form
- Tracking code per submission (styles: date-mix, sequential, or UUID)
- Auto-delete after configurable number of days

### Email Notifications

- **Admin notification** on new submission — HTML + plain-text email with
  all answers and tracking code
- **User confirmation** — receipt email to the address in any `email` field,
  with answers summary and portal link
- **Reply notification** — email to submitter when admin sends a reply
- Branding footer removed automatically on the **Pro** plan tier

### Support Portal

A public-facing portal page where submitters can:

- **Request access** by entering the email used during submission
- Receive a **magic-link** token by email (valid until activated, then 24 h)
- View all their own submissions and status
- Read admin replies and send follow-up messages
- Re-request the portal link if it expires

Embed the portal anywhere in your Astro site using the `portalEmbed` portable-
text block or the `FormsBuilderPortal` Astro component.

### Legacy Import (Easy Form Builder migration)

- Import existing Easy Form Builder v2 / v3 JSON exports via the Settings page
- Automatic schema normalisation to `FormDefinitionV1`
- Migration warnings surfaced in the import result

---

## Location In Monorepo

This plugin lives at `packages/plugins/forms-builder/` inside the EmDash
monorepo, alongside the other first-party plugins (`color`, `audit-log`,
`forms`, …). It is linked via `pnpm` workspaces and served directly from
`src/` — **no build step required** during development.

Upstream source: <https://github.com/hassantafreshi/emdash-forms-builder>

---

## Requirements

Three peer dependencies — the plugin manages everything else itself:

| Peer | Range |
|---|---|
| `emdash` | `>=0.1.1` |
| `astro` | `>=6.0.0-beta.0` |
| `react` | `^18.0.0 \|\| ^19.0.0` |

`@lingui/core`, `@lingui/react`, and `@phosphor-icons/react` are **runtime
dependencies** of the plugin. You do **not** need to install or configure
them in the host project, and you do **not** need the Lingui Babel macro
plugin.

---

## Install

### Inside the EmDash monorepo

```jsonc
// demos/<your-demo>/package.json
{
  "dependencies": {
    "@emdash-cms/plugin-forms-builder": "workspace:*"
  }
}
```

Then from the repo root:

```bash
pnpm install
```

### Outside the monorepo (npm / pnpm registry)

```bash
pnpm add @emdash-cms/plugin-forms-builder
```

---

## Register

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

After `pnpm install` and a dev-server restart, the admin sidebar shows
**EmForm Builder** and the editor gains a **Form** block and a
**Support Portal** block.

---

## Embed a Form in Content

1. Create and publish a form in the **EmForm Builder** admin section.
2. Open the EmDash editor and insert the **Form** portable-text block.
3. Pick the form from the dropdown.
4. The `formEmbed` block component (auto-wired via `blockComponents`) renders it on your public page.

---

## Embed the Support Portal

1. Enable the portal in **Settings → Portal**.
2. Set `portalPagePath` to the public path of your portal page
   (e.g. `/support`), or leave blank to use the built-in route.
3. Add a **Support Portal** block to any page, or render the component
   directly:

```astro
---
import { FormsBuilderPortal } from "@emdash-cms/plugin-forms-builder/astro";
---
<FormsBuilderPortal />
```

---

## Astro Exports

| Export path | Contents |
|---|---|
| `@emdash-cms/plugin-forms-builder` | `formsBuilderPlugin()` — register in `astro.config.mjs` |
| `@emdash-cms/plugin-forms-builder/astro` | `FormsBuilderForm`, `FormsBuilderPortal`, `blockComponents` |
| `@emdash-cms/plugin-forms-builder/astro/portal-page` | `PortalPage.astro` — standalone page component |

---

## Settings Reference

Configurable in **EmForm Builder → Settings**:

| Key | Default | Description |
|---|---|---|
| `notificationEmail` | `""` | Fallback admin notification address |
| `trackingStyle` | `"date_en_mix"` | Format of tracking codes |
| `autoDeleteDays` | `90` | Days before submissions are auto-deleted (0 = never) |
| `captchaEnabled` | `false` | Enable CAPTCHA on all public forms |
| `portalEnabled` | `true` | Make the support portal available |
| `portalTitle` | `"Support Portal"` | Portal page heading |
| `portalWelcomeMessage` | `""` | Welcome message shown on the portal login page |
| `portalDefaultLocale` | `"en"` | Default locale for portal UI |
| `portalBrandColor` | `""` | Primary brand colour for the portal |
| `portalLoginDescription` | `""` | Description text on the portal login screen |
| `portalPagePath` | `""` | Public path of your portal Astro page |
| `planTier` | `"free"` | `"free"` shows branding footer; `"pro"` removes it |
| `formAccentColor` | `""` | Global accent colour for embedded forms |
| `formBgColor` | `""` | Global form background colour |
| `formTextColor` | `""` | Global form text colour |
| `formBorderRadius` | `""` | Global border-radius for form inputs |
| `formFontSize` | `""` | Global base font size for embedded forms |
| `formButtonStyle` | `"filled"` | Submit button variant: `filled`, `outline`, `ghost` |

---

## Development (inside the EmDash monorepo)

```bash
# Type-check
pnpm --filter @emdash-cms/plugin-forms-builder typecheck
```

`main` and `exports` in `package.json` point directly at `src/`, so Vite
serves the TypeScript source as-is during development — no separate build
step needed.

> **After editing `astro.config.mjs` or adding/removing plugins, always
> do a full restart:**
>
> ```powershell
> # Kill all dev servers, clear Vite cache, restart
> Get-NetTCPConnection -LocalPort 4321,4322 -ErrorAction SilentlyContinue |
>   ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
> Remove-Item -Recurse -Force node_modules/.vite, demos/simple/.astro,
>   demos/simple/node_modules/.vite -ErrorAction SilentlyContinue
> pnpm --filter emdash-demo dev
> ```

---

## Troubleshooting

**`TypeError: Cannot read properties of undefined (reading 'call')`**  
Vite 7.3.1 bug triggered by hot-reload of `astro.config.mjs`. Do a full
kill + cache clear + restart (see Development section above).

**Admin page stuck on loading**  
Clear Vite and Astro caches:

```powershell
Remove-Item -Recurse -Force node_modules/.vite, .astro
pnpm dev
```

**`"does not provide an export named 'msg'"`**  
You are on a pre-0.2.0 version. Upgrade to `>=0.2.0`.

**`"Failed to resolve import '@lingui/react'"`**  
Pre-0.2.0 had these as peer deps. Upgrade to `>=0.2.0`.

---

## License

MIT
