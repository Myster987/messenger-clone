import type { ApiResponse, StoreConversation } from '@/types';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { apiClient }, params: { userId } }) => {
	const fetchConversations = async () => {
		const res = await apiClient.get(`api/conversations/user/${userId}`);

		const { data } = await res.json<ApiResponse<{ data: StoreConversation[] }>>();
		return data || [];
	};

	return {
		streamed: {
			conversations: fetchConversations()
		}
	};
};
