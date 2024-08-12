import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hash } from '@node-rs/argon2';
import { signUpFormSchema } from '@/auth/form_schemas';
import { createUserSession } from '@/auth/handlers';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(signUpFormSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, locals: { honoClient } }) => {
		const form = await superValidate(request, zod(signUpFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const formData = form.data;

		const hashedPassword = await hash(formData.password);

		const res = await honoClient.api.auth.user.$post({
			form: {
				email: formData.email,
				password: hashedPassword,
				fullName: formData.fullName
			}
		});

		const { userId } = await res.json();

		if (!userId || res.status >= 400) {
			return fail(res.status, {
				form
			});
		}

		await createUserSession(userId, cookies);

		redirect(302, `/user/${userId}`);
	}
};
