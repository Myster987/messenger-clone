<script lang="ts">
	import { onMount } from 'svelte';
	import { LoaderCircle } from 'lucide-svelte';
	import { honoClientStore, userStore } from '@/stores';
	import { ProfileImage } from '../profile_image';
	import { DisplayConversationImage, DisplayConversationName } from '../other';
	import IntersectionObserver from 'svelte-intersection-observer';
	import MessageItem from './MessageItem.svelte';
	import type { Member, MemberWithProfileImage, MessageWithMember } from '@/types';
	import type { SelectConversationImages } from 'db/schema';
	import type { Writable } from 'svelte/store';

	export let messages: Writable<{
		data: MessageWithMember[];
		isLoading: boolean;
		nextPage: number | null;
	}>;
	export let members: MemberWithProfileImage[];

	let element: HTMLElement;
	let firstElement: HTMLElement;
	export let currentMember: Member;
	export let conversationName: string;
	export let conversationImage: SelectConversationImages | null;
	export let isIntersecting: boolean;
	export let isLoadingMore: boolean = false;
	export let isGroup: boolean;
	export let hasNextPage: boolean;
	export let fetchMore: () => void;

	const updateSeenMessages = async (newestMessage: MessageWithMember) => {
		await $honoClientStore.api.socket.messages.seen_message[':conversationId'].$patch({
			param: {
				conversationId: currentMember.conversationId
			},
			json: {
				memberId: currentMember.id,
				lastSeenMessageId: newestMessage.message.id
			}
		});
		updateTimeout = 0;
	};

	let messagesSeenByMembers = new Map<string, string[]>();

	const updateSeenByMembers = (
		messages: MessageWithMember[],
		members: MemberWithProfileImage[]
	) => {
		messagesSeenByMembers.clear();

		messages.forEach((messageObject) => {
			members.forEach((member) => {
				if (
					member.lastSeenMessageId == messageObject.message.id &&
					member.userId != $userStore?.id
				) {
					messagesSeenByMembers = messagesSeenByMembers.set(messageObject.message.id, [
						...(messagesSeenByMembers.get(messageObject.message.id) || []),
						member.user.profileImage?.imageUrl!
					]);
				}
			});
		});
	};

	let canFetch = false;
	let mouted = false;
	let updateTimeout: number;

	$: if (isIntersecting && canFetch) fetchMore();
	$: if (mouted) {
		const newestMessage = $messages.data.at(0);

		if (newestMessage && newestMessage?.message.id != currentMember.lastSeenMessageId) {
			if (!updateTimeout) {
				updateTimeout = window.setTimeout(() => updateSeenMessages(newestMessage), 100);
			}
			firstElement?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
		}
	}
	$: if (firstElement) {
		setTimeout(
			() => firstElement?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' }),
			100
		);
	}
	$: updateSeenByMembers($messages.data, members);

	onMount(() => {
		mouted = true;
		setTimeout(() => (canFetch = true), 1000);
	});
</script>

<ul class="flex h-full flex-1 flex-col-reverse px-5">
	{#each $messages.data as message, i (message.message.id)}
		{#if i == 0}
			<li
				class={$messages.data[i + 1]?.conversationMember.id != message.conversationMember.id
					? 'pt-3'
					: ''}
			>
				<MessageItem
					data={message}
					showProfileImage={$messages.data[i - 1]?.conversationMember.id !=
						message.conversationMember.id}
				>
					<div class="flex justify-end gap-0.5">
						{#if messagesSeenByMembers.has(message.message.id)}
							{#each messagesSeenByMembers.get(message.message.id) || [] as seenBy}
								<ProfileImage
									imageUrl={seenBy}
									name={`user that seen message with id: ${message.message.id}`}
									class="h-3 w-3"
								/>
							{/each}
						{/if}
					</div>
				</MessageItem>
				<div bind:this={firstElement}></div>
			</li>
		{:else}
			<li
				class={$messages.data[i + 1]?.conversationMember.id != message.conversationMember.id
					? 'pt-3'
					: ''}
			>
				<MessageItem
					data={message}
					showProfileImage={$messages.data[i - 1]?.conversationMember.id !=
						message.conversationMember.id}
				>
					<div class="flex justify-end gap-0.5">
						{#if messagesSeenByMembers.has(message.message.id)}
							{#each messagesSeenByMembers.get(message.message.id) || [] as seenBy}
								<ProfileImage
									imageUrl={seenBy}
									name={`user that seen message with id: ${message.message.id}`}
									class="h-3 w-3"
								/>
							{/each}
						{/if}
					</div>
				</MessageItem>
			</li>
		{/if}
	{/each}
	<IntersectionObserver {element} bind:intersecting={isIntersecting}>
		<div bind:this={element} class="flex items-center justify-center p-2">
			{#if isLoadingMore}
				<LoaderCircle class="animate-spin" />
			{/if}
		</div>
	</IntersectionObserver>
	{#if !hasNextPage}
		<div class="flex flex-col items-center gap-1 p-3">
			{#if isGroup}
				<div class="h-[66px] w-[66px]">
					<DisplayConversationImage
						{isGroup}
						{conversationImage}
						{conversationName}
						usersProfileImages={members.map((member) => member.user.profileImage)}
						width={14}
						height={14}
					/>
				</div>
			{:else}
				<div class="h-24 w-24">
					<DisplayConversationImage
						{isGroup}
						{conversationImage}
						{conversationName}
						usersProfileImages={members.map((member) => member.user.profileImage)}
						width={15}
						height={15}
					/>
				</div>
			{/if}

			<h2 class="text-2xl">
				<DisplayConversationName members={members || []} {isGroup} groupName={conversationName} />
			</h2>

			<p class="text-muted-foreground">
				{#if isGroup}
					Welcome to conversation
				{:else}
					Welcome to chat with
				{/if}
				<DisplayConversationName members={members || []} {isGroup} groupName={conversationName} />
			</p>
		</div>
	{/if}
</ul>
