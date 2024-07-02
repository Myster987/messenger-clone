import { queryUserByIdWithProfileImage } from '@/db/queries';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { user } }) => {
	const userData = await queryUserByIdWithProfileImage.get({ userId: user?.id || '' });

	return {
		user: userData
	};
};
