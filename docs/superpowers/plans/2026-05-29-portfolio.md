# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Abu Bakar's "Neural Glass Bento" portfolio — a dark, glassmorphic, animated multi-page site — and deploy it to GitHub Pages at `ab17dogar.github.io`.

**Architecture:** Astro 5 static site (ships ~0 JS by default). Static content rendered by Astro; only interactive bits (skills grid, project-card cursor spotlight, count-ups, rotating role text, scroll reveals) are React 19 islands using Framer Motion. Content (projects, research, posts) lives in typed Astro content collections (MDX); identity/skills/socials live in one `siteData.ts`. Styling via Tailwind v4 with design tokens defined in CSS `@theme`.

**Tech Stack:** Astro 5, React 19 (`@astrojs/react`), Tailwind CSS v4 (`@tailwindcss/vite`), Framer Motion, MDX (`@astrojs/mdx`), sitemap + RSS (`@astrojs/sitemap`, `@astrojs/rss`), Vitest for unit tests, self-hosted fonts via Fontsource (Inter + JetBrains Mono), GitHub Actions deploy (`withastro/action`).

**Working directory:** `/Users/abubakar/portfolio` (already a git repo; contains `docs/` spec + plan and `.gitignore`).

---

## File Structure

```
astro.config.mjs              # site/base, integrations, vite tailwind plugin
tsconfig.json                 # strict TS
vitest.config.ts              # test runner config
package.json

src/
  styles/
    global.css                # Tailwind import + @theme tokens + base/utility styles
  data/
    siteData.ts               # name, bio, socials, skills, stats, nav — single source of truth
    siteData.test.ts          # shape/integrity tests
  lib/
    format.ts                 # date + sorting + reading-time helpers
    format.test.ts            # helper tests
  content.config.ts           # zod schemas for projects/research/posts collections
  content/
    projects/                 # *.mdx project entries
    research/                  # *.mdx research entries
    posts/                     # *.mdx blog posts
  components/
    BackgroundFX.astro        # grid + drifting gradient blobs
    Nav.astro                 # top nav + mobile drawer
    Footer.astro              # socials + copyright
    SEO.astro                 # meta/OG/twitter tags
    HeroBento.astro           # bento hero (uses RotatingRole, CountUp islands)
    AboutTeaser.astro
    SkillsGrid.tsx            # React island
    ProjectCard.tsx           # React island (cursor spotlight)
    ProjectGrid.tsx           # React island (filter + grid of ProjectCard)
    ResearchList.astro
    BlogList.astro
    ContactCTA.astro
    react/
      Reveal.tsx              # scroll-reveal wrapper island
      CountUp.tsx             # count-up island
      RotatingRole.tsx        # rotating role text island
      useReducedMotion.ts     # shared reduced-motion hook re-export
  layouts/
    BaseLayout.astro          # <html>, head (SEO), BackgroundFX, Nav, slot, Footer
    PostLayout.astro          # article wrapper + ToC for posts
  pages/
    index.astro               # home
    work/index.astro          # all projects
    work/[...slug].astro      # project detail
    research/index.astro      # research/publications
    writing/index.astro       # blog index
    writing/[...slug].astro   # blog post
    about.astro               # long-form bio + resume
    404.astro                 # custom not found
    rss.xml.ts                # blog RSS feed
  assets/
    (project covers, og images)

public/
  resume.pdf                  # downloadable resume (placeholder until provided)
  favicon.svg
  CNAME                       # created ONLY when a custom domain is added (not in v1)

.github/workflows/deploy.yml  # build + deploy to GitHub Pages
```

---

## Task 1: Scaffold Astro + integrations + Tailwind v4

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`, `src/pages/index.astro`
- Verify against: working dev server

- [ ] **Step 1: Scaffold a minimal Astro project into the existing repo**

Run (from `/Users/abubakar/portfolio`):
```bash
npm create astro@latest . -- --template minimal --no-install --no-git --skip-houston --typescript strict
```
When prompted that the directory is not empty, choose to continue (it will not overwrite `docs/`, `.git/`, `.gitignore`, `.superpowers/`).

- [ ] **Step 2: Add React, MDX, sitemap integrations**

Run:
```bash
npx astro add react mdx sitemap --yes
```
Expected: installs `@astrojs/react`, `@astrojs/mdx`, `@astrojs/sitemap` and wires them into `astro.config.mjs`.

- [ ] **Step 3: Install remaining dependencies**

Run:
```bash
npm install tailwindcss @tailwindcss/vite framer-motion @astrojs/rss @fontsource-variable/inter @fontsource-variable/jetbrains-mono
npm install -D vitest
```

- [ ] **Step 4: Configure `astro.config.mjs`**

Replace the file with:
```js
// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Single source of truth for the deployed origin.
// To move to a custom domain later: change `site` and add public/CNAME. `base` stays '/'.
export default defineConfig({
  site: 'https://ab17dogar.github.io',
  base: '/',
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 5: Create `src/styles/global.css` (minimal for now, tokens come in Task 2)**

```css
@import "tailwindcss";

body {
  background-color: #06060d;
  color: #f8fafc;
}
```

- [ ] **Step 6: Replace `src/pages/index.astro` with a smoke-test page**

```astro
---
import '../styles/global.css';
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Abu Bakar</title>
  </head>
  <body>
    <main class="p-8">
      <h1 class="text-3xl font-bold">Scaffold OK</h1>
    </main>
  </body>
</html>
```

- [ ] **Step 7: Run the dev server and verify**

Run:
```bash
npm run dev
```
Expected: server starts on `http://localhost:4321`; visiting it shows "Scaffold OK" on a dark background. Stop with Ctrl-C.

- [ ] **Step 8: Verify production build works**

Run:
```bash
npm run build
```
Expected: build completes with no errors; `dist/index.html` exists.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro + React + Tailwind v4 + MDX

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Design tokens, fonts, global styles, BackgroundFX

**Files:**
- Modify: `src/styles/global.css`
- Create: `src/components/BackgroundFX.astro`

- [ ] **Step 1: Write the full token system into `src/styles/global.css`**

```css
@import "tailwindcss";
@import "@fontsource-variable/inter";
@import "@fontsource-variable/jetbrains-mono";

@theme {
  /* Colors (semantic) */
  --color-bg: #06060d;
  --color-surface: rgba(255, 255, 255, 0.04);
  --color-line: rgba(255, 255, 255, 0.08);
  --color-text: #f8fafc;
  --color-muted: #94a3b8;
  --color-primary: #a78bfa;
  --color-accent: #22d3ee;
  --color-success: #22c55e;
  --color-code: #f0abfc;

  /* Fonts (Inter as display+body fallback for Geist; JetBrains Mono for mono) */
  --font-sans: "Inter Variable", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono Variable", ui-monospace, "SF Mono", Menlo, monospace;

  /* Radii */
  --radius-tile: 14px;
  --radius-chip: 4px;
}

:root {
  color-scheme: dark;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "tnum";
}

/* Headline gradient text */
.text-gradient {
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Glass tile */
.glass {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-tile);
}

/* Focus ring */
:where(a, button, [tabindex]):focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Drifting blobs (disabled under reduced motion via the media query above) */
@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(3%, 4%) scale(1.08); }
}
```

- [ ] **Step 2: Create `src/components/BackgroundFX.astro`**

```astro
---
// Fixed full-viewport decorative background: masked grid + two drifting gradient blobs.
// Purely decorative -> aria-hidden.
---
<div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
  <div
    class="absolute inset-0"
    style="
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 32px 32px;
      -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
      mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
    "
  ></div>
  <div
    class="absolute -left-1/4 -top-1/4 h-[60vmax] w-[60vmax] rounded-full"
    style="background: radial-gradient(circle, rgba(167,139,250,0.22), transparent 60%); animation: drift 18s ease-in-out infinite;"
  ></div>
  <div
    class="absolute -bottom-1/4 -right-1/4 h-[55vmax] w-[55vmax] rounded-full"
    style="background: radial-gradient(circle, rgba(34,211,238,0.16), transparent 60%); animation: drift 22s ease-in-out infinite reverse;"
  ></div>
</div>
```

- [ ] **Step 3: Temporarily wire BackgroundFX into the home page to verify**

In `src/pages/index.astro`, import and render `<BackgroundFX />` inside `<body>` above `<main>`:
```astro
---
import '../styles/global.css';
import BackgroundFX from '../components/BackgroundFX.astro';
---
```
```astro
  <body>
    <BackgroundFX />
    <main class="p-8">
      <h1 class="text-4xl font-bold text-gradient">Tokens OK</h1>
      <p class="mt-4 font-mono text-muted">// background + gradient + glass</p>
      <div class="glass mt-6 p-6 max-w-sm">Glass tile</div>
    </main>
  </body>
```

- [ ] **Step 4: Verify in browser**

Run `npm run dev`, open `http://localhost:4321`. Expected: dark bg, faint grid fading at edges, two soft violet/cyan blobs slowly drifting, gradient heading, a frosted glass tile. Toggle OS "reduce motion" → blobs stop drifting. Stop server.

- [ ] **Step 5: Verify build**

Run `npm run build`. Expected: success.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: design tokens, fonts, global styles, animated background

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `siteData.ts` (single source of truth) — TDD

**Files:**
- Create: `src/data/siteData.ts`, `src/data/siteData.test.ts`, `vitest.config.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

Add a test script to `package.json` `"scripts"`:
```json
"test": "vitest run"
```

- [ ] **Step 2: Write the failing test `src/data/siteData.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { siteData } from './siteData';

describe('siteData', () => {
  it('has core identity fields', () => {
    expect(siteData.name).toBe('Abu Bakar');
    expect(siteData.email).toBe('10abdogar@gmail.com');
    expect(siteData.location).toMatch(/Rostock/);
  });

  it('has github + linkedin socials with valid urls', () => {
    const byKey = Object.fromEntries(siteData.socials.map((s) => [s.label.toLowerCase(), s.href]));
    expect(byKey.github).toBe('https://github.com/ab17dogar');
    expect(byKey.linkedin).toContain('abdogar17');
    siteData.socials.forEach((s) => expect(s.href).toMatch(/^https?:|^mailto:/));
  });

  it('exposes focus areas and at least 6 skills', () => {
    expect(siteData.focusAreas.length).toBeGreaterThanOrEqual(3);
    expect(siteData.skills.length).toBeGreaterThanOrEqual(6);
    siteData.skills.forEach((s) => expect(typeof s.name).toBe('string'));
  });

  it('every nav item has a root-relative href', () => {
    siteData.nav.forEach((n) => expect(n.href.startsWith('/')).toBe(true));
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./siteData`.

- [ ] **Step 4: Create `src/data/siteData.ts`**

```ts
export interface Social { label: string; href: string }
export interface Skill { name: string; level: 'core' | 'strong' | 'familiar' }
export interface Stat { key: string; value: string; sub: string }
export interface NavItem { label: string; href: string }

export const siteData = {
  name: 'Abu Bakar',
  role: 'ML / AI Engineer & Full-Stack Developer',
  // Rotating words used by the hero RotatingRole island
  roles: ['ML engineer', 'full-stack developer', 'researcher'],
  tagline:
    'I build intelligent systems — from models to the products around them.',
  bio: 'ML/AI engineer and full-stack developer based in Rostock, Germany, working at Universität Rostock. I work across machine learning, computer vision, LLMs, cloud engineering, and distributed systems.',
  location: 'Rostock, Germany',
  affiliation: 'Universität Rostock',
  email: '10abdogar@gmail.com',
  resumeUrl: '/resume.pdf',
  available: true,

  focusAreas: [
    'AI / ML',
    'Computer Vision',
    'LLMs',
    'Cloud Engineering',
    'Distributed Systems',
  ],

  socials: [
    { label: 'GitHub', href: 'https://github.com/ab17dogar' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/abdogar17/' },
    { label: 'Email', href: 'mailto:10abdogar@gmail.com' },
  ] as Social[],

  nav: [
    { label: 'work', href: '/work' },
    { label: 'research', href: '/research' },
    { label: 'writing', href: '/writing' },
    { label: 'about', href: '/about' },
  ] as NavItem[],

  skills: [
    { name: 'Python', level: 'core' },
    { name: 'PyTorch', level: 'core' },
    { name: 'TypeScript', level: 'core' },
    { name: 'React', level: 'strong' },
    { name: 'Next.js', level: 'strong' },
    { name: 'FastAPI', level: 'strong' },
    { name: 'Docker', level: 'strong' },
    { name: 'Kubernetes', level: 'familiar' },
    { name: 'AWS', level: 'strong' },
    { name: 'PostgreSQL', level: 'strong' },
    { name: 'CUDA', level: 'familiar' },
    { name: 'LangChain', level: 'familiar' },
  ] as Skill[],

  stats: [
    { key: 'shipped', value: '12+', sub: 'projects & demos' },
    { key: 'focus', value: 'AI · CV · LLMs', sub: 'core domains' },
  ] as Stat[],
} as const;

export type SiteData = typeof siteData;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: siteData single source of truth + vitest

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Utility helpers (date/sort/reading-time) — TDD

**Files:**
- Create: `src/lib/format.ts`, `src/lib/format.test.ts`

- [ ] **Step 1: Write the failing test `src/lib/format.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { formatDate, sortByDateDesc, readingTime } from './format';

describe('formatDate', () => {
  it('formats an ISO date as "Mon D, YYYY"', () => {
    expect(formatDate(new Date('2026-05-29T00:00:00Z'))).toBe('May 29, 2026');
  });
});

describe('sortByDateDesc', () => {
  it('sorts newest first by the given key', () => {
    const items = [
      { d: new Date('2024-01-01') },
      { d: new Date('2026-01-01') },
      { d: new Date('2025-01-01') },
    ];
    const sorted = sortByDateDesc(items, (x) => x.d);
    expect(sorted.map((x) => x.d.getFullYear())).toEqual([2026, 2025, 2024]);
  });
});

describe('readingTime', () => {
  it('estimates minutes at ~200 wpm, min 1', () => {
    expect(readingTime('word '.repeat(400))).toBe('2 min read');
    expect(readingTime('short')).toBe('1 min read');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./format`.

- [ ] **Step 3: Create `src/lib/format.ts`**

```ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function sortByDateDesc<T>(items: T[], getDate: (item: T) => Date): T[] {
  return [...items].sort((a, b) => getDate(b).getTime() - getDate(a).getTime());
}

export function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: date/sort/reading-time helpers

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Content collections schema + example entries

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/projects/neurochat.mdx`, `src/content/projects/vision-pipeline.mdx`
- Create: `src/content/research/vfm-encoders.mdx`
- Create: `src/content/posts/hello-world.mdx`

- [ ] **Step 1: Create `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.enum(['ML', 'Web', 'Research', 'Cloud', 'LLM', 'CV'])),
    stack: z.array(z.string()),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    cover: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const research = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    abstract: z.string(),
    venue: z.string(),
    year: z.number(),
    link: z.string().url().optional(),
    pdf: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, research, posts };
```

- [ ] **Step 2: Create `src/content/projects/neurochat.mdx`**

```mdx
---
title: "NeuroChat — RAG Playground"
summary: "A chat app with retrieval over local documents: streamed responses, citations, and function calling."
tags: ["Web", "LLM"]
stack: ["Next.js", "LangChain", "pgvector", "TypeScript"]
repo: "https://github.com/ab17dogar"
featured: true
order: 1
---

## Overview

NeuroChat is a retrieval-augmented chat interface. It indexes local documents
into a vector store and answers questions with inline citations.

## Highlights

- Streaming token responses
- Source citations with jump-to-context
- Tool/function calling
```

- [ ] **Step 3: Create `src/content/projects/vision-pipeline.mdx`**

```mdx
---
title: "Vision Inference Pipeline"
summary: "A containerized computer-vision inference service: model serving, batching, and autoscaling on a Kubernetes cluster."
tags: ["ML", "CV", "Cloud"]
stack: ["PyTorch", "FastAPI", "Docker", "Kubernetes"]
repo: "https://github.com/ab17dogar"
featured: true
order: 2
---

## Overview

A production-style inference pipeline for computer-vision models with request
batching, GPU scheduling, and horizontal autoscaling.
```

- [ ] **Step 4: Create `src/content/research/vfm-encoders.mdx`**

```mdx
---
title: "Vision Foundation Model Encoders for Dense Prediction"
abstract: "An exploration of using vision foundation model encoders as drop-in backbones for downstream dense-prediction tasks, comparing against task-specific CNN baselines."
venue: "Universität Rostock — Area Seminar"
year: 2026
featured: true
---

A study comparing vision foundation model encoders against convolutional
baselines for dense-prediction tasks, covering transfer behavior, data
efficiency, and inference cost.
```

- [ ] **Step 5: Create `src/content/posts/hello-world.mdx`**

```mdx
---
title: "Hello, World"
description: "Why I built this site and what I plan to write about."
date: 2026-05-29
tags: ["meta"]
---

This is the first post. I'll write about machine learning, computer vision,
LLMs, cloud engineering, and the systems that hold it all together.
```

- [ ] **Step 6: Verify schemas validate at build**

Run:
```bash
npm run build
```
Expected: build succeeds; content collections sync with no validation errors. (If a frontmatter field is wrong, the build fails here — that is the intended safety net.)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: content collections schema + example entries

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Animation primitive islands (Reveal, CountUp, RotatingRole)

**Files:**
- Create: `src/components/react/Reveal.tsx`, `src/components/react/CountUp.tsx`, `src/components/react/RotatingRole.tsx`

- [ ] **Step 1: Create `src/components/react/Reveal.tsx`**

```tsx
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function Reveal({ children, delay = 0, className }: Props) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create `src/components/react/CountUp.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

interface Props {
  /** Numeric portion to count up to, e.g. 12 */
  to: number;
  /** Suffix rendered after the number, e.g. "+" */
  suffix?: string;
  className?: string;
}

export default function CountUp({ to, suffix = '', className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(p * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
```

- [ ] **Step 3: Create `src/components/react/RotatingRole.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface Props {
  roles: string[];
  className?: string;
}

export default function RotatingRole({ roles, className }: Props) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || roles.length < 2) return;
    const id = setInterval(() => setI((p) => (p + 1) % roles.length), 2400);
    return () => clearInterval(id);
  }, [reduce, roles.length]);

  if (reduce) return <span className={className}>{roles[0]}</span>;

  return (
    <span className={className} style={{ display: 'inline-block', position: 'relative' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={roles[i]}
          initial={{ opacity: 0, y: '0.4em' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-0.4em' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ display: 'inline-block' }}
        >
          {roles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
```

- [ ] **Step 4: Verify build (type-check islands)**

Run: `npm run build`
Expected: success (these compile even though not yet used).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: animation primitive islands (Reveal, CountUp, RotatingRole)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: BaseLayout, Nav, Footer, SEO

**Files:**
- Create: `src/components/SEO.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/layouts/BaseLayout.astro`
- Create: `public/favicon.svg`

- [ ] **Step 1: Create `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a78bfa"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="#06060d"/>
  <circle cx="16" cy="16" r="7" fill="url(#g)"/>
</svg>
```

- [ ] **Step 2: Create `src/components/SEO.astro`**

```astro
---
interface Props {
  title: string;
  description: string;
  image?: string;
}
const { title, description, image = '/og-default.png' } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
const ogImage = new URL(image, Astro.site);
---
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical.href} />
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical.href} />
<meta property="og:image" content={ogImage.href} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage.href} />
```

- [ ] **Step 3: Create `src/components/Nav.astro`**

```astro
---
import { siteData } from '../data/siteData';
const path = Astro.url.pathname;
const isActive = (href: string) => path === href || path.startsWith(href + '/');
---
<header class="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-xl">
  <nav class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
    <a href="/" class="flex items-center gap-2 font-bold">
      <span class="h-2.5 w-2.5 rounded-full" style="background:linear-gradient(135deg,#a78bfa,#22d3ee);box-shadow:0 0 12px rgba(167,139,250,.6)"></span>
      <span>abu<span class="text-gradient">bakar</span></span>
    </a>

    <ul class="hidden items-center gap-7 font-mono text-sm md:flex">
      {siteData.nav.map((n) => (
        <li>
          <a
            href={n.href}
            class:list={['transition-colors hover:text-text', isActive(n.href) ? 'text-text' : 'text-muted']}
            aria-current={isActive(n.href) ? 'page' : undefined}
          >{n.label}</a>
        </li>
      ))}
    </ul>

    <a
      href={`mailto:${siteData.email}`}
      class="hidden rounded-lg border border-primary/40 bg-primary/15 px-3.5 py-1.5 text-sm text-primary transition-colors hover:bg-primary/25 md:inline-block"
    >say hi →</a>

    <!-- Mobile menu (CSS-only via checkbox toggle) -->
    <input type="checkbox" id="nav-toggle" class="peer hidden" />
    <label for="nav-toggle" class="cursor-pointer md:hidden" aria-label="Toggle menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </label>
    <div class="absolute inset-x-0 top-full hidden border-b border-line bg-bg/95 px-5 py-4 backdrop-blur-xl peer-checked:block md:!hidden">
      <ul class="flex flex-col gap-4 font-mono text-base">
        {siteData.nav.map((n) => (
          <li><a href={n.href} class:list={[isActive(n.href) ? 'text-text' : 'text-muted']}>{n.label}</a></li>
        ))}
        <li><a href={`mailto:${siteData.email}`} class="text-primary">say hi →</a></li>
      </ul>
    </div>
  </nav>
</header>
```

- [ ] **Step 4: Create `src/components/Footer.astro`**

```astro
---
import { siteData } from '../data/siteData';
const year = new Date().getFullYear();
---
<footer class="mt-24 border-t border-line">
  <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-muted sm:flex-row">
    <p>© {year} {siteData.name}</p>
    <ul class="flex gap-6 font-mono">
      {siteData.socials.map((s) => (
        <li>
          <a href={s.href} target="_blank" rel="noopener noreferrer" class="transition-colors hover:text-text">{s.label}</a>
        </li>
      ))}
    </ul>
  </div>
</footer>
```

- [ ] **Step 5: Create `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';
import BackgroundFX from '../components/BackgroundFX.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import SEO from '../components/SEO.astro';
import { siteData } from '../data/siteData';

interface Props {
  title?: string;
  description?: string;
  image?: string;
}
const {
  title = siteData.name,
  description = siteData.bio,
  image,
} = Astro.props;
const fullTitle = title === siteData.name ? `${siteData.name} — ${siteData.role}` : `${title} · ${siteData.name}`;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <SEO title={fullTitle} description={description} image={image} />
  </head>
  <body class="min-h-dvh">
    <BackgroundFX />
    <Nav />
    <main class="mx-auto max-w-6xl px-5">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 6: Switch the home page to use BaseLayout (temporary content)**

Replace `src/pages/index.astro` with:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout>
  <section class="py-20">
    <h1 class="text-5xl font-bold tracking-tight">Layout <span class="text-gradient">OK</span></h1>
    <p class="mt-4 text-muted">Nav, footer, background, SEO wired.</p>
  </section>
</BaseLayout>
```

- [ ] **Step 7: Verify in browser**

Run `npm run dev`. Check: sticky nav with active-link highlight, working "say hi" mailto, mobile menu toggles at ≤768px (use devtools responsive at 375px), footer social links open in new tab, no horizontal scroll at 375px. Stop server.

- [ ] **Step 8: Verify build**

Run `npm run build`. Expected: success; `dist/sitemap-index.xml` generated.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: BaseLayout, Nav (with mobile drawer), Footer, SEO

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: HeroBento

**Files:**
- Create: `src/components/HeroBento.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/HeroBento.astro`**

```astro
---
import { siteData } from '../data/siteData';
import RotatingRole from './react/RotatingRole.tsx';
import CountUp from './react/CountUp.tsx';
import Reveal from './react/Reveal.tsx';
---
<section class="py-14 sm:py-20">
  <div class="grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr] md:grid-rows-2">
    <!-- Main tile -->
    <Reveal client:load className="glass relative row-span-2 overflow-hidden p-7 sm:p-9">
      <div class="absolute -right-1/5 -top-2/5 h-[120%] w-3/5" style="background:radial-gradient(circle,rgba(167,139,250,.30),transparent 60%)"></div>
      {siteData.available && (
        <span class="relative inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/15 px-3 py-1 font-mono text-xs text-success">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-success" style="box-shadow:0 0 8px #22c55e"></span>
          Available for ML / AI roles · 2026
        </span>
      )}
      <h1 class="relative mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
        Building <span class="text-gradient">intelligent</span> systems.
      </h1>
      <p class="relative mt-5 max-w-xl text-base text-muted sm:text-lg">{siteData.bio}</p>
      <p class="relative mt-6 font-mono text-sm text-muted">
        <span class="text-accent">$</span> role:
        <RotatingRole client:visible roles={[...siteData.roles]} className="text-text" />
      </p>
    </Reveal>

    <!-- Stat tiles -->
    {siteData.stats.map((stat, idx) => (
      <Reveal client:load delay={0.1 + idx * 0.08} className="glass p-6">
        <p class="font-mono text-xs uppercase tracking-[0.12em] text-muted">// {stat.key}</p>
        {/^\d/.test(stat.value) ? (
          <p class="mt-2 text-3xl font-bold">
            <CountUp client:visible to={parseInt(stat.value, 10)} suffix={stat.value.replace(/^\d+/, '')} />
          </p>
        ) : (
          <p class="mt-2 text-xl font-bold leading-snug">{stat.value}</p>
        )}
        <p class="mt-1 text-sm text-muted">{stat.sub}</p>
      </Reveal>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Use it on the home page**

Replace `src/pages/index.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroBento from '../components/HeroBento.astro';
---
<BaseLayout>
  <HeroBento />
</BaseLayout>
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`. Check: hero tiles fade/rise in on load; "available" dot pulses; role text rotates (`ML engineer` → `full-stack developer` → `researcher`); the numeric stat counts up when in view; reduced-motion shows static first role + final number. Check 375px stacks to one column. Stop server.

- [ ] **Step 4: Verify build**

Run `npm run build`. Expected: success.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: hero bento with rotating role + count-up + reveals

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: SkillsGrid island

**Files:**
- Create: `src/components/SkillsGrid.tsx`

- [ ] **Step 1: Create `src/components/SkillsGrid.tsx`**

```tsx
import { motion, useReducedMotion } from 'framer-motion';
import type { Skill } from '../data/siteData';

interface Props { skills: Skill[] }

export default function SkillsGrid({ skills }: Props) {
  const reduce = useReducedMotion();
  return (
    <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
      {skills.map((skill, i) => (
        <motion.li
          key={skill.name}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4), ease: 'easeOut' }}
          className={[
            'group flex aspect-square items-center justify-center rounded-xl border text-center font-mono text-xs transition-colors',
            skill.level === 'core'
              ? 'border-primary/30 bg-gradient-to-br from-primary/15 to-accent/10 text-text'
              : 'border-line bg-white/[0.03] text-muted hover:border-primary/40 hover:text-text',
          ].join(' ')}
          title={`${skill.name} · ${skill.level}`}
        >
          <motion.span whileHover={reduce ? undefined : { scale: 1.08 }} className="px-1">
            {skill.name}
          </motion.span>
        </motion.li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Verify build (type-check)**

Run `npm run build`. Expected: success. (Rendered on the home page in Task 11.)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: animated SkillsGrid island

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: ProjectCard + ProjectGrid islands (cursor spotlight + filter)

**Files:**
- Create: `src/components/ProjectCard.tsx`, `src/components/ProjectGrid.tsx`

- [ ] **Step 1: Create `src/components/ProjectCard.tsx`**

```tsx
import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface ProjectCardData {
  title: string;
  summary: string;
  tags: string[];
  stack: string[];
  href: string;
  repo?: string;
  demo?: string;
}

export default function ProjectCard({ project }: { project: ProjectCardData }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const [pos, setPos] = useState({ x: -200, y: -200 });

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <motion.a
      ref={ref}
      href={project.href}
      onMouseMove={onMove}
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative block overflow-hidden rounded-[14px] border border-line bg-white/[0.04] p-5 backdrop-blur-md transition-colors hover:border-primary/40"
    >
      {!reduce && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(240px circle at ${pos.x}px ${pos.y}px, rgba(34,211,238,0.18), transparent 70%)`,
          }}
        />
      )}
      <div class="relative">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
          // {project.tags.join(' · ')}
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight">{project.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{project.summary}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <span key={s} className="rounded border border-line bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-muted">
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.a>
  );
}
```

Note: this is a `.tsx` file — change the `class=` on the inner `<div>` to `className=`. (Written as `class` above by mistake; use `className`.)

- [ ] **Step 2: Fix the JSX attribute**

In `ProjectCard.tsx`, ensure the inner wrapper uses `className="relative"` (not `class`). Verify there are no other `class=` usages.

- [ ] **Step 3: Create `src/components/ProjectGrid.tsx`**

```tsx
import { useMemo, useState } from 'react';
import ProjectCard, { type ProjectCardData } from './ProjectCard';

interface Props {
  projects: ProjectCardData[];
  filterable?: boolean;
}

export default function ProjectGrid({ projects, filterable = false }: Props) {
  const allTags = useMemo(
    () => ['All', ...Array.from(new Set(projects.flatMap((p) => p.tags)))],
    [projects],
  );
  const [active, setActive] = useState('All');
  const shown = active === 'All' ? projects : projects.filter((p) => p.tags.includes(active));

  return (
    <div>
      {filterable && (
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActive(tag)}
              className={[
                'rounded-full border px-3 py-1 font-mono text-xs transition-colors',
                active === tag
                  ? 'border-primary/50 bg-primary/15 text-primary'
                  : 'border-line text-muted hover:text-text',
              ].join(' ')}
              aria-pressed={active === tag}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shown.map((p) => (
          <ProjectCard key={p.title} project={p} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build (type-check)**

Run `npm run build`. Expected: success.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: ProjectCard (cursor spotlight) + filterable ProjectGrid islands

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: Home page assembly (sections + previews)

**Files:**
- Create: `src/components/SectionHeader.astro`, `src/components/AboutTeaser.astro`, `src/components/ResearchList.astro`, `src/components/BlogList.astro`, `src/components/ContactCTA.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/SectionHeader.astro`**

```astro
---
interface Props { title: string; note?: string; href?: string }
const { title, note, href } = Astro.props;
---
<div class="mb-6 mt-20 flex items-baseline justify-between">
  <h2 class="text-2xl font-semibold tracking-tight">{title}</h2>
  {href
    ? <a href={href} class="font-mono text-xs text-muted transition-colors hover:text-text">{note ?? 'view all →'}</a>
    : note && <span class="font-mono text-xs text-muted">{note}</span>}
</div>
```

- [ ] **Step 2: Create `src/components/AboutTeaser.astro`**

```astro
---
import { siteData } from '../data/siteData';
import Reveal from './react/Reveal.tsx';
---
<Reveal client:visible className="glass p-7 sm:p-9">
  <p class="font-mono text-xs uppercase tracking-[0.12em] text-muted">// about</p>
  <p class="mt-3 max-w-2xl text-lg leading-relaxed">
    {siteData.tagline} Based in {siteData.location}, working at {siteData.affiliation}.
  </p>
  <div class="mt-5 flex flex-wrap gap-2">
    {siteData.focusAreas.map((f) => (
      <span class="rounded-full border border-line bg-white/[0.04] px-3 py-1 font-mono text-xs text-muted">{f}</span>
    ))}
  </div>
  <a href="/about" class="mt-6 inline-block font-mono text-sm text-accent hover:underline">more about me →</a>
</Reveal>
```

- [ ] **Step 3: Create `src/components/ResearchList.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
interface Props { items: CollectionEntry<'research'>[] }
const { items } = Astro.props;
---
<ul class="flex flex-col gap-4">
  {items.map((entry) => (
    <li class="glass p-6">
      <div class="flex items-baseline justify-between gap-4">
        <h3 class="text-lg font-semibold tracking-tight">{entry.data.title}</h3>
        <span class="shrink-0 font-mono text-xs text-muted">{entry.data.year}</span>
      </div>
      <p class="mt-1 font-mono text-xs text-primary">{entry.data.venue}</p>
      <p class="mt-3 text-sm leading-relaxed text-muted">{entry.data.abstract}</p>
      {(entry.data.link || entry.data.pdf) && (
        <div class="mt-4 flex gap-4 font-mono text-xs">
          {entry.data.link && <a href={entry.data.link} target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">link →</a>}
          {entry.data.pdf && <a href={entry.data.pdf} target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">pdf →</a>}
        </div>
      )}
    </li>
  ))}
</ul>
```

- [ ] **Step 4: Create `src/components/BlogList.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { formatDate } from '../lib/format';
interface Props { posts: CollectionEntry<'posts'>[] }
const { posts } = Astro.props;
---
<ul class="flex flex-col divide-y divide-line">
  {posts.map((post) => (
    <li>
      <a href={`/writing/${post.id}`} class="group flex flex-col gap-1 py-5 transition-colors sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h3 class="font-medium tracking-tight transition-colors group-hover:text-accent">{post.data.title}</h3>
          <p class="mt-1 text-sm text-muted">{post.data.description}</p>
        </div>
        <time class="shrink-0 font-mono text-xs text-muted" datetime={post.data.date.toISOString()}>
          {formatDate(post.data.date)}
        </time>
      </a>
    </li>
  ))}
</ul>
```

- [ ] **Step 5: Create `src/components/ContactCTA.astro`**

```astro
---
import { siteData } from '../data/siteData';
import Reveal from './react/Reveal.tsx';
---
<Reveal client:visible className="glass relative mt-20 overflow-hidden p-10 text-center">
  <div class="absolute inset-0 -z-10" style="background:radial-gradient(circle at 50% 0%,rgba(167,139,250,.18),transparent 60%)"></div>
  <h2 class="text-3xl font-bold tracking-tight">Let's build something.</h2>
  <p class="mx-auto mt-3 max-w-md text-muted">Open to ML/AI engineering and full-stack roles, collaborations, and research.</p>
  <a href={`mailto:${siteData.email}`} class="mt-6 inline-block rounded-lg border border-primary/40 bg-primary/15 px-5 py-2.5 font-mono text-sm text-primary transition-colors hover:bg-primary/25">
    {siteData.email} →
  </a>
</Reveal>
```

- [ ] **Step 6: Assemble `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroBento from '../components/HeroBento.astro';
import SectionHeader from '../components/SectionHeader.astro';
import AboutTeaser from '../components/AboutTeaser.astro';
import SkillsGrid from '../components/SkillsGrid.tsx';
import ProjectGrid from '../components/ProjectGrid.tsx';
import ResearchList from '../components/ResearchList.astro';
import BlogList from '../components/BlogList.astro';
import ContactCTA from '../components/ContactCTA.astro';
import { siteData } from '../data/siteData';
import { sortByDateDesc } from '../lib/format';

const projects = (await getCollection('projects'))
  .filter((p) => p.data.featured)
  .sort((a, b) => a.data.order - b.data.order)
  .slice(0, 4)
  .map((p) => ({
    title: p.data.title,
    summary: p.data.summary,
    tags: p.data.tags,
    stack: p.data.stack,
    href: `/work/${p.id}`,
    repo: p.data.repo,
    demo: p.data.demo,
  }));

const research = (await getCollection('research'))
  .sort((a, b) => b.data.year - a.data.year)
  .slice(0, 2);

const posts = sortByDateDesc(
  (await getCollection('posts')).filter((p) => !p.data.draft),
  (p) => p.data.date,
).slice(0, 3);
---
<BaseLayout>
  <HeroBento />

  <AboutTeaser />

  <SectionHeader title="Stack & tools" note="// what i reach for" />
  <SkillsGrid client:visible skills={[...siteData.skills]} />

  <SectionHeader title="Featured work" note="view all →" href="/work" />
  <ProjectGrid client:visible projects={projects} />

  <SectionHeader title="Research" note="view all →" href="/research" />
  <ResearchList items={research} />

  <SectionHeader title="Writing" note="view all →" href="/writing" />
  <BlogList posts={posts} />

  <ContactCTA />
</BaseLayout>
```

- [ ] **Step 7: Verify in browser**

Run `npm run dev`. Check the full home page top-to-bottom: hero, about teaser with focus-area chips, skills grid (core tiles gradient-filled, stagger in), 2 featured project cards with cursor spotlight on hover + lift, research entries, blog list, contact CTA. Verify 375px layout. Stop server.

- [ ] **Step 8: Verify build**

Run `npm run build`. Expected: success.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: assemble home page (about, skills, projects, research, blog, contact)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 12: /work index + project detail pages

**Files:**
- Create: `src/pages/work/index.astro`, `src/pages/work/[...slug].astro`

- [ ] **Step 1: Create `src/pages/work/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectGrid from '../../components/ProjectGrid.tsx';

const projects = (await getCollection('projects'))
  .sort((a, b) => a.data.order - b.data.order)
  .map((p) => ({
    title: p.data.title,
    summary: p.data.summary,
    tags: p.data.tags,
    stack: p.data.stack,
    href: `/work/${p.id}`,
    repo: p.data.repo,
    demo: p.data.demo,
  }));
---
<BaseLayout title="Work" description="Selected projects across ML, computer vision, LLMs, web, and cloud.">
  <section class="py-14">
    <h1 class="text-4xl font-bold tracking-tight">Work</h1>
    <p class="mt-3 text-muted">Selected projects. Filter by area.</p>
    <div class="mt-10">
      <ProjectGrid client:load projects={projects} filterable />
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/work/[...slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<BaseLayout title={entry.data.title} description={entry.data.summary}>
  <article class="py-14">
    <a href="/work" class="font-mono text-xs text-muted hover:text-text">← back to work</a>
    <p class="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">// {entry.data.tags.join(' · ')}</p>
    <h1 class="mt-2 text-4xl font-bold tracking-tight">{entry.data.title}</h1>
    <p class="mt-3 max-w-2xl text-lg text-muted">{entry.data.summary}</p>

    <div class="mt-5 flex flex-wrap gap-1.5">
      {entry.data.stack.map((s) => (
        <span class="rounded border border-line bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-muted">{s}</span>
      ))}
    </div>

    <div class="mt-5 flex gap-4 font-mono text-sm">
      {entry.data.repo && <a href={entry.data.repo} target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">repo →</a>}
      {entry.data.demo && <a href={entry.data.demo} target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">live demo →</a>}
    </div>

    <div class="prose-portfolio mt-10 max-w-2xl">
      <Content />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Add prose styling for rendered MDX in `src/styles/global.css`**

Append:
```css
.prose-portfolio { line-height: 1.7; }
.prose-portfolio h2 { font-size: 1.5rem; font-weight: 600; margin: 2rem 0 0.75rem; letter-spacing: -0.01em; }
.prose-portfolio h3 { font-size: 1.2rem; font-weight: 600; margin: 1.5rem 0 0.5rem; }
.prose-portfolio p { margin: 0.85rem 0; color: #cbd5e1; }
.prose-portfolio ul { margin: 0.85rem 0; padding-left: 1.25rem; list-style: disc; color: #cbd5e1; }
.prose-portfolio li { margin: 0.35rem 0; }
.prose-portfolio a { color: var(--color-accent); text-decoration: underline; }
.prose-portfolio code { font-family: var(--font-mono); font-size: 0.9em; background: rgba(255,255,255,0.08); padding: 0.1em 0.35em; border-radius: 4px; color: var(--color-code); }
.prose-portfolio pre { margin: 1.25rem 0; padding: 1rem; border-radius: 12px; border: 1px solid var(--color-line); overflow-x: auto; }
.prose-portfolio pre code { background: transparent; padding: 0; color: inherit; }
```

- [ ] **Step 4: Verify in browser**

Run `npm run dev`. Visit `/work` → filter chips work (All/ML/Web/CV/Cloud/LLM); click a card → detail page renders MDX with stack chips + repo link + "back to work". Stop server.

- [ ] **Step 5: Verify build**

Run `npm run build`. Expected: success; `dist/work/neurochat/index.html` etc. exist.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: /work index (filterable) + project detail pages

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 13: /research page

**Files:**
- Create: `src/pages/research/index.astro`

- [ ] **Step 1: Create `src/pages/research/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ResearchList from '../../components/ResearchList.astro';

const research = (await getCollection('research')).sort((a, b) => b.data.year - a.data.year);
---
<BaseLayout title="Research" description="Research, publications, and seminars across AI/ML and computer vision.">
  <section class="py-14">
    <h1 class="text-4xl font-bold tracking-tight">Research</h1>
    <p class="mt-3 max-w-2xl text-muted">Publications, seminars, and ongoing research in AI/ML, computer vision, and LLMs.</p>
    <div class="mt-10">
      <ResearchList items={research} />
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`. Visit `/research`; entries render newest-first with venue, year, abstract, and any link/pdf. Stop server.

- [ ] **Step 3: Verify build**

Run `npm run build`. Expected: success.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: /research page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 14: /writing index + post pages + RSS

**Files:**
- Create: `src/layouts/PostLayout.astro`, `src/pages/writing/index.astro`, `src/pages/writing/[...slug].astro`, `src/pages/rss.xml.ts`

- [ ] **Step 1: Create `src/pages/writing/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import BlogList from '../../components/BlogList.astro';
import { sortByDateDesc } from '../../lib/format';

const posts = sortByDateDesc(
  (await getCollection('posts')).filter((p) => !p.data.draft),
  (p) => p.data.date,
);
---
<BaseLayout title="Writing" description="Notes on ML, computer vision, LLMs, cloud, and systems.">
  <section class="py-14">
    <h1 class="text-4xl font-bold tracking-tight">Writing</h1>
    <p class="mt-3 text-muted">Notes on what I'm learning and building.</p>
    <div class="mt-10"><BlogList posts={posts} /></div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Create `src/layouts/PostLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import { formatDate, readingTime } from '../lib/format';
import type { CollectionEntry } from 'astro:content';

interface Props {
  entry: CollectionEntry<'posts'>;
  headings: { depth: number; slug: string; text: string }[];
  bodyText: string;
}
const { entry, headings, bodyText } = Astro.props;
const toc = headings.filter((h) => h.depth === 2 || h.depth === 3);
---
<BaseLayout title={entry.data.title} description={entry.data.description}>
  <article class="py-14">
    <a href="/writing" class="font-mono text-xs text-muted hover:text-text">← all writing</a>
    <h1 class="mt-6 text-4xl font-bold tracking-tight">{entry.data.title}</h1>
    <p class="mt-3 flex gap-3 font-mono text-xs text-muted">
      <time datetime={entry.data.date.toISOString()}>{formatDate(entry.data.date)}</time>
      <span>·</span>
      <span>{readingTime(bodyText)}</span>
    </p>

    <div class="mt-10 gap-10 lg:grid lg:grid-cols-[1fr_220px]">
      <div class="prose-portfolio max-w-2xl"><slot /></div>
      {toc.length > 0 && (
        <nav class="sticky top-24 hidden h-max lg:block" aria-label="Table of contents">
          <p class="font-mono text-xs uppercase tracking-[0.12em] text-muted">// on this page</p>
          <ul class="mt-3 flex flex-col gap-2 text-sm">
            {toc.map((h) => (
              <li class={h.depth === 3 ? 'pl-3' : ''}>
                <a href={`#${h.slug}`} class="text-muted transition-colors hover:text-text">{h.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Create `src/pages/writing/[...slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';

export async function getStaticPaths() {
  const posts = (await getCollection('posts')).filter((p) => !p.data.draft);
  return posts.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content, headings } = await render(entry);
---
<PostLayout entry={entry} headings={headings} bodyText={entry.body ?? ''}>
  <Content />
</PostLayout>
```

- [ ] **Step 4: Create `src/pages/rss.xml.ts`**

```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteData } from '../data/siteData';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts')).filter((p) => !p.data.draft);
  return rss({
    title: `${siteData.name} — Writing`,
    description: 'Notes on ML, computer vision, LLMs, cloud, and systems.',
    site: context.site!,
    items: posts
      .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: `/writing/${post.id}/`,
      })),
  });
}
```

- [ ] **Step 5: Link the RSS feed in `BaseLayout.astro` head**

Add inside `<head>` (after the sitemap link):
```astro
    <link rel="alternate" type="application/rss+xml" title={`${siteData.name} — Writing`} href="/rss.xml" />
```

- [ ] **Step 6: Verify in browser**

Run `npm run dev`. Visit `/writing` → post listed; open the post → renders MDX, shows date + reading time, ToC appears on wide screens for h2/h3. Visit `/rss.xml` → valid XML. Stop server.

- [ ] **Step 7: Verify build**

Run `npm run build`. Expected: success; `dist/rss.xml` and `dist/writing/hello-world/index.html` exist.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: /writing index, post pages with ToC, RSS feed

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 15: /about page + resume placeholder

**Files:**
- Create: `src/pages/about.astro`, `public/resume.pdf`

- [ ] **Step 1: Add a placeholder resume so the download link resolves**

Run:
```bash
printf '%%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f \ntrailer<</Root 1 0 R/Size 4>>\n%%%%EOF\n' > public/resume.pdf
```
(Replace with the real resume PDF when available — same path `/resume.pdf`.)

- [ ] **Step 2: Create `src/pages/about.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Reveal from '../components/react/Reveal.tsx';
import { siteData } from '../data/siteData';

const timeline = [
  { when: '2024 — present', what: 'Universität Rostock', detail: 'Studying & researching AI/ML and computer vision.' },
  { when: 'Ongoing', what: 'Independent projects', detail: 'Building full-stack apps and ML systems across LLMs, cloud, and distributed systems.' },
];
---
<BaseLayout title="About" description={siteData.bio}>
  <section class="py-14">
    <h1 class="text-4xl font-bold tracking-tight">About</h1>

    <div class="mt-8 grid gap-8 md:grid-cols-[1fr_2fr]">
      <Reveal client:visible className="glass h-max p-6">
        <p class="font-mono text-xs uppercase tracking-[0.12em] text-muted">// profile</p>
        <dl class="mt-4 space-y-3 text-sm">
          <div><dt class="text-muted">Name</dt><dd>{siteData.name}</dd></div>
          <div><dt class="text-muted">Location</dt><dd>{siteData.location}</dd></div>
          <div><dt class="text-muted">Affiliation</dt><dd>{siteData.affiliation}</dd></div>
          <div><dt class="text-muted">Email</dt><dd><a href={`mailto:${siteData.email}`} class="text-accent hover:underline">{siteData.email}</a></dd></div>
        </dl>
        <a href={siteData.resumeUrl} download class="mt-6 inline-block rounded-lg border border-primary/40 bg-primary/15 px-4 py-2 font-mono text-sm text-primary transition-colors hover:bg-primary/25">
          download resume ↓
        </a>
      </Reveal>

      <div>
        <p class="max-w-2xl text-lg leading-relaxed text-muted">{siteData.bio}</p>

        <h2 class="mt-10 text-xl font-semibold">Focus areas</h2>
        <div class="mt-3 flex flex-wrap gap-2">
          {siteData.focusAreas.map((f) => (
            <span class="rounded-full border border-line bg-white/[0.04] px-3 py-1 font-mono text-xs text-muted">{f}</span>
          ))}
        </div>

        <h2 class="mt-10 text-xl font-semibold">Timeline</h2>
        <ol class="mt-4 border-l border-line">
          {timeline.map((t) => (
            <li class="relative pb-7 pl-6">
              <span class="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full" style="background:linear-gradient(135deg,#a78bfa,#22d3ee)"></span>
              <p class="font-mono text-xs text-muted">{t.when}</p>
              <p class="mt-1 font-medium">{t.what}</p>
              <p class="text-sm text-muted">{t.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`. Visit `/about`; profile card + resume download (downloads the placeholder PDF), bio, focus chips, timeline render. Stop server.

- [ ] **Step 4: Verify build**

Run `npm run build`. Expected: success.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: /about page with profile, timeline, resume download

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 16: Custom 404 + robots.txt + OG image

**Files:**
- Create: `src/pages/404.astro`, `public/robots.txt`, `public/og-default.png`

- [ ] **Step 1: Create `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="404" description="Page not found.">
  <section class="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p class="font-mono text-7xl font-bold text-gradient">404</p>
    <p class="mt-4 text-muted">This page drifted off into latent space.</p>
    <a href="/" class="mt-8 rounded-lg border border-primary/40 bg-primary/15 px-5 py-2.5 font-mono text-sm text-primary transition-colors hover:bg-primary/25">
      ← back home
    </a>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Create `public/robots.txt`**

```text
User-agent: *
Allow: /

Sitemap: https://ab17dogar.github.io/sitemap-index.xml
```

- [ ] **Step 3: Provide an OG image**

The `SEO.astro` component references `/og-default.png`. Create a simple 1200×630 placeholder so social cards resolve:
```bash
# If you have an image, copy it to public/og-default.png. Otherwise generate a solid placeholder:
node -e "const fs=require('fs');const b=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');fs.writeFileSync('public/og-default.png',b)"
```
(Replace with a real branded 1200×630 OG image later — same path.)

- [ ] **Step 4: Verify in browser**

Run `npm run dev`. Visit a bogus path like `/nope` → custom 404 renders. Stop server.

- [ ] **Step 5: Verify build**

Run `npm run build`. Expected: success; `dist/404.html`, `dist/robots.txt`, `dist/og-default.png` exist.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: custom 404, robots.txt, default OG image

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 17: GitHub Pages deploy workflow + README

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Build Astro site
        uses: withastro/action@v3
        # Defaults: package manager auto-detected, output uploaded as Pages artifact.

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Create `README.md`**

```markdown
# ab17dogar.github.io

Personal portfolio — dark, glassmorphic, animated. Built with Astro + React islands + Tailwind v4 + Framer Motion.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build to dist/
npm test         # unit tests (vitest)
```

## Content

- Projects: `src/content/projects/*.mdx`
- Research: `src/content/research/*.mdx`
- Posts: `src/content/posts/*.mdx`
- Identity / skills / socials: `src/data/siteData.ts`
- Resume: `public/resume.pdf`

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
deploys to GitHub Pages.

### Custom domain (later)

1. Set `site` in `astro.config.mjs` to the new origin (e.g. `https://abubakar.dev`).
2. Add `public/CNAME` containing the bare domain (`abubakar.dev`).
3. Configure the domain's DNS + the repo's Pages "custom domain" setting.

`base` stays `/` — no path changes needed.
```

- [ ] **Step 3: Verify build once more**

Run `npm run build`. Expected: success.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "ci: GitHub Pages deploy workflow + README

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 18: Final verification & deploy

**Files:** none (verification + remote setup)

- [ ] **Step 1: Run the full test + build gate**

Run:
```bash
npm test && npm run build
```
Expected: all tests pass; build succeeds with sitemap + RSS + all routes in `dist/`.

- [ ] **Step 2: Preview the production build locally**

Run:
```bash
npm run preview
```
Open the printed URL. Click through every route: `/`, `/work`, a project detail, `/research`, `/writing`, the post, `/about`, and a 404. Confirm no console errors, no horizontal scroll at 375px, and nav active states are correct. Stop preview.

- [ ] **Step 3: Reduced-motion + keyboard pass**

Enable OS "reduce motion"; reload `/` — confirm blobs/role/count-up are static but content is fully readable. Tab through the home page — confirm visible violet focus rings and logical order. (Optional: run Lighthouse in Chrome DevTools, target ≥95 performance/a11y/SEO.)

- [ ] **Step 4: Create the GitHub repo and push (via GitHub MCP / gh as configured)**

The repo must be named `ab17dogar.github.io` under the `ab17dogar` account. Using the GitHub MCP tools (per project preference) or `gh`:
```bash
# Example with gh (ensure authenticated as ab17dogar):
gh repo create ab17dogar.github.io --public --source=. --remote=origin --push
```
If using the GitHub MCP, create the repo `ab17dogar.github.io`, then:
```bash
git remote add origin https://github.com/ab17dogar/ab17dogar.github.io.git
git branch -M main
git push -u origin main
```

- [ ] **Step 5: Enable Pages → GitHub Actions**

In the repo settings → Pages → "Build and deployment" → Source: **GitHub Actions**. (The workflow runs automatically on the push from Step 4.)

- [ ] **Step 6: Verify the deployed site**

Wait for the Actions run to finish, then open `https://ab17dogar.github.io`. Confirm the home page loads with styles, fonts, and animations, and that internal navigation works. Done.

---

## Self-Review Notes (addressed)

- **Spec coverage:** visual direction/tokens (Tasks 2–3), all routes incl. detail pages (Tasks 11–16), animations incl. spotlight/reveal/count-up/rotating-role/view-stagger (Tasks 6,8,9,10), content collections + siteData (Tasks 3,5), SEO/sitemap/RSS/robots/OG (Tasks 7,14,16), a11y + reduced-motion (Tasks 2,17,18), GitHub Pages + custom-domain-ready (Tasks 1,17,18). Contact via mailto (Tasks 7,11,15) — form deferred per spec §11/§13.
- **View Transitions:** the spec mentions cross-fade route transitions. This is intentionally omitted from the build tasks to keep scroll-position/island behavior predictable; reveal-on-scroll covers the motion budget. Add later via `<ClientRouter />` in `BaseLayout` head if desired (one-line, non-breaking).
- **Type consistency:** `ProjectCardData` shape is produced identically in `index.astro` and `work/index.astro`; `siteData` arrays are spread (`[...]`) when passed to islands to satisfy readonly→mutable prop types.
- **Geist font:** spec lists Geist with Inter fallback; plan ships Inter (the spec-approved fallback) to guarantee a reliable build. To add Geist: install `@fontsource-variable/geist`, import it in `global.css`, and prepend `"Geist Variable"` to `--font-sans`.
