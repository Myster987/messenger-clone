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
	import type { SocketMessage, SocketUpdateMembers, StoreConversation } from '@/types';
	import { beforeNavigate } from '$app/navigation';

	export let data: LayoutData;

	$: conversationsStore.updateAsync(data.streamed.conversations);
	$: if ($conversationsStore.data)
		$conversationsStore.data = $conversationsStore.data.sort((a, b) => {
			const dateA = new Date(a.conversation.latestMessage?.updatedAt || 0) as unknown as number;
			const dateB = new Date(b.conversation.latestMessage?.updatedAt || 0) as unknown as number;
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

	$: if (browser && $conversationsStore.data) {
		$conversationsStore.data?.forEach((c) =>
			ioClient.attachEvent({
				eventName: `conversation:${c.conversation.id}:updateMembers`,
				key: `conversation:${c.conversation.id}:groupName:updateMembersData`,
				callback: (data: SocketUpdateMembers) => {
					if (data.type == 'add') {
						const { conversation } = $conversationsStore.data?.find(
							(c) => c.conversation.id == data.conversationId
						)!;

						for (let i = 0; i < conversation.members.length; i++) {
							if (data.members.find((m) => m.id == conversation.members[i].id))
								conversation.members[i].currentlyMember = true;
						}

						const updatedMembers = [...conversation.members, ...data.members].filter(
							(obj1, i, arr) => arr.findIndex((obj2) => obj2.id == obj1.id) == i
						);

						$conversationsStore.data = $conversationsStore.data?.map((c) => {
							if (c.conversation.id == conversation.id) {
								c.conversation.members = updatedMembers;
							}
							return c;
						});
					} else if (data.type == 'leave') {
						$conversationsStore.data = $conversationsStore.data?.map((c) => {
							if (c.conversation.id == data.conversationId) {
								c.conversation.members = c.conversation.members.map((m) => {
									if (m.id == data.memberId) {
										m.currentlyMember = false;
									}
									return m;
								});
							}
							return c;
						});
					}
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

	beforeNavigate((navigationEvent) => {
		if (navigationEvent.to?.url.pathname == '/sign_in') {
			console.log('clean up');
			$conversationsStore.data?.forEach((c) => {
				ioClient.deleteListenerByKey({
					eventName: `user:${$userStore?.id}:newConversation`,
					key: `user:${$userStore?.id}:newConversation`
				});
				ioClient.deleteListenerByKey({
					eventName: `conversation:${c.conversation.id}:messages`,
					key: `conversation:${c.conversation.id}:updateLatestMessage`
				});
				ioClient.deleteListenerByKey({
					eventName: `conversation:${c.conversation.id}:seenMessage`,
					key: `conversation:${c.conversation.id}:seenMessageUpdateConversationsStore`
				});
				ioClient.deleteListenerByKey({
					eventName: `conversation:${c.conversation.id}:nicks`,
					key: `conversation:${c.conversation.id}:nicks`
				});
				ioClient.deleteListenerByKey({
					eventName: `conversation:${c.conversation.id}:groupName`,
					key: `conversation:${c.conversation.id}:groupName:updateConversationName`
				});
				ioClient.deleteListenerByKey({
					eventName: `conversation:${c.conversation.id}:groupImage`,
					key: `conversation:${c.conversation.id}:groupName:updateConversationImage`
				});
				ioClient.deleteListenerByKey({
					eventName: `conversation:${c.conversation.id}:updateMembers`,
					key: `conversation:${c.conversation.id}:groupName:updateMembersData`
				});
			});
		}
	});
</script>

<div class="flex h-full gap-4 p-4">
	<Sidebar />
	<ChatsCard />
	<div class="flex-grow">
		<slot />
	</div>
</div>
