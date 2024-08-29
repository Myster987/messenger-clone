<script lang="ts">
	import { userStore } from '@/stores';
	import * as Avatar from '@/components/ui/avatar';
	import { type SelectConversationImages, type SelectProfileImages } from '@/db/schema';

	export let isGroup: boolean;
	export let conversationName: string;
	export let conversationImage: SelectConversationImages | null;
	export let usersProfileImages: (Pick<SelectProfileImages, 'userId' | 'imageUrl'> | null)[];

	export let width = 12;
	export let height = 12;
</script>

<div class="h-{height} w-{width} overflow-visible">
	{#if conversationImage}
		<Avatar.Root class="h-full w-full">
			<Avatar.Image
				src={conversationImage.imageUrl}
				alt="Image of conversation {conversationName}"
			/>
			<Avatar.Fallback
				>{conversationName
					.split(' ')
					.map((val) => val[0].toUpperCase())
					.join('')}</Avatar.Fallback
			>
		</Avatar.Root>
	{:else if usersProfileImages}
		{#if isGroup}
			<div class="relative mt-[2px] flex h-full w-full">
				<Avatar.Root
					class="absolute -right-1 -top-1 h-{height - 3} w-{width - 3} rounded-full border-2"
				>
					<Avatar.Image
						src={usersProfileImages[0]?.imageUrl}
						alt="Image of conversation {conversationName} member"
					/>
					<Avatar.Fallback
						>{conversationName
							.split(' ')
							.map((val) => val[0].toUpperCase())
							.join('')}</Avatar.Fallback
					>
				</Avatar.Root>

				<Avatar.Root
					class="absolute bottom-0 left-0 h-{height - 3} w-{width - 3} rounded-full border-2"
				>
					<Avatar.Image
						src={usersProfileImages[1]?.imageUrl}
						alt="Image of conversation {conversationName} member"
					/>
					<Avatar.Fallback
						>{conversationName
							.split(' ')
							.map((val) => val[0].toUpperCase())
							.join('')}</Avatar.Fallback
					>
				</Avatar.Root>
			</div>
		{:else}
			<Avatar.Root class="h-full w-full">
				<Avatar.Image
					src={usersProfileImages.find((val) => val?.userId != $userStore?.id)?.imageUrl}
					alt="Image of user"
					class="h-{height} w-{width} rounded-full border"
				/>
				<Avatar.Fallback
					>{conversationName
						.split(' ')
						.map((val) => val[0].toUpperCase())
						.join('')}</Avatar.Fallback
				>
			</Avatar.Root>
		{/if}
	{/if}
</div>
