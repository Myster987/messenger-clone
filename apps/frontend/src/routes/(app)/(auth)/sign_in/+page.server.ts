import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { auth } from '@/auth';
import { updateUserStatusToOnlineById } from '@/db/queries';
import { signInFormSchema } from '@/auth/form_schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(signInFormSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, url, cookies }) => {
		const form = await superValidate(request, zod4(signInFormSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password } = form.data;

		const response = await auth.api.signInEmail({
			body: { email, password },
			asResponse: true
		});

		if (!response.ok) {
			return fail(400, { form });
		}

		const { user } = await response.json();

		for (const cookie of response.headers.getSetCookie()) {
			const eqIdx = cookie.indexOf('=');
			const name = cookie.slice(0, eqIdx);
			const value = decodeURIComponent(cookie.slice(eqIdx + 1).split(';')[0]);
			cookies.set(name, value, { path: '/' });
		}

		await updateUserStatusToOnlineById.run({ userId: user.id });

		const redirectTo = url.searchParams.get('redirectTo');
		if (redirectTo) {
			redirect(302, `/${redirectTo.slice(1)}`);
		}
		redirect(302, `/user/${user.id}`);
	}
};
