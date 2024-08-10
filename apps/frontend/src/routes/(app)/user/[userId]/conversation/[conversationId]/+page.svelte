<script lang="ts">
	import { page } from '$app/stores';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import { ioClient } from '@/socket';
	import { currentConversationStore, honoClientStore, userStore } from '@/stores';
	import { DisplayConversationImage, DisplayConversationName } from '@/components/custom/other';
	import { Badge } from '@/components/ui/badge';
	import { ScrollArea } from '@/components/ui/scroll-area';
	import { InputMessage } from '@/components/custom/input';
	import { ConversationMessages } from '@/components/custom/message';
	import * as Card from '@/components/ui/card';
	import type { SocketMessage } from '@/types';
	import type { PageData } from './$types';

	export let data: PageData;
	const { conversationData, messageFormObject, imageFormObject } = data;

	$currentConversationStore = conversationData!;

	const conversationId = $page.params.conversationId;
	const currentMember = $currentConversationStore.members.find(
		(val) => val.userId == $userStore?.id
	)!;

	let isIntersecting: boolean;
	let isOnline: boolean;

	$: isOnline =
		$currentConversationStore.members.some(
			(val) => val.user.isOnline && val.userId != $userStore?.id
		) || false;

	const fetchMessages = async (page = '0') => {
		const res = await $honoClientStore.api.socket.messages[':conversationId'].$get({
			param: { conversationId: conversationId },
			query: { page }
		});
		return res.json();
	};

	const conversationKey = `conversation:${conversationId}`;

	const messagesQuery = createInfiniteQuery({
		queryKey: [`${conversationKey}:messages`],
		queryFn: ({ pageParam }) => fetchMessages(pageParam),
		initialPageParam: '0',
		getNextPageParam: (lastPage) => (lastPage.nextPage ? String(lastPage.nextPage) : undefined)
	});

	const fetchNextPage = () => {
		if ($messagesQuery.hasNextPage) {
			$messagesQuery.fetchNextPage();
		}
	};

	$: messages = $messagesQuery.data?.pages.flatMap((page) => page.data || []) || [];

	$ioClient?.on(`${conversationKey}:messages`, (data: SocketMessage) => {
		messages = [data.body, ...messages];
	});

	$ioClient?.on(
		`${conversationKey}:seenMessage`,
		(data: { lastSeenMessageId: string; memberId: string }) => {
			$currentConversationStore.members = $currentConversationStore.members.map((member) => {
				if (member.id == data.memberId) {
					member.lastSeenMessageId = data.lastSeenMessageId;
				}
				return member;
			});
		}
	);
</script>

<Card.Root class="flex h-full w-full flex-col">
	<Card.Header class="h-14 border-b px-3 py-1">
		<div class="relative flex items-center gap-2">
			{#if conversationData}
				<div class="relative">
					<DisplayConversationImage
						isGroup={$currentConversationStore.isGroup}
						conversationImage={$currentConversationStore.conversationImage}
						conversationName={$currentConversationStore.name}
						usersProfileImages={$currentConversationStore.members.map(
							(member) => member.user.profileImage
						)}
						height={9}
						width={9}
					/>
					{#if isOnline}
						<Badge variant="online" class="absolute -bottom-[2px] -right-[2px]" />
					{/if}
				</div>
				<div>
					<DisplayConversationName
						members={$currentConversationStore.members}
						isGroup={$currentConversationStore.isGroup}
						groupName={$currentConversationStore.name}
					/>
					<p class="text-muted-foreground text-sm font-light">
						{#if isOnline}
							Online
						{:else}
							Offline
						{/if}
					</p>
				</div>
			{/if}
		</div>
	</Card.Header>

	<Card.Content class="flex-grow p-0">
		<ScrollArea class="h-[calc(100vh-146px)]">
			<ConversationMessages
				{currentMember}
				{messages}
				{isIntersecting}
				members={$currentConversationStore.members}
				fetchMore={fetchNextPage}
				isLoadingMore={$messagesQuery.isLoading}
			/>
		</ScrollArea>
	</Card.Content>

	<Card.Footer class="h-[60px] p-2">
		<InputMessage {messageFormObject} {imageFormObject} currentMemberId={currentMember?.id || ''} />
	</Card.Footer>
</Card.Root>
