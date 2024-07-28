import { sveltekit } from '@sveltejs/kit/vite';
import { Server } from 'socket.io';
import { defineConfig, type Plugin as VitePlugin } from 'vite';

const websocketServer: VitePlugin = {
	name: 'websocketServer',
	configureServer: async (server) => {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer, { path: '/api/websocket', addTrailingSlash: false });

		// @ts-ignore
		const GlobalThisWSS = (await import('./src/lib/server/index.ts')).GlobalThisWSS;

		// @ts-ignore
		globalThis[GlobalThisWSS] = io;

		io.on('connection', (socket) => {
			console.log(`Socket connected ${socket.id}`);
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), websocketServer]
	// optimizeDeps: {
	// 	exclude: ['svelte-sonner', 'nanoid/non-secure', '@internationalized/date']
	// }
});
