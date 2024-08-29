import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { DefaultApiResponse } from '@/types';

export const actions: Actions = {
	default: async ({ locals: { apiClient }, params: { userId }, request }) => {
		const formData = Object.fromEntries(await request.formData()) as unknown as {
			secondUserId: string;
		};

		const res = await apiClient.post('api/conversations/chat', {
			json: {
				firstUserId: userId,
				secondUserId: formData.secondUserId
			}
		});

		const { success } = await res.json<DefaultApiResponse>();

		if (!success) {
			return fail(res.status, { success });
		}

		return {
			success
		};
	}
};
