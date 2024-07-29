import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { honoClient }, params: { userId } }) => {
	const fetchConversations = async () => {
		const res = await honoClient.api.conversations.user[':userId'].$get({
			param: { userId }
		});

		const { data } = await res.json();
		return data || [];
	};

	return {
		streamed: {
			conversations: fetchConversations()
		}
	};
};
