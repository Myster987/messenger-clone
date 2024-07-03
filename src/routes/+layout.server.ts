import { queryUserByIdWithProfileImageWithoutPassword } from '@/db/queries';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { user } }) => {
	const userData =
		(await queryUserByIdWithProfileImageWithoutPassword.get({ userId: user?.id || '' })) || null;

	return {
		user: userData
	};
};
