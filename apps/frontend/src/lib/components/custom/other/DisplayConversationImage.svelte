<script lang="ts">
	import { userStore } from '@/stores';
	import * as Avatar from '@/components/ui/avatar';
	import type { SelectConversationImages, SelectProfileImages } from 'db/schema';

	export let isGroup: boolean;
	export let conversationName: string;
	export let conversationImage: SelectConversationImages | null;
	export let usersProfileImages: (Pick<SelectProfileImages, 'userId' | 'imageUrl'> | null)[];

	console.log(usersProfileImages);
</script>

<Avatar.Root class="h-12 w-12 overflow-visible">
	{#if conversationImage}
		<Avatar.Image src={conversationImage.imageUrl} alt="Image of conversation {conversationName}" />
	{:else if usersProfileImages}
		{#if isGroup}
			<div class="relative mt-[2px] flex h-12 w-12">
				<Avatar.Image
					src={usersProfileImages[0]?.imageUrl}
					alt="Image of conversation {conversationName} member"
					class="absolute -right-1 -top-1 h-9 w-9 rounded-full border-2"
				/>
				<Avatar.Image
					src={usersProfileImages[1]?.imageUrl}
					alt="Image of conversation {conversationName} member"
					class="absolute bottom-0 left-0 h-9 w-9 rounded-full border-2"
				/>
			</div>
		{:else}
			<Avatar.Image
				src={usersProfileImages.find((val) => val?.userId != $userStore?.id)?.imageUrl}
				alt="Image of user"
				class="h-12 w-12 rounded-full border"
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
