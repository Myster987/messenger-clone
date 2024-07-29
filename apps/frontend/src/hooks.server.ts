import { PUBLIC_API_URL } from '$env/static/public';
import { redirect, type Handle } from '@sveltejs/kit';
import { authenticateUser, handleLoginRedirect } from '@/auth/handlers';
import { createHonoClient } from 'backend';

export const handle: Handle = async ({ event, resolve }) => {
	const { user, session } = await authenticateUser(event.cookies);
	event.locals.user = user;
	event.locals.session = session;
	event.locals.honoClient = createHonoClient(PUBLIC_API_URL, event.fetch);

	if (event.url.pathname.startsWith('/user') && !user) {
		redirect(302, handleLoginRedirect(event));
	}

	if (event.url.pathname.startsWith('/sign_in') && user) {
		redirect(302, `/user/${user.id}`);
	}

	return resolve(event);
};
