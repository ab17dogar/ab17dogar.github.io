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
      <div className="relative">
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
