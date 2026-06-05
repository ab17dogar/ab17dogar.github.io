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
