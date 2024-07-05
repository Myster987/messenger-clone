import { message, superValidate, withFiles } from 'sveltekit-superforms';
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
		const form = await superValidate(request, zod(editUserSchema));

		if (!form.valid) {
			return message(withFiles(form), { text: 'Invalid form', success: false });
		}

		const formData = form.data;

		const res = await honoClient.api.users[':userId'].$patch({
			param: params,
			form: formData
		});

		const { success } = await res.json();

		if (!success) {
			return message(
				withFiles(form),
				{ text: 'Something went wrong', success: false },
				{ status: 500 }
			);
		}

		return message(withFiles(form), {
			text: 'Account has been edited successfully',
			success: true
		});
	}
};
