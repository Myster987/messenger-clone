<script lang="ts">
	import { page } from '$app/stores';
	import { beforeNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';
	import { ioClient } from '@/socket';
	import { userStore, apiClientStore, conversationsStore, windowWidth } from '@/stores';
	import { Ellipsis } from 'lucide-svelte';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { ScrollArea } from '@/components/ui/scroll-area';
	import { InputMessage } from '@/components/custom/input';
	import { BackToLinkButton } from '@/components/custom/buttons';
	import { ConversationMessages } from '@/components/custom/message';
	import { DisplayConversationImage, DisplayConversationName } from '@/components/custom/other';
	import {
		ConversationInfoCard,
		ConversationInfoSheet
	} from '@/components/custom/cards/conversation-info';
	import * as Card from '@/components/ui/card';
	import type { ApiResponse, MessageWithMember, SocketMessage } from '@/types';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({
		conversationData,
		messageFormObject,
		imageFormObject,
		addMembersToGroupFormObject,
		messagesData
	} = data);

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
		const res = await $apiClientStore.get(
			`api/socket/messages/${conversationId}?` +
				new URLSearchParams({
					page
				}).toString()
		);
		const { data: resData, nextPage: nextApiPage } =
			await res.json<ApiResponse<{ data: MessageWithMember[]; nextPage: number | null }>>();
		$messages = {
			data: [...$messages.data, ...(resData || [])].filter(
				(obj1, i, arr) => arr.findIndex((obj2) => obj2.message.id == obj1.message.id) == i
			),
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
			$messages.data = [data.body, ...$messages.data];
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
				if (m.message.id == data.messageId) {
					m.message.body = null;
					m.message.imageId = null;
				}
				return m;
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
				if (m.message.id == data.messageId) {
					m.message.updatedAt = data.updatedAt;
					m.message.body = data.newBody;
					m.message.imageUrl = data.imageUrl!;
				}
				return m;
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

<div class="flex h-full gap-4">
	<Card.Root
		class="flex h-full w-full flex-col rounded-none border-none lg:flex lg:rounded-lg lg:border lg:border-solid"
	>
		<Card.Header class="flex h-14 flex-row justify-between border-b px-3 py-1">
			<div class="relative flex items-center gap-2">
				{#if $windowWidth < 1024}
					<BackToLinkButton href="/user/{$userStore?.id}" />
				{/if}
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
				{#if $windowWidth < 1024}
					<ConversationInfoSheet {currentMember} {conversationData} {addMembersToGroupFormObject} />
				{:else}
					<Button
						variant="ghost"
						size="icon"
						class="rounded-full"
						on:click={() => (moreInfoOpen = !moreInfoOpen)}><Ellipsis /></Button
					>
				{/if}
			</div>
		</Card.Header>

		<Card.Content class="flex-grow p-0">
			<ScrollArea class="h-[calc(100vh-116px)] lg:h-[calc(100vh-146px)]">
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

	{#if $windowWidth >= 1024}
		<ConversationInfoCard
			{currentMember}
			{addMembersToGroupFormObject}
			{conversationData}
			class="{moreInfoOpen ? '' : 'hidden'} w-[clamp(300px,300px+12vw,600px)]"
		/>
	{/if}
</div>
