import { PUBLIC_API_URL } from '$env/static/public';
import { redirect, type Handle } from '@sveltejs/kit';
import { authenticateUser, handleLoginRedirect } from '@/auth/handlers';
import ky from 'ky';

export const handle: Handle = async ({ event, resolve }) => {
	const { user, session } = await authenticateUser(event.cookies);
	event.locals.user = user;
	event.locals.session = session;
	event.locals.apiClient = ky.create({
		prefixUrl: PUBLIC_API_URL,
		credentials: 'include',
		fetch: event.fetch,
		throwHttpErrors: false
	});

	if (event.url.pathname.startsWith('/user') && !user) {
		redirect(302, handleLoginRedirect(event));
	}

	if (event.url.pathname.startsWith('/sign_in') && user) {
		redirect(302, `/user/${user.id}`);
	}

	return resolve(event);
};
