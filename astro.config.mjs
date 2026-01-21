// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Output configuration for Cloudflare Pages
  // Use 'static' for pure static sites, 'server' with cloudflare adapter for SSR
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  },
  // Build optimizations
  build: {
    inlineStylesheets: 'auto',
  },
  // Site metadata (update with your production URL)
  site: 'https://captain-games-store.pages.dev',
});