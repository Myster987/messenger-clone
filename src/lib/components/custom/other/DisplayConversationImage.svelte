<script lang="ts">
	import * as Avatar from '@/components/ui/avatar';
	import type { SelectConversationImages, SelectProfileImages } from '@/db/schema';
	import { userStore } from '@/stores';

	export let isGroup: boolean;
	export let conversationName: string;
	export let conversationImage: SelectConversationImages | null;
	export let usersProfileImages: (SelectProfileImages | null)[];
</script>

<Avatar.Root class="h-12 w-12 overflow-visible">
	{#if conversationImage}
		<Avatar.Image src={conversationImage.imageUrl} alt="Image of conversation {conversationName}" />
	{:else if usersProfileImages}
		{#if isGroup}
			<div class="relative flex h-12 w-12">
				<Avatar.Image
					src={usersProfileImages[0]?.imageUrl}
					alt="Image of conversation {conversationName}"
					class="absolute bottom-0 left-0 h-7 w-7 rounded-full"
				/>
				<Avatar.Image
					src={usersProfileImages[1]?.imageUrl}
					alt="Image of conversation {conversationName}"
					class="absolute right-0 top-0 h-7 w-7 rounded-full"
				/>
			</div>
		{:else}
			<Avatar.Image
				src={usersProfileImages.find((val) => val?.userId != $userStore?.id)?.imageUrl}
				alt="Image of user"
				class="h-12 w-12 rounded-full"
			/>
		{/if}
	{/if}
	<Avatar.Fallback
		>{conversationName
			.split(' ')
			.map((val) => val[0].toUpperCase())
			.join('')}</Avatar.Fallback
	>
</Avatar.Root>
