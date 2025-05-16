import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { defineConfig as defineVitest } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		EntryShakingPlugin({
			targets: [
				{
					glob: 'src/lib/*/index.{js,ts}'
				},
				{
					glob: 'src/lib/*/*/index.{js,ts}'
				}
			],
			extensions: ['js', 'jsx', 'mjs', 'ts', 'tsx', 'mts', 'svelte'],
			maxWildcardDepth: 2,
			diagnostics: true
		})
	],
	resolve: {
		alias: {
			'lucide-svelte/icons': fileURLToPath(
				new URL('./node_modules/lucide-svelte/dist/icons', import.meta.url)
			)
		}
	},
	...defineVitest({
		test: {
			workspace: [
				{
					plugins: [svelteTesting()],
					test: {
						name: 'client',
						environment: 'jsdom',
						clearMocks: true,
						include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
						exclude: ['src/lib/server/**'],
						setupFiles: ['./vitest-setup-client.ts']
					}
				},
				{
					test: {
						name: 'server',
						environment: 'node',
						include: ['src/**/*.{test,spec}.{js,ts}'],
						exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
					}
				}
			]
		}
	})
});
