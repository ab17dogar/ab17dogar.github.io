# Portfolio Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the agreed reference-inspired features (project thumbnails, per-project platform links, "similar projects", a tag category filter, the user's photo, richer hero stats, and a "worked with & studied at" strip) to the existing Astro portfolio without changing its theme, colors, layout, or look.

**Architecture:** Purely additive. Pure logic lives in a new tested `src/lib/projects.ts`. The existing GitHub-sync project pipeline is extended with optional frontmatter fields. Existing components (`ProjectCard`, `ProjectGrid`, `HeroBento`, `work/[slug].astro`, `index.astro`) are enhanced in place using only existing Tailwind tokens / `.glass` styles. One new presentational component (`WorkedWith.astro`) is added.

**Tech Stack:** Astro 5, React 19, Tailwind v4 (`@theme` tokens), framer-motion, vitest (node env, `src/**/*.test.ts`), bun (installed) for `bun run build` / `bun run test`.

**Global constraints (apply to every task):**
- **Do NOT `git push`, open PRs, or use GitHub MCP writes.** All commits are local until the user explicitly approves a push.
- Git author stays `Abu Bakar <abu.bakar@uni-rostock.de>`. End every commit message with the `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` trailer.
- No new colors/fonts/spacing. Reuse existing tokens (`bg`, `surface`, `line`, `text`, `muted`, `primary` `#a78bfa`, `accent` `#22d3ee`, `code` `#f0abfc`, `success`), `.glass`, `.text-gradient`, and the `// label` mono pattern.
- Do not change `siteData.email` or any existing content values (the siteData test asserts the email).

---

## File Structure

- **Create** `src/lib/projects.ts` — pure helpers: `initials`, `gradientFor`, `normalizeLinks`, `similarProjects`, `allTags`, plus `ProjectLink` type and `GRADIENTS`.
- **Create** `src/lib/projects.test.ts` — vitest tests for the helpers.
- **Create** `src/components/WorkedWith.astro` — "worked with & studied at" strip.
- **Create** `public/my_pic.jpeg` — copied from `~/Downloads/Personal_projects/my_pic.jpeg`.
- **Modify** `src/data/siteData.ts` — add `Org` interface + `orgs` array.
- **Modify** `src/lib/github-projects.ts` — add `image`/`webapp`/`appstore`/`playstore`/`links` to interface + parsing + FALLBACK samples.
- **Modify** `src/components/ProjectCard.tsx` — thumbnail (image or generated) + platform link chips; extend `ProjectCardData`.
- **Modify** `src/components/ProjectGrid.tsx` — tag category filter with animated reflow.
- **Modify** `src/components/HeroBento.astro` — photo tile + two extra stats (accept `projectCount` prop).
- **Modify** `src/pages/index.astro` — pass `image`/`links`/`tags` to cards, pass `projectCount` to hero, render `WorkedWith` after the hero.
- **Modify** `src/pages/work/[slug].astro` — banner image, platform buttons, "similar projects" block.

---

## Task 1: Pure project helpers (TDD)

**Files:**
- Create: `src/lib/projects.ts`
- Test: `src/lib/projects.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/projects.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { initials, gradientFor, normalizeLinks, similarProjects, allTags, GRADIENTS } from './projects';

describe('initials', () => {
  it('takes the first letter of the first two words, uppercased', () => {
    expect(initials('VetraPath — Monte Carlo Path Tracer')).toBe('VM');
    expect(initials('RGB-D Semantic Scene Graphs')).toBe('RS');
  });
  it('uses the first two chars for a single word', () => {
    expect(initials('Solo')).toBe('SO');
  });
  it('falls back to ? for empty input', () => {
    expect(initials('   ')).toBe('?');
  });
});

describe('gradientFor', () => {
  it('is deterministic for the same seed', () => {
    expect(gradientFor('project-csi')).toBe(gradientFor('project-csi'));
  });
  it('always returns one of the known theme gradients', () => {
    expect(GRADIENTS).toContain(gradientFor('rgbd-scene-graph'));
    expect(gradientFor('anything').startsWith('linear-gradient(')).toBe(true);
  });
});

describe('normalizeLinks', () => {
  it('maps dedicated fields to ordered labelled links', () => {
    expect(normalizeLinks({ webapp: 'w', appstore: 'a', playstore: 'p', demo: 'd' })).toEqual([
      { label: 'Web App', href: 'w' },
      { label: 'iOS App', href: 'a' },
      { label: 'Android', href: 'p' },
      { label: 'Live Demo', href: 'd' },
    ]);
  });
  it('returns an empty array when nothing is set', () => {
    expect(normalizeLinks({})).toEqual([]);
  });
  it('appends generic links after dedicated ones', () => {
    expect(normalizeLinks({ demo: 'd', links: [{ label: 'Docs', href: 'x' }] })).toEqual([
      { label: 'Live Demo', href: 'd' },
      { label: 'Docs', href: 'x' },
    ]);
  });
});

describe('similarProjects', () => {
  const all = [
    { slug: 'a', tags: ['x', 'y'] },
    { slug: 'b', tags: ['x'] },
    { slug: 'c', tags: ['y', 'z'] },
    { slug: 'd', tags: ['w'] },
  ];
  it('ranks by shared-tag overlap, excludes self and zero-overlap', () => {
    expect(similarProjects(all[0], all).map((p) => p.slug)).toEqual(['b', 'c']);
  });
  it('respects the limit', () => {
    expect(similarProjects(all[0], all, 1).map((p) => p.slug)).toEqual(['b']);
  });
});

describe('allTags', () => {
  it('returns the sorted unique union of tags', () => {
    expect(allTags([{ tags: ['b', 'a'] }, { tags: ['a', 'c'] }])).toEqual(['a', 'b', 'c']);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun run test`
Expected: FAIL — `Failed to resolve import "./projects"` / functions not defined.

- [ ] **Step 3: Write the implementation**

Create `src/lib/projects.ts`:

```ts
export interface ProjectLink {
  label: string;
  href: string;
}

// Generated-thumbnail gradients — composed only from existing theme tokens
// (primary #a78bfa, accent #22d3ee, code #f0abfc). No new colors are introduced.
export const GRADIENTS = [
  'linear-gradient(135deg, #a78bfa, #22d3ee)',
  'linear-gradient(135deg, #22d3ee, #f0abfc)',
  'linear-gradient(135deg, #f0abfc, #a78bfa)',
  'linear-gradient(135deg, #a78bfa, #f0abfc)',
] as const;

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic theme gradient for a seed (used for generated project thumbnails). */
export function gradientFor(seed: string): string {
  return GRADIENTS[hash(seed) % GRADIENTS.length];
}

/** Initials for a generated thumbnail: first letters of the first two alphanumeric words. */
export function initials(title: string): string {
  const words = title.split(/\s+/).filter((w) => /^[a-z0-9]/i.test(w));
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

interface LinkSource {
  demo?: string | null;
  webapp?: string | null;
  appstore?: string | null;
  playstore?: string | null;
  links?: ProjectLink[] | null;
}

/** Merge dedicated platform fields + a generic links[] into one ordered, present-only list. */
export function normalizeLinks(p: LinkSource): ProjectLink[] {
  const out: ProjectLink[] = [];
  if (p.webapp) out.push({ label: 'Web App', href: p.webapp });
  if (p.appstore) out.push({ label: 'iOS App', href: p.appstore });
  if (p.playstore) out.push({ label: 'Android', href: p.playstore });
  if (p.demo) out.push({ label: 'Live Demo', href: p.demo });
  if (p.links) for (const l of p.links) if (l && l.href && l.label) out.push({ label: l.label, href: l.href });
  return out;
}

/** Other projects ranked by shared-tag overlap (excludes self + zero-overlap), capped at `limit`. */
export function similarProjects<T extends { slug: string; tags: string[] }>(
  current: T,
  all: T[],
  limit = 3,
): T[] {
  const cur = new Set(current.tags);
  return all
    .filter((p) => p.slug !== current.slug)
    .map((p) => ({ p, overlap: p.tags.filter((t) => cur.has(t)).length }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((x) => x.p);
}

/** Sorted unique union of all tags across projects (for the category filter). */
export function allTags(projects: { tags: string[] }[]): string[] {
  const set = new Set<string>();
  for (const p of projects) for (const t of p.tags) set.add(t);
  return [...set].sort();
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun run test`
Expected: PASS — all suites green (existing `siteData` + `format` suites still pass too).

- [ ] **Step 5: Commit**

```bash
git add src/lib/projects.ts src/lib/projects.test.ts
git commit -m "feat: add tested project helpers (initials, gradient, links, similar, tags)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Add the photo asset

**Files:**
- Create: `public/my_pic.jpeg` (copied from `~/Downloads/Personal_projects/my_pic.jpeg`)

- [ ] **Step 1: Copy the file**

Run:
```bash
cp ~/Downloads/Personal_projects/my_pic.jpeg ~/Downloads/Personal_projects/portfolio/public/my_pic.jpeg
```

- [ ] **Step 2: Verify it landed**

Run: `ls -la ~/Downloads/Personal_projects/portfolio/public/my_pic.jpeg`
Expected: file listed, non-zero size (~500 KB).

- [ ] **Step 3: Commit**

```bash
git add public/my_pic.jpeg
git commit -m "chore: add profile photo asset (my_pic.jpeg)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Add `orgs` to siteData

**Files:**
- Modify: `src/data/siteData.ts`

- [ ] **Step 1: Add the `Org` interface**

In `src/data/siteData.ts`, add this interface next to the other interface declarations (after the `Education` interface near the top):

```ts
export interface Org { name: string; href?: string }
```

- [ ] **Step 2: Add the `orgs` array**

Inside the `siteData` object, immediately after the `education: [ ... ] as Education[],` block, add:

```ts
  // "Worked with & studied at" strip
  orgs: [
    { name: 'Careem (Uber · e&)', href: 'https://www.careem.com' },
    { name: 'NorthBay Solutions', href: 'https://www.northbaysolutions.com' },
    { name: 'Universität Rostock', href: 'https://www.uni-rostock.de' },
    { name: 'Forman Christian College University', href: 'https://www.fccollege.edu.pk' },
    { name: 'AWS Certified Cloud Practitioner' },
  ] as Org[],
```

- [ ] **Step 3: Verify the existing tests still pass**

Run: `bun run test`
Expected: PASS — `siteData` suite unchanged (email/name/socials untouched).

- [ ] **Step 4: Commit**

```bash
git add src/data/siteData.ts
git commit -m "feat(data): add orgs list for worked-with strip

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Extend the GitHub project pipeline with image + links

**Files:**
- Modify: `src/lib/github-projects.ts`

- [ ] **Step 1: Extend the `GithubProject` interface**

In `src/lib/github-projects.ts`, add an import at the top of the file (after the `import matter` line):

```ts
import type { ProjectLink } from './projects';
```

Then in the `GithubProject` interface, add these fields right after the existing `demo?: string;` line:

```ts
  image?: string;       // thumbnail/banner URL (optional; generated fallback otherwise)
  webapp?: string;      // "Web App" link
  appstore?: string;    // "iOS App" link
  playstore?: string;   // "Android" link
  links?: ProjectLink[]; // extra custom { label, href } links
```

- [ ] **Step 2: Parse the new fields**

In `fetchProjects`, inside the returned object literal, add these lines right after the existing `demo: data.demo as string | undefined,` line:

```ts
          image: data.image as string | undefined,
          webapp: data.webapp as string | undefined,
          appstore: data.appstore as string | undefined,
          playstore: data.playstore as string | undefined,
          links: Array.isArray(data.links) ? (data.links as ProjectLink[]) : undefined,
```

- [ ] **Step 3: Seed the FALLBACK entries with sample links**

So the new link chips are visible even when GitHub is unreachable at build, update the two `FALLBACK` entries. Add a `demo` to the first and a `webapp` to the second (leave `image` unset so the generated thumbnail path is exercised):

Change the first FALLBACK object's tail from:
```ts
repoUrl: 'https://github.com/ab17dogar/Project-CSI', language: 'C++', stars: 0, order: 1, current: false, body: '' },
```
to:
```ts
repoUrl: 'https://github.com/ab17dogar/Project-CSI', demo: 'https://github.com/ab17dogar/Project-CSI', language: 'C++', stars: 0, order: 1, current: false, body: '' },
```

Change the second FALLBACK object's tail from:
```ts
repoUrl: 'https://github.com/ab17dogar/rgbd-scene-graph', language: 'Python', stars: 0, order: 2, current: true, body: '' },
```
to:
```ts
repoUrl: 'https://github.com/ab17dogar/rgbd-scene-graph', webapp: 'https://github.com/ab17dogar/rgbd-scene-graph', language: 'Python', stars: 0, order: 2, current: true, body: '' },
```

- [ ] **Step 4: Verify it compiles**

Run: `bun run build`
Expected: build succeeds (project pages still generate). Note the printed page list includes `/work/...` routes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/github-projects.ts
git commit -m "feat(projects): parse image + platform link frontmatter; seed fallbacks

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Create the "Worked with & studied at" strip

**Files:**
- Create: `src/components/WorkedWith.astro`

- [ ] **Step 1: Create the component**

Create `src/components/WorkedWith.astro`:

```astro
---
import { siteData } from '../data/siteData';
---
<section class="py-8">
  <p class="mb-4 font-mono text-xs uppercase tracking-[0.12em] text-muted">// worked with &amp; studied at</p>
  <div class="flex flex-wrap items-center gap-2">
    {siteData.orgs.map((o) => (
      o.href ? (
        <a
          href={o.href}
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-full border border-line bg-white/[0.03] px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-primary/40 hover:text-text"
        >{o.name}</a>
      ) : (
        <span class="rounded-full border border-line bg-white/[0.03] px-3 py-1 font-mono text-xs text-muted">{o.name}</span>
      )
    ))}
  </div>
</section>
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run build`
Expected: build succeeds (the component is not yet referenced; this just confirms valid syntax).

- [ ] **Step 3: Commit**

```bash
git add src/components/WorkedWith.astro
git commit -m "feat(ui): add 'worked with & studied at' strip component

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Project card — thumbnail + platform link chips

**Files:**
- Modify: `src/components/ProjectCard.tsx`

- [ ] **Step 1: Update imports and the data interface**

In `src/components/ProjectCard.tsx`, change the top imports from:
```tsx
import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
```
to:
```tsx
import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gradientFor, initials, type ProjectLink } from '../lib/projects';
```

Then in the `ProjectCardData` interface, add these two fields right after the existing `demo?: string;` line:
```tsx
  image?: string;
  links?: ProjectLink[];
```

- [ ] **Step 2: Add the thumbnail as the first child of the content column**

Find the content wrapper:
```tsx
      {/* Content is click-through (so the stretched link wins) except the GitHub icon */}
      <div className="pointer-events-none relative z-20 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
```
Insert the thumbnail block immediately after the opening `<div className="pointer-events-none relative z-20 flex flex-1 flex-col">` line and before `<div className="flex items-start justify-between gap-3">`:

```tsx
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-[10px] border border-line">
          {project.image ? (
            <img src={project.image} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: gradientFor(project.title) }}
            >
              <span className="font-mono text-2xl font-bold text-bg/80">{initials(project.title)}</span>
            </div>
          )}
        </div>
```

- [ ] **Step 3: Add the platform link chips above the footer**

Find the footer block:
```tsx
        {/* Footer pinned to the bottom so "click for details" aligns across all cards */}
        <div className="mt-auto flex items-center gap-3 pt-4 font-mono text-[11px] text-muted">
```
Insert the link-chip block immediately BEFORE that footer comment line:

```tsx
        {project.links && project.links.length > 0 && (
          <div className="pointer-events-auto mt-3 flex flex-wrap gap-1.5">
            {project.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded border border-line bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-muted transition-colors hover:border-primary/40 hover:text-text"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
```

(The `pointer-events-auto` chips sit inside the `z-20` content layer, so — exactly like the existing GitHub icon — they remain clickable while the rest of the card routes to the detail page.)

- [ ] **Step 4: Verify it compiles**

Run: `bun run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectCard.tsx
git commit -m "feat(ui): project card thumbnail (image or generated) + platform link chips

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Project grid — tag category filter

**Files:**
- Modify: `src/components/ProjectGrid.tsx`

- [ ] **Step 1: Replace the component with the filterable version**

Replace the entire contents of `src/components/ProjectGrid.tsx` with:

```tsx
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ProjectCard, { type ProjectCardData } from './ProjectCard';
import { allTags } from '../lib/projects';

interface Props {
  projects: ProjectCardData[];
}

export default function ProjectGrid({ projects }: Props) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string>('All');

  if (projects.length === 0) {
    return <p className="font-mono text-sm text-muted">No projects yet.</p>;
  }

  const filters = ['All', ...allTags(projects)];
  const shown = active === 'All' ? projects : projects.filter((p) => p.tags.includes(active));

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActive(f)}
            aria-pressed={active === f}
            className={
              active === f
                ? 'rounded-full border border-primary/40 bg-primary/15 px-3 py-1 font-mono text-xs text-primary transition-colors'
                : 'rounded-full border border-line bg-white/[0.03] px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-primary/40 hover:text-text'
            }
          >
            {f}
          </button>
        ))}
      </div>

      <motion.div layout={!reduce} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shown.map((p) => (
          <motion.div
            key={p.repoUrl}
            layout={!reduce}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <ProjectCard project={p} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectGrid.tsx
git commit -m "feat(ui): tag category filter for the projects grid

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Hero — photo tile + richer stats

**Files:**
- Modify: `src/components/HeroBento.astro`

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/components/HeroBento.astro` with the version below. It keeps the exact same tile/grid language; it adds (a) a `projectCount` prop, (b) a photo tile in the right column, and (c) two derived stats so the right column shows a 2×2 stat cluster under the photo.

```astro
---
import { siteData } from '../data/siteData';
import RotatingRole from './react/RotatingRole.tsx';
import CountUp from './react/CountUp.tsx';
import Reveal from './react/Reveal.tsx';

interface Props { projectCount?: number }
const { projectCount = 0 } = Astro.props;

const stats = [
  ...siteData.stats,
  { key: 'projects', value: `${projectCount}+`, sub: 'shipped & synced' },
  { key: 'domains', value: `${siteData.focusAreas.length}`, sub: 'focus areas' },
];
---
<section class="py-14 sm:py-20">
  <div class="grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr] md:grid-rows-[auto_1fr]">
    <!-- Main tile -->
    <Reveal client:load className="glass relative row-span-2 overflow-hidden p-7 sm:p-9">
      <div class="absolute -right-1/5 -top-2/5 h-[120%] w-3/5" style="background:radial-gradient(circle,rgba(167,139,250,.30),transparent 60%)"></div>
      {siteData.available && (
        <span class="relative inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/15 px-3 py-1 font-mono text-xs text-success">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-success" style="box-shadow:0 0 8px #22c55e"></span>
          Available for work · 2026
        </span>
      )}
      <h1 class="relative mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
        Building <span class="text-gradient">resilient</span> systems.
      </h1>
      <p class="relative mt-5 max-w-xl text-base text-muted sm:text-lg">{siteData.bio}</p>
      <p class="relative mt-6 font-mono text-sm text-muted">
        <span class="text-accent">$</span> role:
        <RotatingRole client:visible roles={[...siteData.roles]} className="text-text" />
      </p>
    </Reveal>

    <!-- Photo tile -->
    <Reveal client:load delay={0.08} className="glass flex items-center gap-4 overflow-hidden p-6">
      <img
        src="/my_pic.jpeg"
        alt={siteData.name}
        width="80"
        height="80"
        class="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-primary/50"
        style="box-shadow:0 0 28px rgba(167,139,250,.40)"
      />
      <div>
        <p class="text-lg font-semibold tracking-tight">{siteData.name}</p>
        <p class="mt-1 font-mono text-xs text-muted">{siteData.role}</p>
        <p class="mt-0.5 font-mono text-xs text-muted">{siteData.location}</p>
      </div>
    </Reveal>

    <!-- Stat tiles (2x2) -->
    <Reveal client:load delay={0.16} className="grid grid-cols-2 gap-4">
      {stats.map((stat) => (
        <div class="glass p-5">
          <p class="font-mono text-xs uppercase tracking-[0.12em] text-muted">// {stat.key}</p>
          {/^\d/.test(stat.value) ? (
            <p class="mt-2 text-3xl font-bold">
              <CountUp client:visible to={parseInt(stat.value, 10)} suffix={stat.value.replace(/^\d+/, '')} />
            </p>
          ) : (
            <p class="mt-2 text-xl font-bold leading-snug">{stat.value}</p>
          )}
          <p class="mt-1 text-sm text-muted">{stat.sub}</p>
        </div>
      ))}
    </Reveal>
  </div>
</section>
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run build`
Expected: build succeeds. (The hero still has the big tile on the left; the right column now shows the photo tile above a 2×2 stat cluster.)

- [ ] **Step 3: Commit**

```bash
git add src/components/HeroBento.astro
git commit -m "feat(ui): hero photo tile + project-count & focus-area stats

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Wire the homepage (cards data + hero count + worked-with)

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Import the helper and the new component**

In `src/pages/index.astro`, add these two imports with the other component imports (after the `import ContactForm ...` line and the existing `import { getGithubProjects } ...` line):

```ts
import WorkedWith from '../components/WorkedWith.astro';
import { normalizeLinks } from '../lib/projects';
```

- [ ] **Step 2: Pass `image` + `links` through to the cards**

Replace the existing `projects` mapping:
```ts
const projects = (await getGithubProjects()).map((p) => ({
  title: p.title,
  summary: p.summary,
  tags: p.tags,
  stack: p.stack,
  href: `/work/${p.slug}`,
  repoUrl: p.repoUrl,
  demo: p.demo,
  language: p.language,
  stars: p.stars,
  current: p.current,
}));
```
with:
```ts
const projects = (await getGithubProjects()).map((p) => ({
  title: p.title,
  summary: p.summary,
  tags: p.tags,
  stack: p.stack,
  href: `/work/${p.slug}`,
  repoUrl: p.repoUrl,
  demo: p.demo,
  image: p.image,
  links: normalizeLinks(p),
  language: p.language,
  stars: p.stars,
  current: p.current,
}));
```

- [ ] **Step 3: Render the worked-with strip after the hero and pass the count**

Replace:
```astro
  <HeroBento />

  <section id="about" class="scroll-mt-24">
```
with:
```astro
  <HeroBento projectCount={projects.length} />

  <WorkedWith />

  <section id="about" class="scroll-mt-24">
```

- [ ] **Step 4: Verify it compiles**

Run: `bun run build`
Expected: build succeeds; homepage renders hero (with count) + worked-with strip + filterable project grid with thumbnails.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(home): wire card image/links, hero project count, worked-with strip

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: Project detail page — banner, platform buttons, similar projects

**Files:**
- Modify: `src/pages/work/[slug].astro`

- [ ] **Step 1: Import helpers and compute links + similar in the frontmatter**

In `src/pages/work/[slug].astro`, replace the frontmatter block:
```astro
---
import { marked } from 'marked';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getGithubProjects } from '../../lib/github-projects';

export async function getStaticPaths() {
  const projects = await getGithubProjects();
  return projects.map((project) => ({ params: { slug: project.slug }, props: { project } }));
}

const { project } = Astro.props;
const bodyHtml = project.body ? (marked.parse(project.body) as string) : '';
---
```
with:
```astro
---
import { marked } from 'marked';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getGithubProjects } from '../../lib/github-projects';
import { normalizeLinks, similarProjects, gradientFor, initials } from '../../lib/projects';

export async function getStaticPaths() {
  const projects = await getGithubProjects();
  return projects.map((project) => ({ params: { slug: project.slug }, props: { project } }));
}

const { project } = Astro.props;
const bodyHtml = project.body ? (marked.parse(project.body) as string) : '';
const links = normalizeLinks(project);
const allProjects = await getGithubProjects();
const similar = similarProjects(project, allProjects);
---
```

- [ ] **Step 2: Add the banner above the tags line**

Replace:
```astro
    <a href="/#projects" class="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-primary/40 hover:text-text">
      ← Back to projects
    </a>
    <p class="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">// {project.tags.join(' · ')}</p>
```
with:
```astro
    <a href="/#projects" class="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-primary/40 hover:text-text">
      ← Back to projects
    </a>

    <div class="mt-8 aspect-[2.4/1] w-full overflow-hidden rounded-[14px] border border-line">
      {project.image ? (
        <img src={project.image} alt="" class="h-full w-full object-cover" />
      ) : (
        <div class="flex h-full w-full items-center justify-center" style={`background:${gradientFor(project.slug)}`}>
          <span class="font-mono text-5xl font-bold text-bg/80">{initials(project.title)}</span>
        </div>
      )}
    </div>

    <p class="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">// {project.tags.join(' · ')}</p>
```

- [ ] **Step 3: Replace the single demo button with the normalized platform links**

Replace:
```astro
      {project.demo && (
        <a href={project.demo} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-text">
          Live demo →
        </a>
      )}
```
with:
```astro
      {links.map((l) => (
        <a href={l.href} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-text">
          {l.label} →
        </a>
      ))}
```

- [ ] **Step 4: Add the "Similar projects" block before `</article>`**

Replace:
```astro
    {bodyHtml && <div class="prose-portfolio mt-10 max-w-2xl" set:html={bodyHtml} />}
  </article>
```
with:
```astro
    {bodyHtml && <div class="prose-portfolio mt-10 max-w-2xl" set:html={bodyHtml} />}

    {similar.length > 0 && (
      <section class="mt-16">
        <h2 class="font-mono text-xs uppercase tracking-[0.12em] text-muted">// similar projects</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {similar.map((s) => (
            <a href={`/work/${s.slug}`} class="glass block p-5 transition-colors hover:border-primary/40">
              <p class="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">// {s.tags.join(' · ')}</p>
              <h3 class="mt-2 font-semibold tracking-tight">{s.title}</h3>
              <p class="mt-1 line-clamp-2 text-sm text-muted">{s.summary}</p>
            </a>
          ))}
        </div>
      </section>
    )}
  </article>
```

- [ ] **Step 5: Verify it compiles**

Run: `bun run build`
Expected: build succeeds; each `/work/<slug>` page now has a banner, platform buttons (from links), and a similar-projects block when overlaps exist.

- [ ] **Step 6: Commit**

```bash
git add src/pages/work/[slug].astro
git commit -m "feat(detail): banner, platform buttons, and similar-projects block

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `bun run test`
Expected: PASS — `projects`, `siteData`, and `format` suites all green.

- [ ] **Step 2: Run a clean production build**

Run: `bun run build`
Expected: build completes with no errors; output lists the homepage and all `/work/<slug>` routes.

- [ ] **Step 3: Smoke-test in the browser**

Run: `bun run dev` (then open the printed URL, typically `http://localhost:4321`).
Verify visually, then stop the dev server:
- Hero shows the photo tile + four stat tiles; "// worked with & studied at" strip renders beneath the hero.
- Project cards show thumbnails (generated gradient + initials when no image) and platform link chips on the fallback/seeded projects.
- The projects filter pills switch the visible cards; "All" restores the full set.
- A project detail page shows the banner, platform buttons, and (when tags overlap) a "Similar projects" block.
- Theme/colors/spacing are unchanged from before.

- [ ] **Step 4: Confirm nothing is pushed**

Run: `git status -sb && git log --oneline -12`
Expected: branch is **ahead of origin/main** by the new commits, all local. **Do not push.** Report the commit list to the user and ask whether to push.

---

## Self-Review (completed during planning)

- **Spec coverage:** thumbnails (T6/T10), platform links (T1 `normalizeLinks`, T4 parse, T6 chips, T10 buttons), similar projects (T1 `similarProjects`, T10), category filter (T1 `allTags`, T7), photo (T2, T8), richer stats (T8), worked-with strip (T3, T5, T9). All spec scope items mapped.
- **Placeholder scan:** no TBD/TODO; every code step shows complete code.
- **Type consistency:** `ProjectLink` defined once in `src/lib/projects.ts` and imported by `github-projects.ts`, `ProjectCard.tsx`, `index.astro`, `work/[slug].astro`. `ProjectCardData` gains `image`/`links`; `index.astro` supplies both. `normalizeLinks`/`similarProjects`/`allTags`/`gradientFor`/`initials` signatures match all call sites.
- **Out of scope honored:** no testimonials, no theme toggle, no email change, no edits to remote `portfolio-content.md`, no push.
