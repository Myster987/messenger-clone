import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { auth, type User } from '@/auth';
import { signUpFormSchema } from '@/auth/form_schemas';
import type { Actions, PageServerLoad } from './$types';
import type { ApiResponse } from '@/types';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(signUpFormSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, locals: { apiClient } }) => {
		const form = await superValidate(request, zod4(signUpFormSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password, fullName } = form.data;

		const response = await auth.api.signUpEmail({
			body: {
				email,
				password,
				name: fullName
			},
			asResponse: true
		});

		if (!response.ok) {
			return fail(response.status, { form });
		}

		const { user }: { user: User } = await response.json();

		const res = await apiClient.post(`api/users/default_profile_pict/${user.id}`);

		const { success } = await res.json<ApiResponse<{ success: boolean }>>();

		if (!success) {
			return error(500, 'Something went wrong on.');
		}

		for (const cookie of response.headers.getSetCookie()) {
			const eqIdx = cookie.indexOf('=');
			const name = cookie.slice(0, eqIdx);
			const value = decodeURIComponent(cookie.slice(eqIdx + 1).split(';')[0]);
			cookies.set(name, value, { path: '/' });
		}

		redirect(302, `/user/${user.id}`);
	}
};
