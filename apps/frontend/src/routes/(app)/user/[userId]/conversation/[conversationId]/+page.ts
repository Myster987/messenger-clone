import { PUBLIC_API_URL } from '$env/static/public';
import { createHonoClient } from 'backend';
import { fetchWithCredentials } from '@/utils';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params: { conversationId }, data, parent }) => {
	const { queryClient } = await parent();
	const honoClient = createHonoClient(PUBLIC_API_URL, fetchWithCredentials);

	const fetchMessages = async (page = '0') => {
		const res = await honoClient.api.socket.messages[':conversationId'].$get({
			param: { conversationId: conversationId },
			query: { page }
		});
		return res.json();
	};

	const queryKey = `conversation:${conversationId}:messages`;

	queryClient.prefetchInfiniteQuery({
		queryKey: [queryKey],
		queryFn: ({ pageParam }) => fetchMessages(pageParam),
		initialPageParam: '0',
		getNextPageParam: (lastPage: { nextPage: any }) =>
			lastPage.nextPage ? String(lastPage.nextPage) : undefined
	});

	return {
		...data
	};
};
