# Portfolio Enhancements — Design Spec

**Date:** 2026-06-06
**Status:** Approved (design); implementation pending plan
**Reference studied:** https://gmmustafa.netlify.app/

## Goal

Bring missing presentation/interaction features from the reference portfolio into
the existing site, **without changing the theme, colors, design, layout, or overall
look**. All work is **additive**: nothing currently on the site is removed or
restyled. Existing tokens (dark glass theme, `#06060d` bg, `#a78bfa` primary,
`#22d3ee` accent, Inter / JetBrains Mono, `//` mono labels, glass tiles, framer-motion
reveals) are reused as-is.

## Hard constraints

1. **No `git push`, no PRs, no GitHub MCP writes** until the user explicitly approves.
   Local commits only. Git author stays `Abu Bakar <abu.bakar@uni-rostock.de>`
   (never `10abdogar@gmail.com`).
2. **No visual restyling.** No new colors, fonts, spacing scales, or layout
   paradigms. New UI is composed only from existing classes/tokens.
3. **Preserve all existing content and sections.** Hero, About, Experience+Education,
   Projects, Research/Writing, Skills, Contact all remain.
4. **Preserve the GitHub-sync model.** Projects still come from repos containing a
   `portfolio-content.md`; the portfolio repo does not start hosting per-project
   assets.

## Scope (the agreed changes)

### 1. Project cards — thumbnails + platform links (`src/components/ProjectCard.tsx`)
- Add a 16:9 thumbnail region at the top of each card.
  - If `project.image` is set → render the image (`object-cover`, lazy).
  - Else → render a **deterministic generated thumbnail**: a theme-gradient tile
    (purple→cyan family) seeded by the project slug, overlaid with the project's
    initials in mono. Never empty, always on-brand.
- Add a row of `pointer-events-auto` link chips (icon + short label) for
  **Web App / iOS App / Android / Live Demo**, rendered **only when present**.
  Same interaction pattern as the existing GitHub icon (so the card's stretched
  link to the detail page still works). No fabricated links.
- Existing card behavior preserved: hover spotlight, `whileHover` lift, stretched
  link, tags line, stack chips, language/stars footer, "click for details".

### 2. Project detail page — banner + similar projects (`src/pages/work/[slug].astro`)
- Banner image at the top using the same image-or-generated logic as the card.
- Platform link buttons (Web App / iOS App / Android / Live Demo) shown next to the
  existing "Go to GitHub repo" button, only when present.
- **"Similar projects"** section at the bottom:
  - Computed from shared `tags` — overlap count with every other project, exclude
    self, sort by overlap desc then existing order, take top 3.
  - If a project shares no tags with any other, the section is omitted.
  - Rendered as compact cards in the existing card style, each linking to its
    detail page. No new data required.

### 3. Projects grid — category filter (`src/components/ProjectGrid.tsx`)
- Filter pills above the grid, derived from the union of all project `tags`
  (with an "All" default). Styled as existing mono pills.
- Clicking a pill filters the grid; reflow animated with framer-motion (the grid is
  already a client component). Removes nothing; "All" shows the current full set.

### 4. Hero — photo + richer stats (`src/components/HeroBento.astro`)
- Add `my_pic.jpeg` as a rounded photo with a subtle gradient ring built from
  existing tokens. Placed within the existing bento grid (default: right column,
  above the stat tiles). **Placement is adjustable on review; the bento's existing
  structure and styling are otherwise unchanged.**
- Add ~2 more honest metric callouts alongside the current two, reusing the existing
  `CountUp` component:
  - live **project count** (passed in from the synced projects, so it stays accurate)
  - **focus-domain count** (from `siteData.focusAreas`)
- No numbers are invented; non-derivable stats remain text like today.

### 5. "Worked with & studied at" strip (new `src/components/WorkedWith.astro`)
- A mono-labeled (`// worked with & studied at`) band of org/university names,
  styled as existing pills/text. Sourced from a new `siteData.orgs` array
  (Careem, NorthBay Solutions, Universität Rostock, Forman Christian College
  University, AWS — each with optional `href`).
- Placed just after the hero (mirrors the reference). Its own `<section>`; adds
  nothing destructive.

### 6. Data layer + assets
- `src/lib/github-projects.ts`:
  - Extend `GithubProject` with `image?: string`, `webapp?: string`,
    `appstore?: string`, `playstore?: string`, and a generic
    `links?: { label: string; href: string }[]`.
  - Parse these from `portfolio-content.md` frontmatter (all optional, backward
    compatible). Normalize the dedicated fields + `links[]` into one ordered list
    for rendering.
  - Seed the `FALLBACK` entries with a sample `image` and one or two platform links
    so the new features are visible even when GitHub is unreachable at build.
- `src/data/siteData.ts`: add `orgs` array and the extra stat definitions
  (additive; existing fields untouched, including the existing `email`).
- Copy `Personal_projects/my_pic.jpeg` → `public/my_pic.jpeg`.

### 7. Helpers + tests
- New pure helpers (likely `src/lib/projects.ts` or extend `format.ts`):
  - `initials(title)` — initials for the generated thumbnail.
  - `gradientFor(slug)` — deterministic theme-gradient pick from the existing palette.
  - `similarProjects(current, all)` — shared-tag ranking, top 3.
  - `allTags(projects)` / tag-derivation for the filter.
  - `normalizeLinks(project)` — merge dedicated link fields + `links[]`.
- Add **vitest** tests for each pure helper. Keep `bun run test` green.
- Keep `bun run build` green. (`bun` is installed; build/test run via bun.)

## Out of scope (explicitly not doing)
- Testimonials section (no real quotes to use; would require fabrication).
- Any theme toggle / light mode (site is intentionally dark-only).
- Restructuring into multiple pages or changing the information architecture.
- Editing the GitHub repos' `portfolio-content.md` files (separate, push-gated step;
  the rendering + parsing is built so links/images can be added later).
- Changing `siteData.email` or any other existing content values.

## Acceptance
- All existing sections and content still present and visually unchanged.
- Project cards show thumbnails (real or generated) and platform link chips when set.
- Detail pages show a banner, platform buttons, and a "Similar projects" block when
  applicable.
- Projects grid is filterable by tag; "All" restores the full set.
- Hero shows the user's photo and two additional accurate stats.
- "Worked with & studied at" strip renders after the hero.
- `bun run build` and `bun run test` both pass.
- No `git push` performed.
