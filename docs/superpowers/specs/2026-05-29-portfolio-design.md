# Portfolio Site — Design Spec

**Author:** Abu Bakar (`ab17dogar`)
**Date:** 2026-05-29
**Status:** Approved (pending spec review)

## 1. Purpose & Positioning

A personal portfolio for **Abu Bakar** — positioned as an **ML/AI engineer + full-stack developer** (hybrid "AI engineer"). Audience: ML/AI research groups, AI companies, tech recruiters, and graduate programs.

**Success criteria**
- Visually impressive, distinctive (not generic-AI-template), and memorable.
- Communicates both ML/research credibility and full-stack building ability.
- Fast (Lighthouse 95+ across perf/a11y/SEO), accessible (WCAG AA), responsive.
- Easy to update content (add a project/post by dropping a Markdown file).
- Hosted on GitHub Pages, custom-domain-ready.

## 2. Visual Direction

**"Neural Glass Bento"** — a blend of dark technical + glassmorphism:
- Near-black navy background with subtle 32px grid (radial-masked) and two drifting radial gradient blobs (violet top-left, cyan bottom-right).
- Bento-grid hero and section layouts.
- Glass tiles/cards (`backdrop-blur`, hairline borders, radial hover glow).
- Mono "terminal" accents for labels (`// comments`), chips, and code.
- Violet→cyan gradient for headline highlights and the logo dot.
- **Dark-native only** — no light theme.

### Design Tokens

**Colors (semantic)**
| Token | Value | Use |
|---|---|---|
| `bg` | `#06060d` | Page background |
| `surface` | `rgba(255,255,255,.04)` | Glass tiles/cards |
| `border` | `rgba(255,255,255,.08)` | Hairline borders |
| `text` | `#f8fafc` | Primary text |
| `text-muted` | `#94a3b8` | Secondary / mono labels |
| `primary` | `#a78bfa` (violet) | Accent, gradient start |
| `accent` | `#22d3ee` (cyan) | Gradient end, links |
| `success` | `#22c55e` | "Available" badge dot |
| `code` | `#f0abfc` (pink) | Inline code |

Headline gradient: `linear-gradient(90deg, #a78bfa, #22d3ee)`.

**Typography**
- Display/headings: **Geist** (fallback Inter), weight 700, tracking `-0.03em`.
- Body: **Inter**, 16px base, line-height 1.5–1.6.
- Mono: **JetBrains Mono** (labels, chips, code, `//` comments).
- Scale (px): `12 · 14 · 16 · 18 · 24 · 36 · 56`, fluid `clamp()` so hero scales down on mobile.

**Spacing & shape**
- 8px rhythm: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`.
- Radius: tiles `14px`, chips `4px`, pills `99px`, buttons `8px`.
- Glass: `backdrop-blur(16px)` + inner border + radial hover glow.

## 3. Site Structure

Multi-page with a rich home that previews everything.

| Route | Purpose | Key elements |
|---|---|---|
| `/` | Home / wow moment | Hero bento · About teaser · Skills grid · 4 featured projects · Research preview (1–2) · Blog preview (3) · Contact CTA |
| `/work` | All projects | Filterable grid (tags: ML, Web, Research); cards link to detail pages |
| `/work/[slug]` | Project detail | Cover, problem, tech stack, results, demo/repo links |
| `/research` | Publications & seminars | AutoFish seminar first; list w/ abstract + PDF/link |
| `/writing` | Blog index | Posts by date, tags |
| `/writing/[slug]` | Blog post | MDX, code highlighting, ToC |
| `/about` | Long-form bio | Photo, story, current focus, education, resume PDF download, timeline |
| `/404` | Custom not-found | On-brand glass card + "go home" CTA |

**Persistent UI:** top nav (logo · work · research · writing · about · "say hi" CTA), footer (GitHub, LinkedIn, email), animated background on all pages.

**Mobile:** nav → hamburger drawer; bento grids → single column; touch targets ≥ 44px; `min-h-dvh`; no horizontal scroll.

## 4. Animations & Interactions

All animations respect `prefers-reduced-motion` (reduced/disabled). Only `transform`/`opacity` animated. Animations interruptible; never block input.

- **Load/scroll:** hero tiles stagger in (fade+rise, 40ms apart); sections reveal on scroll (fade + 20px rise, once); gradient blobs drift slowly (infinite, subtle).
- **Hero:** headline gradient shimmer; pulsing "available" badge dot; rotating role text (ML engineer → full-stack dev → researcher) with swap/typewriter effect.
- **Project cards (centerpiece):** cursor-following radial spotlight; hover lift + border brighten + inner cyan glow; tech chips stagger in on viewport entry.
- **Skills grid:** wave stagger-in; hover scale + gradient fill + proficiency tooltip.
- **Stats:** count-up on scroll into view.
- **Micro:** nav animated underline + active-route highlight; button press scale (0.97) + hover glow; violet 2px focus rings; smooth anchor scroll; Astro View Transitions (cross-fade) between routes.
- **Guardrails:** heavy effects (spotlight, blobs) skip mounting under reduced-motion.

## 5. Tech Stack

**Astro 5 + React islands + Tailwind CSS + Framer Motion.**
- Astro for static pages/layout (ships ~0 JS by default).
- React islands only for interactive bits (skills grid, project card spotlight, rotating role text, count-up).
- Tailwind for styling with the tokens above mapped to theme config.
- Framer Motion (or `motion`) for animations within React islands; CSS for simple transitions.
- MDX for content collections (blog, projects, research).
- Component libraries (shadcn/ui, Aceternity/Magic UI) usable as React islands where helpful.

## 6. Content Architecture

Content is data, editable without touching components.

```
src/content/
  projects/     # one .mdx per project (title, tags[], stack[], links, cover, featured?)
  research/     # one .mdx per paper/seminar (title, abstract, venue, year, pdf/link)
  posts/        # one .mdx per blog post (title, date, tags[], draft?)
src/data/
  siteData.ts   # name, bio, socials, skills[], stats[] — single source of truth
public/
  resume.pdf    # downloadable resume
  images/       # project covers, OG images
```

Frontmatter is schema-validated via Astro content collections (`zod`) — malformed content fails the build rather than shipping broken.

**Pre-filled real data (siteData.ts):**
- Name: Abu Bakar
- Location: Rostock, Germany
- Affiliation: Universität Rostock
- LinkedIn: https://www.linkedin.com/in/abdogar17/
- GitHub: https://github.com/ab17dogar
- Email (public contact, shown on site): 10abdogar@gmail.com
- Focus areas / domains (drive the skills grid + section framing, no single hard-coded topic): AI/ML · Computer Vision · LLMs · Cloud Engineering · Distributed Systems.
- Research/project entries are authored by the user as content files; ship the collections with generic example entries reflecting the focus areas above rather than one specific seeded topic.

> Note: git commit authorship stays on `abu.bakar@uni-rostock.de` (NOT the public Gmail), to keep commits attributed to the `ab17dogar` GitHub account.

## 7. Component Structure

Isolated, single-purpose units:
- `Layout.astro`, `Nav`, `Footer`, `BackgroundFX` (grid + blobs)
- `HeroBento`, `AboutTeaser`
- `SkillsGrid` (React island)
- `ProjectCard` (React island — spotlight), `ProjectGrid`, `ProjectFilter`
- `ResearchList`, `BlogList`, `ContactCTA`
- `RotatingRole` (island), `CountUp` (island), `Reveal` (scroll-reveal wrapper)

## 8. Deployment (GitHub Pages)

- **Repo:** `ab17dogar.github.io` (user site) → live at `https://ab17dogar.github.io`.
- `astro.config.mjs`: `site: 'https://ab17dogar.github.io'`, `base: '/'`.
- **Custom-domain-ready:** because it's a root user site, `base` stays `/`. Switching to a custom domain later = update `site` + add `public/CNAME`. No path rewrites needed.
- CI: `.github/workflows/deploy.yml` using `withastro/action@v3` + `actions/deploy-pages`. Push to `main` → build → deploy.
- GitHub Pages source: GitHub Actions.

## 9. SEO & Polish

- Per-page meta + OpenGraph images; `@astrojs/sitemap`; `robots.txt`; RSS feed for blog (`@astrojs/rss`).
- Favicon + web manifest.

## 10. Accessibility

WCAG AA built in: contrast ≥ 4.5:1 body text; semantic HTML + heading hierarchy; full keyboard nav with visible focus rings; alt text on meaningful images; `aria-label` on icon-only buttons; `prefers-reduced-motion` support; color never the sole signal.

## 11. Error Handling

- Content schema validation fails the build on malformed frontmatter.
- Custom `/404` page.
- Contact CTA uses `mailto:` + social links (no backend; static-safe). Optional: a form via a third-party endpoint (e.g. Formspree) — deferred / out of scope for v1.
- External links: `rel="noopener noreferrer"`, `target="_blank"`.

## 12. Verification

- `astro build` passes (content type-checked).
- Lighthouse ≥ 95 perf / a11y / SEO.
- Manual: 375px mobile + desktop; reduced-motion on/off; keyboard-only nav.
- Deployed site loads correctly at `https://ab17dogar.github.io`.

## 13. Scope & YAGNI

**In scope (v1):** all routes in §3, all content collections, animations in §4, GitHub Pages deploy, SEO, a11y.

**Out of scope (v1):** light theme; backend/contact-form server; CMS; i18n; comments on blog; analytics (can add later via a lightweight script).
