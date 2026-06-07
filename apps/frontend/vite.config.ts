import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'stub-unused-better-auth-adapters',
			resolveId(id) {
				if (id.startsWith('@better-auth/kysely-adapter')) {
					return '\0stub:kysely-adapter';
				}
			},
			load(id) {
				if (id === '\0stub:kysely-adapter') {
					return 'export default {}; export const kyselyAdapter = undefined;';
				}
			}
		}
	]
});
