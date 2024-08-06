<script lang="ts">
	import { conversationsStore, userStore } from '@/stores';
	import { ProfileImage } from '../profile_image';
	import ImageMessage from './ImageMessage.svelte';

	export let data: {
		message: {
			id: string;
			createdAt: string;
			imageUrl: string;
			senderId: string;
			body: string | null;
			imageId: string | null;
		};
		conversationMember: {
			id: string;
			conversationId: string;
			userId: string;
			nick: string | null;
			lastSeenMessageId: string | null;
		};
	};

	$: senderProfile = $conversationsStore.data
		?.find((val) => val.conversation.id == data.conversationMember.conversationId)
		?.conversation.members.find((member) => member.id == data.conversationMember.id);

	$: isText = data.message.body ? true : false;
	$: isCurrentUser = data.conversationMember.userId == $userStore?.id;
</script>

{#if isCurrentUser}
	<div class="flex flex-row-reverse gap-2">
		<div class="w-4">
			<slot />
		</div>
		{#if isText}
			<p class="bg-primary rounded-full px-3 py-1 font-light text-white">
				{data.message.body}
			</p>
		{:else}
			<ImageMessage imageUrl={data.message.imageUrl} />
		{/if}
	</div>
{:else}
	<div class="flex gap-2">
		<div class="flex {isText ? 'items-center' : 'items-end'} gap-2">
			<ProfileImage
				imageUrl={senderProfile?.user.profileImage?.imageUrl}
				name={senderProfile?.nick || senderProfile?.user.fullName || ''}
				class="h-7 w-7"
			/>
		</div>
		{#if isText}
			<p class="bg-secondary rounded-full px-3 py-1 font-light">
				{data.message.body}
			</p>
		{:else}
			<ImageMessage imageUrl={data.message.imageUrl} />
		{/if}
	</div>
{/if}
