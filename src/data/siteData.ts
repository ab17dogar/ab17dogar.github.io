// Single source of truth — populated from Abu Bakar's CV.

export interface Social { label: string; href: string }
export interface NavItem { label: string; href: string }
export interface Stat { key: string; value: string; sub: string }
export interface Fact { k: string; v: string }
export interface SkillCat { name: string; items: string[] }
export interface Experience { period: string; role: string; org: string; note: string; current?: boolean }
export interface Education { period: string; degree: string; school: string; note: string }
export interface Org { name: string; href?: string }

export const siteData = {
  name: 'Abu Bakar',
  role: 'Software Engineer',
  location: 'Rostock, Germany',
  affiliation: 'Universität Rostock',
  email: '10abdogar@gmail.com',
  resumeUrl: '/resume.pdf',
  available: true,

  // Web3Forms access key for the contact form (public by design).
  // Get a free key at https://web3forms.com (enter your email). Until set, the
  // contact form gracefully falls back to opening the visitor's email client.
  contactAccessKey: 'dc0b6309-66ca-4a9b-80cd-067c5094c4be',

  // Hero
  roles: ['Backend Engineer', 'Cloud Engineer', 'Graphics & 3D', 'Researcher'],
  bio: 'Backend software engineer with 2+ years building distributed systems and cloud services — now a Research Assistant at Universität Rostock, pivoting into AI, computer vision, and 3D graphics.',

  // About
  summary:
    'Backend software engineer with 2+ years of production experience designing distributed systems and cloud-based services. Currently a Research Assistant on a DFG-funded project while pursuing an MSc in Computer Science at Universität Rostock, with active side work in computer graphics and 3D computer vision. Actively pivoting into AI and machine learning through applied projects and graduate coursework. AWS Certified Cloud Practitioner.',

  focusAreas: [
    'Distributed Systems',
    'Cloud & DevOps',
    'Computer Vision',
    '3D Graphics',
    'AI / ML',
  ],

  aboutFacts: [
    { k: 'Role', v: 'Research Assistant · Backend Engineer' },
    { k: 'Stack', v: 'Go · Java · .NET · C++ · Python' },
    { k: 'Based', v: 'Rostock, DE (open to relocate)' },
    { k: 'Cert', v: 'AWS Certified Cloud Practitioner' },
    { k: 'Languages', v: 'English (C1) · Deutsch (A2)' },
    { k: 'Open to', v: 'Full Time · Working Student · Research' },
  ] as Fact[],

  stats: [
    { key: 'experience', value: '2+ yr', sub: 'shipping production' },
    { key: 'focus', value: 'Backend · Cloud · AI', sub: 'core domains' },
  ] as Stat[],

  // Email intentionally omitted here (it's covered by Say Hi, the contact CTA, and the form).
  socials: [
    { label: 'GitHub', href: 'https://github.com/ab17dogar' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/abdogar17/' },
  ] as Social[],

  nav: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/#about' },
    { label: 'Experience', href: '/#experience' },
    { label: 'Projects', href: '/#projects' },
    { label: 'Research/Writing', href: '/#research' },
    { label: 'Skills', href: '/#skills' },
    { label: 'Contact', href: '/#contact' },
  ] as NavItem[],

  experience: [
    {
      period: '2025 — Present',
      role: 'Research Assistant (HiWi)',
      org: 'Universität Rostock · EDWANCE (DFG-funded)',
      note: 'Architecting a full-stack distributed system for the DFG-funded EDWANCE project — including a cross-platform .NET desktop activity-logging tool — validated by unit + integration suites at >90% coverage, with CI/CD pre-merge gates owned alongside a PhD researcher and supervising professor (Chair of Business Informatics, Prof. Michael Fellmann).',
      current: true,
    },
    {
      period: '2023 — 2024',
      role: 'Backend Software Engineer',
      org: 'Careem (Uber Inc & e& subsidiary) · Remote',
      note: 'Built and maintained Go backend services for the Amaken map platform with PostgreSQL/PostGIS spatial querying; shipped React UI end-to-end; automated geo-data workflows (Overture migration, GitHub Actions, Route53, S3) with 80%+ coverage and Grafana/VictorOps monitoring.',
    },
    {
      period: '2022 — 2023',
      role: 'Backend Software Engineer',
      org: 'NorthBay Solutions · Remote',
      note: 'Built web-parsing & Web API features in C#/.NET Core/MVC over Entity Framework for Intelligize (a LexisNexis product); owned the AWS S3 document-processing pipeline end-to-end; operated parsing-backlog microservices through a Jenkins CI/CD pipeline in an Agile/Scrum team.',
    },
  ] as Experience[],

  education: [
    {
      period: '2024 — Present',
      degree: 'MSc Computer Science',
      school: 'Universität Rostock, Germany',
      note: 'Graduate study with a focus on AI/ML and applied systems.',
    },
    {
      period: '2018 — 2022',
      degree: 'BSc (Hons) Computer Science',
      school: 'Forman Christian College University, Lahore',
      note: 'A Chartered University · Honors.',
    },
  ] as Education[],

  // "Worked with & studied at" strip
  orgs: [
    { name: 'Careem (Uber · e&)', href: 'https://www.careem.com' },
    { name: 'NorthBay Solutions', href: 'https://www.northbaysolutions.com' },
    { name: 'Universität Rostock', href: 'https://www.uni-rostock.de' },
    { name: 'Forman Christian College University', href: 'https://www.fccollege.edu.pk' },
    { name: 'AWS Certified Cloud Practitioner' },
  ] as Org[],

  skills: [
    { name: 'Backend', items: ['GoLang', 'C#', '.NET Core', '.NET MVC', 'Entity Framework', 'RESTful APIs', 'SQL', 'PostgreSQL', 'PostGIS', 'Microservices'] },
    { name: 'Cloud & DevOps', items: ['AWS (S3, Route53)', 'GitHub Actions', 'Jenkins', 'Docker', 'CI/CD', 'Grafana', 'VictorOps', 'Bifrost'] },
    { name: 'Graphics & Computer Vision', items: ['C++17', 'Modern OpenGL', 'Dear ImGui', 'GLFW', 'GLM', 'Monte Carlo Path Tracing', 'BVH/SAH', 'PBR/BSDF', 'Intel OIDN', 'CMake'] },
    { name: 'ML & 3D Perception', items: ['Python', 'PyTorch', 'Grounding DINO', 'SAM 2.1', 'IfcOpenShell', 'NetworkX', 'NumPy', 'SciPy', 'Open3D', 'Plotly'] },
    { name: 'Frontend', items: ['React.js', 'HTML5', 'CSS3', 'JavaScript (ES6+)', 'Swagger UI'] },
    { name: 'Tools & Workflow', items: ['Git', 'GitHub', 'Bitbucket', 'JIRA', 'Agile (Scrum & Kanban)', 'SonarQube', 'Postman', 'Linux / Ubuntu', 'Firebase'] },
  ] as SkillCat[],
} as const;

export type SiteData = typeof siteData;
