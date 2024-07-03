import { fail, redirect } from '@sveltejs/kit';
import { lucia } from '@/auth';
import { updateUserStatusToOfflineById } from '@/db/queries';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies, locals: { session, user } }) => {
		if (!session) {
			return fail(401);
		}
		await Promise.all([
			lucia.invalidateSession(session.id),
			updateUserStatusToOfflineById.run({ userId: user?.id })
		]);
		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});
		redirect(302, '/sign_in');
	}
};
