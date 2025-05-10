import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Configure preprocessors
	preprocess: [vitePreprocess(), mdsvex()],

	// Configure SvelteKit
	kit: {
		adapter: adapter()
	},

	// Add support for markdown files with .svx extension
	extensions: ['.svelte', '.svx']
};

export default config;
