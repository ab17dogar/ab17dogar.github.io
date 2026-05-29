// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Single source of truth for the deployed origin.
// To move to a custom domain later: change `site` and add public/CNAME. `base` stays '/'.
export default defineConfig({
  site: 'https://ab17dogar.github.io',
  base: '/',
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
