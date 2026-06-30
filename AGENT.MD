# Ctrl+Shift! Playbook Agent Guide

## Project

This project is the single-page public scaffold for the Ctrl+Shift! Playbook. The playbook documents durable principles and judgment calls from researcher discussions about AI. The first version is intentionally structural: content modules, reset-level styling, navigation, and print-to-PDF support.

## Stack

- Astro with TypeScript
- `pnpm` as the package manager
- Static output for later Cloudflare deployment
- No Tailwind, component library, or visual design system yet

## Commands

- `pnpm install` installs dependencies.
- `pnpm dev` starts the local dev server.
- `pnpm check` runs Astro type/content checks.
- `pnpm build` runs checks and builds the static site.
- `pnpm preview` serves the production build locally.

## Content Rules

- Playbook prose lives in `src/content/playbook/*.md`.
- Each section file should have frontmatter with `title`, `navLabel`, `summary`, and `order`.
- Keep prose in Markdown unless a section needs real interaction.
- Add new sections as new Markdown files instead of hardcoding long prose in Astro components.
- Use body-level `<hr />` markers in playbook Markdown as reader page breaks. They are screen-only pagination boundaries, not decorative rules.
- Do not place page-break markers inside tables, custom interactive elements, or form components.
- Placeholder content should be clearly temporary and easy to replace.

## Styling Rules

- Keep styling modular:
  - `src/styles/reset.css` for reset behavior
  - `src/styles/tokens.css` for CSS variables
  - `src/styles/base.css` for document defaults
  - `src/styles/layout.css` for page structure
  - `src/styles/components.css` for reusable component classes
  - `src/styles/print.css` for print and PDF output
- Do not create large one-off page CSS blocks.
- Add tokens only when a repeated design decision exists.
- Keep the current visual layer bare until an explicit design direction is chosen.

## Interaction Rules

- Page behavior lives in `src/scripts/playbook.ts`.
- Keep interactions progressive and content-safe.
- Current interactions include reader pagination, table-of-contents active state, interactive diagrams, the alignment canvas, and browser print-to-PDF.

## PDF Behavior

The `Download PDF` button currently calls `window.print()`. Users should save as PDF through the browser print dialog. Build-generated PDF tooling can be added later once content and layout stabilize.
Reader pagination is screen-only; print styles reveal every reader chunk and hide reader controls so the PDF remains the full playbook.

## Deployment Notes

Cloudflare deployment and custom domain setup are deferred. The Astro config currently uses static output, so it is compatible with Cloudflare Pages or another static host later.

Do not initialize git, set remotes, configure Cloudflare, or attach a domain unless explicitly asked.
