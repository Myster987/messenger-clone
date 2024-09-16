<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import { toast } from 'svelte-sonner';
	import { conversationsStore, userStore } from '@/stores';
	import { EllipsisVertical, FilePenLine, Trash2 } from 'lucide-svelte';
	import { ProfileImage } from '../profile_image';
	import { cn } from '@/utils';
	import { Input } from '@/components/ui/input';
	import { Button, buttonVariants } from '@/components/ui/button';
	import { ImageMessage, DisplayDiffrentTypesOfMessages } from '@/components/custom/message';
	import * as Popover from '@/components/ui/popover';
	import * as AlertDialog from '@/components/ui/alert-dialog';
	import * as Dialog from '@/components/ui/dialog';
	import type { MessageWithMember } from '@/types';

	export let data: MessageWithMember;
	export let showProfileImage: boolean;

	$: senderProfile = $conversationsStore.data
		?.find((val) => val.conversation.id == data.conversationMember.conversationId)
		?.conversation.members.find((member) => member.id == data.conversationMember.id);

	$: edited = data.message.createdAt != data.message.updatedAt;

	$: isDeleted = !data.message.body && !data.message.imageId;
	$: isText = data.message.body ? true : false;
	$: isCurrentUser = data.conversationMember.userId == $userStore?.id;

	let popoverOpened = false;
	let editMessageDialogOpen = false;

	let newImage: File | null = null;
</script>

<div class="group flex flex-col gap-1">
	{#if data.message.type != 'message'}
		<div class="flex justify-center px-8">
			<p class="text-muted-foreground text-center text-sm">
				<DisplayDiffrentTypesOfMessages {isCurrentUser} message={data.message} />
			</p>
		</div>
	{:else if isCurrentUser}
		<div class="flex flex-row-reverse items-center gap-2">
			{#if isDeleted}
				<p class="text-muted-foreground rounded-full border px-3 py-1 font-light">
					This message has been deleted.
				</p>
			{:else}
				{#if isText}
					<p
						class="bg-primary max-w-[75%] hyphens-auto break-all rounded-2xl px-3 py-1 font-light text-white"
					>
						{data.message.body}
					</p>
				{:else}
					<ImageMessage imageUrl={data.message.imageUrl} />
				{/if}

				{#if edited}
					<p class="text-muted-foreground text-sm">Edited</p>
				{/if}

				<Popover.Root portal={null} bind:open={popoverOpened}>
					<Popover.Trigger asChild let:builder>
						<Button
							builders={[builder]}
							variant="secondary"
							class="{!popoverOpened && 'hidden'} h-6 rounded-full p-1 group-hover:flex"
							><EllipsisVertical class="h-4 w-4" /></Button
						>
					</Popover.Trigger>
					<Popover.Content class="w-fit gap-1 p-1">
						<Dialog.Root
							bind:open={editMessageDialogOpen}
							onOpenChange={(open) => {
								if (!open) {
									newImage = null;
								}
							}}
						>
							<Dialog.Trigger asChild let:builder>
								<Button builders={[builder]} variant="ghost" class="flex w-full justify-start gap-1"
									><FilePenLine /> Edit message</Button
								>
							</Dialog.Trigger>

							<Dialog.Content>
								<Dialog.Header>
									<Dialog.Title class="text-2xl">Edit message</Dialog.Title>
									<Dialog.Description
										>Make changes to message here. Click save when you're done.</Dialog.Description
									>
								</Dialog.Header>

								<div>
									{#if isText}
										<form
											action="/user/{$userStore?.id}/conversation/{data.conversationMember
												.conversationId}?/editTextMessage"
											method="post"
											use:enhance={() => {
												return async () => {};
											}}
										>
											<input type="text" name="messageId" value={data.message.id} hidden />
											<input type="text" name="senderId" value={senderProfile?.id} hidden />

											<Input name="newBody" value={data.message.body} autocomplete="off" required />

											<div class="flex justify-between gap-2 pt-5">
												<Dialog.Close class={cn(buttonVariants({ variant: 'outline' }), 'w-[90px]')}
													>Cancel</Dialog.Close
												>
												<Button
													type="submit"
													on:click={() => {
														editMessageDialogOpen = false;
														popoverOpened = false;
													}}
													class="w-[90px]">Save</Button
												>
											</div>
										</form>
									{:else}
										<form
											action="/user/{$userStore?.id}/conversation/{data.conversationMember
												.conversationId}?/editImageMessage"
											method="post"
											enctype="multipart/form-data"
											use:enhance={() => {
												toast.loading('Please wait. This will take a while...');
												return async () => {};
											}}
										>
											<input type="text" name="messageId" value={data.message.id} hidden />
											<input type="text" name="senderId" value={senderProfile?.id} hidden />

											<div class="h-60 overflow-hidden">
												{#if browser}
													<!-- it's fine -->
													<img
														src={newImage ? URL.createObjectURL(newImage) : data.message.imageUrl}
														alt="Preview"
														on:load={(e) => URL.revokeObjectURL(e.target?.src)}
														class="rounded-md object-cover"
													/>
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
														editMessageDialogOpen = false;
														popoverOpened = false;
													}}
													class="w-[90px]">Save</Button
												>
											</div>
										</form>
									{/if}
								</div>
							</Dialog.Content>
						</Dialog.Root>

						<AlertDialog.Root>
							<AlertDialog.Trigger asChild let:builder>
								<Button
									variant="ghost"
									builders={[builder]}
									class="hover:text-destructive flex justify-start gap-1"
									><Trash2 /> Delete message</Button
								>
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title>Are you sure?</AlertDialog.Title>
									<AlertDialog.Description
										>This action cannot be undone. This will permanently delete your message and
										remove it from our servers.</AlertDialog.Description
									>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action class="p-0">
										<form
											action="/user/{$userStore?.id}/conversation/{data.conversationMember
												.conversationId}?/deleteMessage"
											method="post"
											use:enhance={() => {
												return async () => {};
											}}
											class="w-full"
										>
											<input type="text" name="messageId" value={data.message.id} hidden />
											<input type="text" name="senderId" value={senderProfile?.id} hidden />
											<Button variant="destructive" type="submit" class="w-full">Delete</Button>
										</form>
									</AlertDialog.Action>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
					</Popover.Content>
				</Popover.Root>
			{/if}
		</div>
	{:else}
		<div class="flex gap-2">
			<div class="flex items-end">
				{#if showProfileImage}
					<ProfileImage
						imageUrl={senderProfile?.user.profileImage?.imageUrl}
						name={senderProfile?.nick || senderProfile?.user.fullName || ''}
						class="h-7 w-7"
					/>
				{:else}
					<div class="w-7"></div>
				{/if}
			</div>
			{#if isDeleted}
				<p class="text-muted-foreground rounded-full border px-3 py-1 font-light">
					This message has been deleted.
				</p>
			{:else}
				{#if isText}
					<p
						class="bg-secondary word max-w-[75%] hyphens-auto break-all rounded-3xl px-3 py-1 font-light"
					>
						{data.message.body}
					</p>
				{:else}
					<ImageMessage imageUrl={data.message.imageUrl} />
				{/if}

				{#if edited}
					<p class="text-muted-foreground self-center text-sm">Edited</p>
				{/if}
			{/if}
		</div>
	{/if}

	<slot />
</div>
