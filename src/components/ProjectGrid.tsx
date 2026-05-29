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
