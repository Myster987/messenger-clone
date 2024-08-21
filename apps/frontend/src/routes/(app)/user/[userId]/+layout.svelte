<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public';
	import { browser } from '$app/environment';
	import { io } from 'socket.io-client';
	import { attachEvent, ioClient } from '@/socket';
	import { conversationsStore, userStore, honoClientStore } from '@/stores';
	import { setOfflineStatus, setOnlineStatus } from '@/auth/status';
	import { Sidebar } from '@/components/custom/sidebar';
	import { ChatsCard } from '@/components/custom/cards';
	import type { LayoutData } from './$types';
	import type { SocketMessage, StoreConversation } from '@/types';

	export let data: LayoutData;

	$: conversationsStore.updateAsync(data.streamed.conversations);
	$: if ($conversationsStore.data)
		$conversationsStore.data = $conversationsStore.data.sort((a, b) => {
			const dateA = new Date(
				a.conversation.latestMessage?.updatedAt || Date.now()
			) as unknown as number;
			const dateB = new Date(
				b.conversation.latestMessage?.updatedAt || Date.now()
			) as unknown as number;
			return dateB - dateA;
		});

	$: if (browser)
		$ioClient = io(PUBLIC_API_URL, { path: '/api/socket/io', addTrailingSlash: false });

	$: attachEvent(
		$ioClient,
		`user:${$userStore?.id}:newConversation`,
		`user:${$userStore?.id}:newConversation`,
		(data: StoreConversation) => {
			$conversationsStore.data = [...($conversationsStore?.data || []), data];
		}
	);

	$: if (browser && $conversationsStore.data) {
		$conversationsStore.data.forEach((c) =>
			attachEvent(
				$ioClient,
				`conversation:${c.conversation.id}:messages`,
				`conversation:${c.conversation.id}:updateLatestMessage`,
				(data: SocketMessage) => {
					$conversationsStore.data = $conversationsStore.data?.map((val) => {
						if (val.conversation.id != c.conversation.id) {
							return val;
						} else {
							val.conversation.latestMessage = data.body.message;
							val.conversation.latestMessageId = data.body.message.id;
							return val;
						}
					});
				}
			)
		);
	}

	const fetchConversations = async (userId: string) => {
		const res = await $honoClientStore.api.conversations.user[':userId'].$get({
			param: { userId }
		});

		const { data } = await res.json();
		return data || [];
	};

	const updateConversationStore = async (userId: string) => {
		// to simplify online state
		$conversationsStore.data = await fetchConversations(userId);
	};

	let interval: number;

	$: if (browser && $userStore?.id) {
		if (interval) {
			clearInterval(interval);
		}
		interval = window.setInterval(() => updateConversationStore($userStore.id), 1000 * 60 * 5);
	}

	let prevUserId: string;

	$: if (browser) {
		if (prevUserId != $userStore?.id) {
			prevUserId = $userStore?.id || '';
			setOnlineStatus($userStore?.id || '');
			setOfflineStatus($userStore?.id || '');
		}
	}
</script>

<div class="flex h-full gap-4 p-4">
	<Sidebar />
	<ChatsCard />
	<div class="flex-grow">
		<slot />
	</div>
</div>
