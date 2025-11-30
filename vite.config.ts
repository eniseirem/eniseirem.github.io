import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0',
		port: 1111
	},
	preview: {
		port: 4173,
		host: '0.0.0.0'
	},
	resolve: {
		alias: {
			$lib: '/src/lib'
		}
	},
});
