import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hash } from '@node-rs/argon2';
import { signUpFormSchema } from '@/auth/form_schemas';
import { createUserSession } from '@/auth/handlers';
import { createFormDataFromObject } from '@/utils';
import type { Actions, PageServerLoad } from './$types';
import type { ApiResponse } from '@/types';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(signUpFormSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, locals: { apiClient } }) => {
		const form = await superValidate(request, zod(signUpFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const formData = form.data;

		const hashedPassword = await hash(formData.password);

		const body = createFormDataFromObject({
			email: formData.email,
			password: hashedPassword,
			fullName: formData.fullName
		});

		const res = await apiClient.post('api/auth/user', {
			body
		});

		const { userId } = await res.json<ApiResponse<{ userId: string | null }>>();

		if (!userId || res.status >= 400) {
			return fail(res.status, {
				form
			});
		}

		await createUserSession(userId, cookies);

		redirect(302, `/user/${userId}`);
	}
};
