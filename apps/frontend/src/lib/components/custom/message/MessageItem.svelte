<script lang="ts">
	import { enhance } from '$app/forms';
	import { conversationsStore, userStore } from '@/stores';
	import { EllipsisVertical, FilePenLine, Trash2 } from 'lucide-svelte';
	import { ProfileImage } from '../profile_image';
	import { Button } from '@/components/ui/button';
	import * as Popover from '@/components/ui/popover';
	import * as AlertDialog from '@/components/ui/alert-dialog';

	import ImageMessage from './ImageMessage.svelte';
	import type { MessageWithMember } from '@/types';

	export let data: MessageWithMember;
	export let showProfileImage: boolean;

	$: senderProfile = $conversationsStore.data
		?.find((val) => val.conversation.id == data.conversationMember.conversationId)
		?.conversation.members.find((member) => member.id == data.conversationMember.id);

	$: isDeleted = !data.message.body && !data.message.imageId;
	$: isText = data.message.body ? true : false;
	$: isCurrentUser = data.conversationMember.userId == $userStore?.id;

	let popoverOpened = false;
</script>

<div class="group flex flex-col gap-1">
	{#if isCurrentUser}
		<div class="flex flex-row-reverse items-center gap-2">
			{#if isDeleted}
				<p class="text-muted-foreground rounded-full border px-3 py-1 font-light">
					This message has been deleted.
				</p>
			{:else}
				{#if isText}
					<p class="bg-primary rounded-full px-3 py-1 font-light text-white">
						{data.message.body}
					</p>
				{:else}
					<ImageMessage imageUrl={data.message.imageUrl} />
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
						<Button variant="ghost" class="flex w-full justify-start gap-1"
							><FilePenLine /> Edit message</Button
						>

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
										>
											<input type="text" name="messageId" value={data.message.id} hidden />
											<Button variant="destructive" type="submit">Delete</Button>
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
			<div class="flex {isText ? 'items-center' : 'items-end'}">
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
				<p class="text-muted-foreground rounded-full px-3 py-1 font-light">
					This message has been deleted.
				</p>
			{:else if isText}
				<p class="bg-secondary rounded-full px-3 py-1 font-light">
					{data.message.body}
				</p>
			{:else}
				<ImageMessage imageUrl={data.message.imageUrl} />
			{/if}
		</div>
	{/if}

	<slot />
</div>
