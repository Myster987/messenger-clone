<script lang="ts">
	import { cn } from '@/utils';
	import { userStore } from '@/stores';
	import { DisplayDiffrentTypesOfMessages } from '@/components/custom/message';
	import type { MemberWithProfileImage, Message } from '@/types';

	export let latestMessage: Omit<Message, 'imageUrl'> | null;
	export let members: MemberWithProfileImage[];

	$: sendBy = members.find((m) => m.id == latestMessage?.senderId);
	$: isText = typeof latestMessage?.body == 'string';

	let className: string | undefined = undefined;
	export { className as class };
</script>

<p class={cn('text-muted-foreground text-left text-sm font-light', className)}>
	{#if !sendBy}
		No messages yet.
	{:else if latestMessage && latestMessage?.type != 'message'}
		<DisplayDiffrentTypesOfMessages
			isCurrentUser={sendBy.userId == $userStore?.id}
			message={latestMessage}
		/>
	{:else if isText}
		{sendBy?.nick || sendBy?.user.fullName}: {latestMessage?.body}
	{:else}
		{sendBy?.nick || sendBy?.user.fullName} send a photo.
	{/if}
</p>
