import { fail, redirect } from '@sveltejs/kit';
import { lucia } from '@/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies, locals: { session } }) => {
		if (!session) {
			return fail(401);
		}
		await lucia.invalidateSession(session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});

		redirect(302, '/sign_in');
	}
};