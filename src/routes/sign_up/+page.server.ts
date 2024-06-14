import { fail, redirect } from '@sveltejs/kit';
import { generateId } from 'lucia';
import { hash } from '@node-rs/argon2';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { signUpFormSchema } from '@/auth/form_schemas';
import { createUserSession } from '@/auth/handlers';
import { insertUser } from '@/db/queries';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(signUpFormSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(signUpFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const formData = form.data;
		const userId = generateId(20);
		const hashedPassword = await hash(formData.password);

		const success = await insertUser.execute({
			id: userId,
			email: formData.email,
			password: hashedPassword,
            fullName: formData.fullName
		});

		if (success.rowsAffected == 0) {
			return fail(400, {
				form
			});
		}
		await createUserSession(userId, cookies);

		redirect(302, '/');
	}
};