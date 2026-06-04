import { fail, redirect } from '@sveltejs/kit';
import { auth } from '@/auth';
import { updateUserStatusToOfflineById } from '@/db/queries';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals: { session, user } }) => {
		if (!session) {
			return fail(401);
		}

		await Promise.all([
			auth.api.signOut({ headers: request.headers }),
			updateUserStatusToOfflineById.run({ userId: user?.id })
		]);

		redirect(302, '/sign_in');
	}
};
