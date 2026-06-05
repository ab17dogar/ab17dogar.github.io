import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gradientFor, initials, type ProjectLink } from '../lib/projects';

export interface ProjectCardData {
  title: string;
  summary: string;
  tags: string[];
  stack: string[];
  href: string;        // internal detail page
  repoUrl: string;     // GitHub repo
  demo?: string;
  image?: string;
  links?: ProjectLink[];
  language?: string | null;
  stars?: number;
  current?: boolean;   // ongoing -> green signal
}

export default function ProjectCard({ project }: { project: ProjectCardData }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [pos, setPos] = useState({ x: -200, y: -200 });

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-white/[0.04] p-5 backdrop-blur-md transition-colors hover:border-primary/40"
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

      {/* Stretched link: clicking anywhere on the card opens the detail page */}
      <a href={project.href} className="absolute inset-0 z-10" aria-label={`${project.title} — details`} />

      {/* Content is click-through (so the stretched link wins) except the GitHub icon */}
      <div className="pointer-events-none relative z-20 flex flex-1 flex-col">
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
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
            // {project.tags.join(' · ')}
          </p>
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} on GitHub`}
            className="pointer-events-auto -mt-1 -mr-1 rounded p-1 text-muted transition-colors hover:text-text"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </a>
        </div>
        <h3 className="mt-2 text-lg font-semibold tracking-tight">{project.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{project.summary}</p>
        {project.stack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <span key={s} className="rounded border border-line bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-muted">
                {s}
              </span>
            ))}
          </div>
        )}
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
        {/* Footer pinned to the bottom so "click for details" aligns across all cards */}
        <div className="mt-auto flex items-center gap-3 pt-4 font-mono text-[11px] text-muted">
          {project.language && (
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary"></span>{project.language}</span>
          )}
          {(project.stars ?? 0) > 0 && <span>★ {project.stars}</span>}
          <span className="ml-auto text-primary transition-colors group-hover:text-accent">click for details →</span>
        </div>
      </div>
    </motion.div>
  );
}
