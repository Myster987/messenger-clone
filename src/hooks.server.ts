import { building } from '$app/environment';
import { createHonoClient } from '@/api/client';
import { authenticateUser, handleLoginRedirect } from '@/auth/handlers';
import { GlobalThisWSS, type ExtendedGlobal } from '@/server';
import { redirect, type Handle } from '@sveltejs/kit';

let wssInitailized = false;
const startupWss = () => {
	if (wssInitailized) return;
	const io = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	if (io != undefined) {
		io.on('connection', (socket) => {
			console.log(`Socket connected ${socket.id}`);
		});
	}
	wssInitailized = true;
};

export const handle: Handle = async ({ event, resolve }) => {
	startupWss();
	if (!building) {
		const io = (globalThis as ExtendedGlobal)[GlobalThisWSS];
		if (io != undefined) {
			event.locals.io = io;
		}
	}
	const { user, session } = await authenticateUser(event.cookies);
	event.locals.user = user;
	event.locals.session = session;
	event.locals.honoClient = createHonoClient(event.fetch);

	if (event.url.pathname.startsWith('/user') && !user) {
		redirect(302, handleLoginRedirect(event));
	}

	if (event.url.pathname.startsWith('/sign_in') && user) {
		redirect(302, `/user/${user.id}`);
	}

	return resolve(event);
};
