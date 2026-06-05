import { building } from '$app/environment';
import { env } from '$env/dynamic/public';
import { redirect, type Handle } from '@sveltejs/kit';
import { handleLoginRedirect } from '@/auth/handlers'; // keep this
import { auth } from '@/auth'; // your better-auth instance
import { svelteKitHandler } from 'better-auth/svelte-kit';
import ky from 'ky';
import { queryUserByIdWithProfileImageWithoutPassword } from '@/db/queries';

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session?.user) {
		const userData =
			(await queryUserByIdWithProfileImageWithoutPassword.get({
				userId: session.user.id
			})) || null;

		event.locals.user = userData;
	} else {
		event.locals.user = null;
	}

	event.locals.session = session?.session ?? null;

	event.locals.apiClient = ky.create({
		prefixUrl: env.PUBLIC_API_URL || 'http://placeholder',
		credentials: 'include',
		fetch: event.fetch,
		throwHttpErrors: false
	});

	if (event.url.pathname.startsWith('/user') && !event.locals.user) {
		redirect(302, handleLoginRedirect(event));
	}

	if (event.url.pathname.startsWith('/sign_in') && event.locals.user) {
		redirect(302, `/user/${event.locals.user.id}`);
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
