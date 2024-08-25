<script lang="ts">
	import { conversationsStore, honoClientStore, userStore } from '@/stores';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { addMembersToGroup } from '@/auth/form_schemas';
	import { Check, LoaderCircle, UserRoundPlus, X } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';
	import { ScrollArea } from '@/components/ui/scroll-area';
	import { ProfileImage } from '@/components/custom/profile_image';
	import * as Command from '@/components/ui/command';
	import * as Dialog from '@/components/ui/dialog';
	import * as Form from '@/components/ui/form';
	import type { StoreConversation } from '@/types';

	export let currentConversation: StoreConversation['conversation'];
	export let addMembersToGroupFormObject: SuperValidated<Infer<typeof addMembersToGroup>>;

	const form = superForm(addMembersToGroupFormObject, {
		validators: zodClient(addMembersToGroup)
	});

	const { form: formData, enhance } = form;

	type SearchResult = {
		id: string;
		fullName: string;
		profileImage: {
			imageUrl: string;
		};
	};

	let searchResults: SearchResult[] = [];

	let currentInput = '';
	let resolvedSuggestions = true;
	let suggestDelay: number;

	const searchUsersByName = async () => {
		const res = await $honoClientStore.api.users.by_full_name[':fullName'].$get({
			param: {
				fullName: currentInput
			}
		});

		const { data } = await res.json();
		resolvedSuggestions = true;

		if (!data) {
			return;
		}

		searchResults = data;
	};

	const handleDelaySuggestion = () => {
		clearTimeout(suggestDelay);
		if (currentInput.length < 2) {
			return;
		}
		resolvedSuggestions = false;
		searchResults = [];
		suggestDelay = window.setTimeout(() => searchUsersByName(), 1000);
	};

	$: {
		if (currentInput) {
			handleDelaySuggestion();
		}
	}

	$: selectableUsers = searchResults.filter(
		(user) => !currentConversation.members.find((m) => m.userId == user.id)
	);

	let suggestions: SearchResult[] = [];
	$: {
		let chats = $conversationsStore.data?.filter((c) => !c.conversation.isGroup) || [];
		for (const { conversation } of chats) {
			for (const member of conversation.members) {
				if (
					member.userId != $userStore?.id &&
					typeof currentConversation.members.find((c) => c.userId == member.userId) == 'undefined'
				) {
					suggestions.push({
						id: member.userId,
						fullName: member.user.fullName,
						profileImage: member.user.profileImage!
					});
				}
			}
		}
		suggestions = suggestions.filter(
			(obj1, i, arr) => arr.findIndex((obj2) => obj2.id == obj1.id) == i
		);
	}
	let selectedUsers: SearchResult[] = [];

	$: $formData.newUserIds = selectedUsers.map((s) => s.id);
</script>

<Dialog.Root
	onOpenChange={(open) => {
		if (!open) {
			selectedUsers = [];
		}
	}}
>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]} variant="ghost" class="flex w-full justify-start gap-1"
			><UserRoundPlus /> Add members</Button
		>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add members</Dialog.Title>

			<Command.Root shouldFilter={false}>
				<Command.Input bind:value={currentInput} />
			</Command.Root>
		</Dialog.Header>

		<ScrollArea orientation="horizontal">
			<div class="flex h-[80px] gap-2 py-2">
				{#if selectedUsers.length == 0}
					<div class="flex h-full w-full items-center justify-center">
						<p class="text-muted-foreground">No users selected.</p>
					</div>
				{:else}
					{#each selectedUsers as user}
						<div class="relative flex w-[65px] flex-col items-center">
							<ProfileImage imageUrl={user.profileImage.imageUrl} name={user.fullName} />
							<p class="text-muted-foreground text-center text-xs">
								{user.fullName}
							</p>
							<Button
								variant="destructive"
								class="absolute right-1 top-0 h-5 w-5 rounded-full p-1"
								on:click={() => (selectedUsers = selectedUsers.filter((s) => s.id != user.id))}
							>
								<X />
							</Button>
						</div>
					{/each}
				{/if}
			</div>
		</ScrollArea>

		<ScrollArea class="h-[200px]">
			<div class="flex h-full w-full items-center justify-center">
				{#if !resolvedSuggestions && currentInput != ''}
					<div class="flex items-center justify-center gap-2 py-5">
						<LoaderCircle class="animate-spin" /> Searching...
					</div>
				{:else if currentInput == ''}
					<ul class="flex w-full flex-col gap-1 self-start">
						<li>
							<p>Suggested</p>
						</li>
						{#each suggestions as user}
							<li>
								<Button
									variant="ghost"
									on:click={() => {
										if (selectedUsers.find((s) => s.id == user.id)) {
											selectedUsers = selectedUsers.filter((s) => s.id != user.id);
										} else {
											selectedUsers = [...selectedUsers, user];
										}
									}}
									class="flex w-full items-center justify-start gap-3"
								>
									<ProfileImage imageUrl={user.profileImage.imageUrl} name={user.fullName} />
									<p class="text-lg">
										{user.fullName}
									</p>
									{#if selectedUsers.find((s) => s.id == user.id)}
										<Check class="ml-auto" />
									{/if}
								</Button>
							</li>
						{/each}
					</ul>
				{:else if selectableUsers.length > 0}
					<ul class="flex w-full flex-col gap-1 self-start">
						{#each selectableUsers as user}
							<li>
								<Button
									variant="ghost"
									on:click={() => {
										if (selectedUsers.find((s) => s.id == user.id)) {
											selectedUsers = selectedUsers.filter((s) => s.id != user.id);
										} else {
											selectedUsers = [...selectedUsers, user];
										}
									}}
									class="flex w-full items-center justify-start gap-3"
								>
									<ProfileImage imageUrl={user.profileImage.imageUrl} name={user.fullName} />
									<p class="text-lg">
										{user.fullName}
									</p>
									{#if selectedUsers.find((s) => s.id == user.id)}
										<Check class="ml-auto" />
									{/if}
								</Button>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="flex justify-center gap-2 py-5">
						{#if currentInput}
							No results found for "{currentInput}".
						{:else}
							No results found.
						{/if}
					</div>
				{/if}
			</div>
		</ScrollArea>

		<form
			action="/user/{$userStore?.id}/conversation/{currentConversation.id}?/addNewMembersToGroup"
			method="post"
			use:enhance
		>
			<Form.Field {form} name="newUserIds">
				<Form.Control let:attrs>
					{#each $formData.newUserIds as userId}
						<input type="text" name={attrs.name} value={userId} hidden />
					{/each}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="flex justify-end">
				<Button type="submit" size="lg">Apply</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
