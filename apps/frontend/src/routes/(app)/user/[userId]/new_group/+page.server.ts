import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createGroupSchema } from '@/auth/form_schemas';
import type { ApiResponse } from '@/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(createGroupSchema))
	};
};

export const actions: Actions = {
	createGroup: async ({ request, params: { userId }, locals: { apiClient } }) => {
		const form = await superValidate(request, zod(createGroupSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const formData = form.data;

		const res = await apiClient.post('api/conversations/group', {
			json: formData
		});

		const { success, conversationId } =
			await res.json<ApiResponse<{ conversationId: string | null }>>();

		if (!success) {
			return fail(res.status, { form });
		}

		return redirect(302, `/user/${userId}/conversation/${conversationId}`);
	}
};
