<script lang="ts">
	import { page } from '$app/stores';
	import { beforeNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';
	import { ioClient } from '@/socket';
	import { userStore, honoClientStore, conversationsStore } from '@/stores';
	import { Ellipsis } from 'lucide-svelte';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { ScrollArea } from '@/components/ui/scroll-area';
	import { InputMessage } from '@/components/custom/input';
	import { ConversationMessages } from '@/components/custom/message';
	import { EditConversationNicksDialog } from '@/components/custom/dialog';
	import { DisplayConversationImage, DisplayConversationName } from '@/components/custom/other';
	import * as Card from '@/components/ui/card';
	import type { SocketMessage } from '@/types';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ conversationData, messageFormObject, imageFormObject, messagesData } = data);

	let isIntersecting: boolean;
	let moreInfoOpen = false;

	$: conversationId = $page.params.conversationId;
	$: currentMember = conversationData?.members.find((val) => val.userId == $userStore?.id)!;

	$: if (browser && $conversationsStore.data) {
		conversationData = $conversationsStore.data.find((c) => c.conversation.id == conversationId)
			?.conversation as typeof conversationData;
	}

	$: isOnline =
		conversationData?.members.some((val) => val.user.isOnline && val.userId != $userStore?.id) ||
		false;

	$: messages = writable({
		data: messagesData.messages,
		isLoading: false,
		nextPage: messagesData.nextPage
	});

	const fetchMessages = async (page = '0') => {
		$messages.isLoading = true;
		const res = await $honoClientStore.api.socket.messages[':conversationId'].$get({
			param: {
				conversationId
			},
			query: {
				page
			}
		});
		const { data: resData, nextPage: nextApiPage } = await res.json();
		$messages = {
			data: [...$messages.data, ...(resData || [])],
			isLoading: false,
			nextPage: nextApiPage
		};
	};

	const fetchNextPage = () => {
		if ($messages.nextPage) {
			fetchMessages(String($messages.nextPage));
		}
	};

	$: conversationKey = `conversation:${conversationId}`;

	$: ioClient.attachEvent({
		eventName: `${conversationKey}:messages`,
		key: `${conversationKey}:addNewMessageToArray`,
		callback: (data: SocketMessage) => {
			if (data.body.conversationMember.conversationId == conversationId) {
				$messages.data = [data.body, ...$messages.data];
			}
		}
	});

	$: ioClient.attachEvent({
		eventName: `${conversationKey}:seenMessage`,
		key: `${conversationKey}:markAsSeen`,
		callback: (data: { lastSeenMessageId: string; memberId: string }) => {
			if (conversationData) {
				conversationData.members = conversationData?.members.map((member) => {
					if (member.id == data.memberId) {
						member.lastSeenMessageId = data.lastSeenMessageId;
					}
					return member;
				});
			}
		}
	});

	$: ioClient.attachEvent({
		eventName: `${conversationKey}:deletedMessages`,
		key: `${conversationKey}:deletedMessages`,
		callback: (data: { messageId: string }) => {
			$messages.data = $messages.data.map((m) => {
				if (m.message.id != data.messageId) {
					return m;
				} else {
					m.message.body = null;
					m.message.imageId = null;
					return m;
				}
			});
		}
	});

	$: ioClient.attachEvent({
		eventName: `${conversationKey}:editedMessages`,
		key: `${conversationKey}:editedMessages`,
		callback: (data: {
			messageId: string;
			newBody: string | null;
			imageUrl: string | null;
			updatedAt: string;
		}) => {
			$messages.data = $messages.data.map((m) => {
				if (m.message.id != data.messageId) {
					return m;
				} else {
					m.message.updatedAt = data.updatedAt;
					m.message.body = data.newBody;
					m.message.imageUrl = data.imageUrl!;
					return m;
				}
			});
		}
	});

	beforeNavigate(() => {
		ioClient.deleteListenerByKey({
			eventName: `${conversationKey}:messages`,
			key: `${conversationKey}:addNewMessageToArray`
		});
		ioClient.deleteListenerByKey({
			eventName: `${conversationKey}:seenMessage`,
			key: `${conversationKey}:markAsSeen`
		});
		ioClient.deleteListenerByKey({
			eventName: `${conversationKey}:deletedMessages`,
			key: `${conversationKey}:deletedMessages`
		});
		ioClient.deleteListenerByKey({
			eventName: `${conversationKey}:editedMessages`,
			key: `${conversationKey}:editedMessages`
		});
	});
</script>

<div class="flex gap-4">
	<Card.Root class="flex h-full w-full flex-col">
		<Card.Header class="flex h-14 flex-row justify-between border-b px-3 py-1">
			<div class="relative flex items-center gap-2">
				{#if conversationData}
					<div class="relative {conversationData.isGroup && 'mt-1'}">
						{#if conversationData.isGroup}
							<DisplayConversationImage
								isGroup={conversationData.isGroup}
								conversationImage={conversationData.conversationImage}
								conversationName={conversationData.name}
								usersProfileImages={conversationData.members.map(
									(member) => member.user.profileImage
								)}
								height={10}
								width={10}
							/>
						{:else}
							<DisplayConversationImage
								isGroup={conversationData.isGroup}
								conversationImage={conversationData.conversationImage}
								conversationName={conversationData.name}
								usersProfileImages={conversationData.members.map(
									(member) => member.user.profileImage
								)}
								height={9}
								width={9}
							/>
						{/if}
						{#if isOnline}
							<Badge variant="online" class="absolute -bottom-[2px] -right-[2px]" />
						{/if}
					</div>
					<div>
						<DisplayConversationName
							members={conversationData.members}
							isGroup={conversationData.isGroup}
							groupName={conversationData.name}
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

			<div>
				<Button
					variant="ghost"
					size="icon"
					class="rounded-full"
					on:click={() => (moreInfoOpen = !moreInfoOpen)}><Ellipsis /></Button
				>
			</div>
		</Card.Header>

		<Card.Content class="flex-grow p-0">
			<ScrollArea class="h-[calc(100vh-146px)]">
				<ConversationMessages
					{currentMember}
					{messages}
					conversationName={conversationData?.name || ''}
					conversationImage={conversationData?.conversationImage || null}
					{isIntersecting}
					members={conversationData?.members || []}
					fetchMore={fetchNextPage}
					isLoadingMore={$messages.isLoading}
					isGroup={conversationData?.isGroup || false}
					hasNextPage={$messages.nextPage ? true : false}
				/>
			</ScrollArea>
		</Card.Content>

		<Card.Footer class="h-[60px] p-2">
			<InputMessage
				{messageFormObject}
				{imageFormObject}
				currentMemberId={currentMember?.id || ''}
			/>
		</Card.Footer>
	</Card.Root>

	<Card.Root class="w-[clamp(300px,300px+10svw,600px)] {!moreInfoOpen && 'hidden'}">
		<Card.Header class="flex items-center gap-1">
			{#if conversationData}
				{#if conversationData.isGroup}
					<div class="h-[66px] w-[66px]">
						<DisplayConversationImage
							isGroup={conversationData.isGroup}
							conversationImage={conversationData.conversationImage}
							conversationName={conversationData.name}
							usersProfileImages={conversationData.members.map(
								(member) => member.user.profileImage
							)}
							width={14}
							height={14}
						/>
					</div>
				{:else}
					<div class="h-24 w-24">
						<DisplayConversationImage
							isGroup={conversationData.isGroup}
							conversationImage={conversationData.conversationImage}
							conversationName={conversationData.name}
							usersProfileImages={conversationData.members.map(
								(member) => member.user.profileImage
							)}
							width={15}
							height={15}
						/>
					</div>
				{/if}
			{/if}
			<Card.Title
				><DisplayConversationName
					members={conversationData?.members || []}
					isGroup={conversationData?.isGroup}
					groupName={conversationData?.name}
				/></Card.Title
			>
		</Card.Header>

		<div class="px-3">
			<EditConversationNicksDialog members={conversationData?.members || []} />
		</div>
	</Card.Root>
</div>
