<script lang="ts">
	import { LoaderCircle } from 'lucide-svelte';
	import { honoClientStore } from '@/stores';
	import IntersectionObserver from 'svelte-intersection-observer';
	import MessageItem from './MessageItem.svelte';
	import type { Member, MessageWithMember } from '@/types';

	export let messages: MessageWithMember[];

	let element: HTMLElement;
	let lastElement: HTMLElement;
	let isIntersectingFirstElement: boolean;
	export let currentMember: Member;
	export let isIntersecting: boolean;
	export let isLoadingMore: boolean = false;
	export let fetchMore: () => void;

	const scrollToBottom = () => {
		lastElement.scrollIntoView(false);
	};

	const updateSeenMessages = async () => {
		const newestMessage = messages[0];

		if (newestMessage.conversationMember.id == currentMember.id) return;

		if (newestMessage.conversationMember.lastSeenMessageId != currentMember.lastSeenMessageId) {
			$honoClientStore.api.socket.messages.seen_message[':conversationId'].$patch({
				param: {
					conversationId: currentMember.conversationId
				},
				json: {
					memberId: currentMember.id,
					lastSeenMessageId: newestMessage.message.id
				}
			});
		}
	};

	// latest seen message by users

	$: if (isIntersecting) fetchMore();
	$: if (isIntersectingFirstElement) updateSeenMessages();
	$: if (lastElement) scrollToBottom();
</script>

<ul class="flex h-full flex-1 flex-col-reverse gap-3 px-3 pb-2">
	{#each messages as message, i (message.message.id)}
		{#if i == 0}
			<IntersectionObserver element={lastElement} bind:intersecting={isIntersectingFirstElement}>
				<li bind:this={lastElement}>
					<MessageItem data={message} />
				</li>
			</IntersectionObserver>
		{:else}
			<li>
				<MessageItem data={message} />
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
