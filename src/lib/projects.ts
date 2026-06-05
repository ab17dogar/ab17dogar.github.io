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
