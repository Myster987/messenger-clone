<script lang="ts">
	import { onMount } from 'svelte';
	import { LoaderCircle } from 'lucide-svelte';
	import { honoClientStore, userStore } from '@/stores';
	import { ProfileImage } from '../profile_image';
	import IntersectionObserver from 'svelte-intersection-observer';
	import MessageItem from './MessageItem.svelte';
	import type { Member, MemberWithProfileImage, MessageWithMember } from '@/types';

	export let messages: MessageWithMember[];
	export let members: MemberWithProfileImage[];

	let element: HTMLElement;
	let firstElement: HTMLElement;
	export let currentMember: Member;
	export let isIntersecting: boolean;
	export let isLoadingMore: boolean = false;
	export let fetchMore: () => void;

	const updateSeenMessages = async (messages: MessageWithMember[]) => {
		$honoClientStore.api.socket.messages.seen_message[':conversationId'].$patch({
			param: {
				conversationId: currentMember.conversationId
			},
			json: {
				memberId: currentMember.id,
				lastSeenMessageId: messages[0].message.id
			}
		});
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

	let mounted = false;

	$: if (isIntersecting) fetchMore();
	$: if (mounted) {
		const newestMessage = messages[0];

		if (newestMessage.message.id != currentMember.lastSeenMessageId) {
			updateSeenMessages(messages);
			firstElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
		}
	}
	$: if (firstElement && mounted) {
		firstElement.scrollIntoView(false);
	}
	$: updateSeenByMembers(messages, members);

	onMount(() => {
		mounted = true;
	});
</script>

<ul class="flex h-full flex-1 flex-col-reverse px-5">
	{#each messages as message, i (message.message.id)}
		{#if i == 0}
			<li
				class={messages[i + 1]?.conversationMember.id != message.conversationMember.id
					? 'pt-3'
					: ''}
			>
				<MessageItem
					data={message}
					showProfileImage={messages[i - 1]?.conversationMember.id != message.conversationMember.id}
				>
					<div class="flex justify-end gap-0.5" bind:this={firstElement}>
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
		{:else}
			<li
				class={messages[i + 1]?.conversationMember.id != message.conversationMember.id
					? 'pt-3'
					: ''}
			>
				<MessageItem
					data={message}
					showProfileImage={messages[i - 1]?.conversationMember.id != message.conversationMember.id}
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
</ul>
