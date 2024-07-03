import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { editUserSchema } from '@/auth/form_schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(editUserSchema))
	};
};

export const actions: Actions = {
	editUserFullName: async ({ params, locals: { honoClient }, request }) => {
		const formData = Object.fromEntries(await request.formData()) as unknown as {
			fullName: string;
			profileImage: File;
		};

		const res = await honoClient.api.users[':userId'].$patch({
			param: params,
			form: formData
		});

		const { success } = await res.json();

		if (!success) {
			return fail(res.status);
		}

		return {
			success
		};
	}
};
