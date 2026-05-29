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
