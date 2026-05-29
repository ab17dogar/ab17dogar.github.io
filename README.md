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
