<script lang="ts">
	import { enhance } from '$app/forms';
	import { userStore } from '@/stores';
	import { toast } from 'svelte-sonner';
	import { PencilLine } from 'lucide-svelte';
	import { Input } from '@/components/ui/input';
	import { Button } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import type { StoreConversation } from '@/types';

	export let conversation: StoreConversation['conversation'] | null | undefined;
	$: currentMember = conversation?.members.find((m) => m.userId == $userStore?.id);
	let dialogOpen = false;
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]} variant="ghost" class="flex w-full justify-start gap-1"
			><PencilLine /> Edit group name</Button
		>
	</Dialog.Trigger>

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-left">Edit conversation name</Dialog.Title>
		</Dialog.Header>

		<form
			action="/user/{$userStore?.id}/conversation/{conversation?.id}?/editConversationName"
			method="post"
			class="flex flex-col gap-4"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type == 'success') {
						toast.success('Group name successfully updated.');
					} else {
						toast.error('Something went wrong.');
					}
					dialogOpen = false;
				};
			}}
		>
			<input type="text" name="changedById" value={currentMember?.id} hidden />
			<Input
				name="newName"
				value={conversation?.name}
				maxlength={255}
				autocomplete="off"
				required
			/>

			<div class="flex justify-between">
				<Button on:click={() => (dialogOpen = false)} variant="outline">Close</Button>
				<Button type="submit">Save</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
