import { message, superValidate, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { editUserSchema } from '@/auth/form_schemas';
import { createFormDataFromObject } from '@/utils';
import type { DefaultApiResponse } from '@/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(editUserSchema))
	};
};

export const actions: Actions = {
	editUserFullName: async ({ params, locals: { apiClient }, request }) => {
		const form = await superValidate(request, zod(editUserSchema));

		if (!form.valid) {
			return message(withFiles(form), { text: 'Invalid form', success: false });
		}

		const formData = form.data;

		const body = createFormDataFromObject(formData);

		const res = await apiClient.patch(`api/users/${params.userId}`, {
			body
		});

		const { success } = await res.json<DefaultApiResponse>();

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
