import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ locals: { honoClient }, params: { userId }, request }) => {
		const formData = Object.fromEntries(await request.formData()) as unknown as {
			secondUserId: string;
		};

		const res = await honoClient.api.conversations.chat.$post({
			json: {
				firstUserId: userId,
				secondUserId: formData.secondUserId
			}
		});

		const { success } = await res.json();

		if (!success) {
			return fail(res.status, { success });
		}

		return {
			success
		};
	}
};
