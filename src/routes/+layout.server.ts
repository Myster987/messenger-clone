import { queryUserProfileImageById } from '@/db/queries';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { user } }) => {
	const userData = await queryUserProfileImageById.get({ userId: user?.id || '' });

	return {
		user: userData
	};
};
