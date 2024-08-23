<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { userStore } from '@/stores';
	import { toast } from 'svelte-sonner';
	import { cn } from '@/utils';
	import { ImageUp } from 'lucide-svelte';
	import { Button, buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import type { MemberWithProfileImage, StoreConversation } from '@/types';

	export let conversationImage: StoreConversation['conversation']['conversationImage'];
	export let currentMember: MemberWithProfileImage | null;

	let newImage: File | null = null;
	let editGroupImageDialogOpen = false;
</script>

<Dialog.Root
	bind:open={editGroupImageDialogOpen}
	onOpenChange={(open) => {
		if (!open) {
			newImage = null;
		}
	}}
>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]} variant="ghost" class="flex w-full justify-start gap-1"
			><ImageUp /> Edit group image</Button
		>
	</Dialog.Trigger>

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Group image</Dialog.Title>
		</Dialog.Header>
		<form
			action="/user/{$userStore?.id}/conversation/{currentMember?.conversationId}?/editConversationImage"
			method="post"
			enctype="multipart/form-data"
			use:enhance={() => {
				toast.loading('Please wait. It can take a while...');
				return async ({ result }) => {
					if (result.type == 'success') {
						toast.success('Image successfully changed.');
					}
				};
			}}
		>
			<input type="text" name="changedById" value={currentMember?.id} hidden />

			<div class="h-60 overflow-hidden">
				{#if browser}
					<!-- it's fine -->
					{#if conversationImage || newImage}
						<img
							src={newImage ? URL.createObjectURL(newImage) : conversationImage?.imageUrl}
							alt="Preview"
							on:load={(e) => URL.revokeObjectURL(e.target?.src)}
							class="rounded-md object-cover"
						/>
					{:else}
						<p class="flex h-full w-full items-center justify-center">No image avaliable.</p>
					{/if}
				{/if}
			</div>

			<input
				type="file"
				accept="image/*"
				id="image-upload-input"
				name="newImage"
				on:input={(e) => (newImage = e.currentTarget.files?.item(0))}
				hidden
			/>

			<Button
				variant="secondary"
				on:click={() => {
					document.getElementById('image-upload-input')?.click();
				}}
				class="mt-3 w-full">Upload new image</Button
			>

			<div class="flex justify-between gap-2 pt-3">
				<Dialog.Close class={cn(buttonVariants({ variant: 'outline' }), 'w-[90px]')}
					>Cancel</Dialog.Close
				>
				<Button
					type="submit"
					on:click={() => {
						editGroupImageDialogOpen = false;
					}}
					class="w-[90px]">Save</Button
				>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
