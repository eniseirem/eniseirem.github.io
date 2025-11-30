import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: false // Set to false because API routes are commented out and not needed for static build
    }),
    // Base path for GitHub Pages
    // For eniseirem.github.io (root domain), base is empty string
    // For subdirectory repos, use: '/repo-name'
    paths: {
      // Use environment variable to control base path
      // For local preview: BASE_PATH='' npm run build && npm run preview
      // For GitHub Pages root domain: base is empty (serves from root)
      base: process.env.BASE_PATH || (process.env.NODE_ENV === 'production' ? '' : '')
    },
    prerender: {
      handleHttpError: 'warn'
    }
  }
};

export default config;
