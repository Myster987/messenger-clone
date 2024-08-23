<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public';
	import { browser } from '$app/environment';
	import { io } from 'socket.io-client';
	import { ioClient } from '@/socket';
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

	$: ioClient.attachEvent({
		eventName: `user:${$userStore?.id}:newConversation`,
		key: `user:${$userStore?.id}:newConversation`,
		callback: (data: StoreConversation) => {
			$conversationsStore.data = [...($conversationsStore?.data || []), data];
		}
	});

	$: if (browser && $conversationsStore.data) {
		$conversationsStore.data.forEach((c) =>
			ioClient.attachEvent({
				eventName: `conversation:${c.conversation.id}:messages`,
				key: `conversation:${c.conversation.id}:updateLatestMessage`,
				callback: (data: SocketMessage) => {
					$conversationsStore.data = $conversationsStore.data?.map((val) => {
						if (val.conversation.id == c.conversation.id) {
							val.conversation.latestMessage = data.body.message;
							val.conversation.latestMessageId = data.body.message.id;
						}
						return val;
					});
				}
			})
		);
	}

	$: if (browser && $conversationsStore.data) {
		$conversationsStore.data.forEach((c) =>
			ioClient.attachEvent({
				eventName: `conversation:${c.conversation.id}:seenMessage`,
				key: `conversation:${c.conversation.id}:seenMessageUpdateConversationsStore`,
				callback: (data: { lastSeenMessageId: string; memberId: string }) => {
					outer: for (let i = 0; i < $conversationsStore.data?.length!; i++) {
						const { conversation } = $conversationsStore.data?.at(i)!;

						for (let j = 0; j < conversation.members.length; j++) {
							const member = conversation.members.at(j);

							if (member?.id == data.memberId) {
								member.lastSeenMessageId = data.lastSeenMessageId;
								if ($conversationsStore.data) {
									$conversationsStore.data[i].conversation.members[j] = member;
								}
								break outer;
							}
						}
					}
				}
			})
		);
	}

	$: if (browser && $conversationsStore.data) {
		$conversationsStore.data?.forEach((c) =>
			ioClient.attachEvent({
				eventName: `conversation:${c.conversation.id}:nicks`,
				key: `conversation:${c.conversation.id}:nicks`,
				callback: (data: { memberId: string; newNick: string }) => {
					$conversationsStore.data = $conversationsStore.data?.map((val) => {
						if (val.conversation.id == c.conversation.id) {
							val.conversation.members = val.conversation.members.map((m) => {
								if (m.id == data.memberId) {
									m.nick = data.newNick;
								}
								return m;
							});
						}
						return val;
					});
				}
			})
		);
	}

	$: if (browser && $conversationsStore.data) {
		$conversationsStore.data?.forEach((c) =>
			ioClient.attachEvent({
				eventName: `conversation:${c.conversation.id}:groupName`,
				key: `conversation:${c.conversation.id}:groupName:updateConversationName`,
				callback: (data: { conversationId: string; newName: string }) => {
					$conversationsStore.data = $conversationsStore.data?.map((val) => {
						if (val.conversation.id == data.conversationId) {
							val.conversation.name = data.newName;
						}
						return val;
					});
				}
			})
		);
	}

	$: if (browser && $conversationsStore.data) {
		$conversationsStore.data?.forEach((c) =>
			ioClient.attachEvent({
				eventName: `conversation:${c.conversation.id}:groupImage`,
				key: `conversation:${c.conversation.id}:groupName:updateConversationImage`,
				callback: (data: {
					conversationId: string;
					newImage: {
						id: string;
						createdAt: string;
						imageUrl: string;
						publicId: string;
					};
				}) => {
					$conversationsStore.data = $conversationsStore.data?.map((val) => {
						if (val.conversation.id == data.conversationId) {
							val.conversation.conversationImage = data.newImage;
							val.conversation.conversationImageId = data.newImage.id;
						}
						return val;
					});
				}
			})
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
