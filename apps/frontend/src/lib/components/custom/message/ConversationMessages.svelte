<script lang="ts">
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
	let isIntersectingFirstElement: boolean;
	export let currentMember: Member;
	export let isIntersecting: boolean;
	export let isLoadingMore: boolean = false;
	export let fetchMore: () => void;

	const updateSeenMessages = async (messages: MessageWithMember[]) => {
		const newestMessage = messages[0];

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

	$: if (isIntersecting) fetchMore();
	$: if (isIntersectingFirstElement) updateSeenMessages(messages);
	$: if (firstElement) {
		firstElement.scrollIntoView(false);
	}
	$: updateSeenByMembers(messages, members);
</script>

<ul class="flex h-full flex-1 flex-col-reverse px-5">
	{#each messages as message, i (message.message.id)}
		{#if i == 0}
			<IntersectionObserver element={firstElement} bind:intersecting={isIntersectingFirstElement}>
				<li
					class={messages[i + 1]?.conversationMember.id != message.conversationMember.id
						? 'pt-3'
						: ''}
				>
					<MessageItem
						data={message}
						showProfileImage={messages[i + 1]?.conversationMember.id !=
							message.conversationMember.id}
					>
						{#if messagesSeenByMembers.has(message.message.id)}
							{#each messagesSeenByMembers.get(message.message.id) || [] as seenBy}
								<ProfileImage
									imageUrl={seenBy}
									name={`user that seen message with id: ${message.message.id}`}
									class="h-3 w-3"
								/>
							{/each}
						{/if}
					</MessageItem>
					<div bind:this={firstElement}></div>
				</li>
			</IntersectionObserver>
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
					{#if messagesSeenByMembers.has(message.message.id)}
						{#each messagesSeenByMembers.get(message.message.id) || [] as seenBy}
							<ProfileImage
								imageUrl={seenBy}
								name={`user that seen message with id: ${message.message.id}`}
								class="h-3 w-3"
							/>
						{/each}
					{/if}
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
