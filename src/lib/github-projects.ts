import matter from 'gray-matter';
import type { ProjectLink } from './projects';

// Build-time sync of portfolio projects from GitHub.
// A repo is shown as a project ONLY if it contains a `portfolio-content.md` file.
// That file's frontmatter drives the card; its body drives the detail page.
// The site repo and the profile repo are always excluded. Add a new repo with a
// portfolio-content.md -> it appears automatically on the next rebuild.

const USER = 'ab17dogar';
const EXCLUDE = new Set<string>(['ab17dogar.github.io', USER]);

export interface GithubProject {
  slug: string;       // internal detail-page slug, e.g. "project-csi"
  title: string;
  summary: string;
  tags: string[];
  stack: string[];
  repoUrl: string;
  demo?: string;
  image?: string;       // thumbnail/banner URL (optional; generated fallback otherwise)
  webapp?: string;      // "Web App" link
  appstore?: string;    // "iOS App" link
  playstore?: string;   // "Android" link
  links?: ProjectLink[]; // extra custom { label, href } links
  language: string | null;
  stars: number;
  order: number;
  current: boolean;   // ongoing project -> green signal (set `current: true` in portfolio-content.md)
  body: string;       // markdown body of portfolio-content.md (detail page content)
}

// Used only if GitHub is unreachable at build time, so the section never renders empty.
const FALLBACK: GithubProject[] = [
  { slug: 'project-csi', title: 'VetraPath — Monte Carlo Path Tracer', summary: 'A physically-based Monte Carlo path tracer built from scratch in C++17, with an interactive real-time viewport, BVH acceleration, and AI denoising.', tags: ['Graphics', 'CV'], stack: ['C++17', 'OpenGL', 'Dear ImGui', 'Intel OIDN', 'CMake'], repoUrl: 'https://github.com/ab17dogar/Project-CSI', demo: 'https://github.com/ab17dogar/Project-CSI', language: 'C++', stars: 0, order: 1, current: false, body: '' },
  { slug: 'rgbd-scene-graph', title: 'RGB-D Semantic Scene Graphs', summary: 'An end-to-end pipeline turning egocentric RGB-D into 4-layer 3D semantic scene graphs, fusing open-vocabulary 2D foundation models with BIM/IFC priors.', tags: ['ML', 'CV'], stack: ['Python', 'PyTorch', 'Grounding DINO', 'SAM 2.1', 'Open3D', 'Docker'], repoUrl: 'https://github.com/ab17dogar/rgbd-scene-graph', webapp: 'https://github.com/ab17dogar/rgbd-scene-graph', language: 'Python', stars: 0, order: 2, current: true, body: '' },
];

async function fetchProjects(): Promise<GithubProject[]> {
  const token = process.env.GITHUB_TOKEN; // higher rate limit in CI; optional locally
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let repos: any[] = [];
  try {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`, { headers });
    if (res.ok) repos = await res.json();
  } catch {
    repos = [];
  }

  const candidates = repos.filter((r) => !r.fork && !EXCLUDE.has(r.name));

  const results = await Promise.all(
    candidates.map(async (r): Promise<GithubProject | null> => {
      try {
        const cr = await fetch(`https://api.github.com/repos/${USER}/${r.name}/contents/portfolio-content.md`, { headers });
        if (!cr.ok) return null; // no portfolio-content.md -> not a portfolio project
        const j: any = await cr.json();
        const md = Buffer.from(j.content, 'base64').toString('utf-8');
        const { data, content } = matter(md);
        return {
          slug: r.name.toLowerCase(),
          title: (data.title as string) ?? r.name,
          summary: (data.summary as string) ?? r.description ?? '',
          tags: (data.tags as string[]) ?? r.topics ?? [],
          stack: (data.stack as string[]) ?? [],
          repoUrl: r.html_url,
          demo: data.demo as string | undefined,
          image: data.image as string | undefined,
          webapp: data.webapp as string | undefined,
          appstore: data.appstore as string | undefined,
          playstore: data.playstore as string | undefined,
          links: Array.isArray(data.links) ? (data.links as ProjectLink[]) : undefined,
          language: r.language ?? null,
          stars: r.stargazers_count ?? 0,
          order: typeof data.order === 'number' ? data.order : 999,
          current: data.current === true,
          body: (content ?? '').trim(),
        };
      } catch {
        return null;
      }
    }),
  );

  const projects = results.filter((p): p is GithubProject => p !== null)
    .sort((a, b) => a.order - b.order || b.stars - a.stars);

  return projects.length > 0 ? projects : FALLBACK;
}

// Memoize so index + getStaticPaths share one fetch per build.
let cache: Promise<GithubProject[]> | null = null;
export function getGithubProjects(): Promise<GithubProject[]> {
  return (cache ??= fetchProjects());
}
