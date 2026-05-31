import ProjectCard, { type ProjectCardData } from './ProjectCard';

interface Props {
  projects: ProjectCardData[];
}

export default function ProjectGrid({ projects }: Props) {
  if (projects.length === 0) {
    return <p className="font-mono text-sm text-muted">No projects yet.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {projects.map((p) => (
        <ProjectCard key={p.repoUrl} project={p} />
      ))}
    </div>
  );
}
