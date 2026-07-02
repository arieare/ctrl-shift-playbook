# Ctrl+Shift! Playbook

Open source playbook for researchers using AI. The site is a static Astro app that publishes a paginated reader experience and a browser-print PDF flow.

## Development

```bash
pnpm install
pnpm dev
pnpm build
```

The local dev server usually runs at `http://localhost:4322`. The production build writes static files to `dist/`.

## Reader Behavior

- Reader pages are split from the Markdown content by horizontal rules.
- Hash navigation, previous/next buttons, table-of-contents links, keyboard navigation, and search results all resolve through the reader page state.
- Active reader content uses a subtle `reader-page-fade-in` animation in `src/styles/layout.css`.
- The animation is disabled for users with `prefers-reduced-motion: reduce`.

## Tables

Shared table styling lives in `src/styles/components.css`, with print-specific overrides in `src/styles/print.css`.

- Use plain tables for standard two-column content.
- Use `table-fit-first-column` when the first column should size to its content.
- Use `table-numbered` with a `colgroup` when a table needs a dedicated number column and a heading that spans the number and label columns.
- Avoid inline table typography and list-based numbering inside table cells.

## PDF And Print

The main `Download PDF` action opens the browser print dialog. Users should choose "Save as PDF" from the native dialog.

Print CSS must keep all reader pages visible, even though the screen reader view only shows one page at a time. Interactive diagrams should provide print-only image placeholders in `public/images/print/` when the live diagram is not suitable for print.

## Deployment

This project deploys as a Cloudflare Pages static site.

```bash
pnpm build
npx wrangler pages deploy ./dist --project-name=ctrl-shift-playbook
```

Before deploying, verify Cloudflare auth:

```bash
npx wrangler whoami
```

Cloudflare Pages should use `pnpm build` as the build command and `dist` as the output directory if configured through the dashboard.

## Verification

Before pushing or deploying:

```bash
pnpm build
git diff --check
```

For visual changes, check the target page in the browser at desktop width and one mobile width around `390x844`.
