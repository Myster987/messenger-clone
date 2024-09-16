<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { LoaderCircle } from 'lucide-svelte';
	import { apiClientStore, userStore, windowWidth } from '@/stores';
	import { BackToLinkButton } from '@/components/custom/buttons';
	import { ProfileImage } from '@/components/custom/profile_image';
	import * as Card from '@/components/ui/card';
	import * as Command from '@/components/ui/command';
	import type { ApiResponse } from '@/types';

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
		const res = await $apiClientStore.get(`api/users/by_full_name/${currentInput}`);

		const { data } = await res.json<ApiResponse<{ data: SearchResult[] }>>();
		resolvedSuggestions = true;

		if (!data) {
			return;
		}

		searchResults = data.filter((u) => u.id != $userStore?.id);
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
</script>

<Card.Root class="h-full w-full border-none lg:border lg:border-solid">
	<Card.Header class="p-3 pb-0 pt-5">
		<Card.Title class="flex items-center gap-2">
			{#if $windowWidth < 1024}
				<BackToLinkButton href="/user/{$userStore?.id}" class="lg:hidden" />
			{/if}
			<h2 class="text-xl">New chat</h2>
		</Card.Title>
	</Card.Header>
	<Card.Content class="p-3 pt-0">
		<Command.Root shouldFilter={false}>
			<Command.Input bind:value={currentInput} placeholder="To:" />
		</Command.Root>
		<ul class="p-2">
			{#if !resolvedSuggestions && currentInput != ''}
				<div class="flex items-center justify-center gap-2 py-5">
					<LoaderCircle class="animate-spin" /> Searching...
				</div>
			{:else if searchResults.length > 0}
				{#each searchResults as user}
					<li
						class="hover:bg-accent hover:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
					>
						<form
							method="post"
							on:submit={(e) => {
								// @ts-ignore
								e.submitter.disabled = true;
							}}
							use:enhance={() => {
								toast.loading('Please wait...');

								return async ({ result }) => {
									if (result.type == 'failure') {
										toast.error('Something went wrong when adding user');
									} else if (result.type == 'success') {
										toast.success('User added successfully');
										invalidateAll();
									}
								};
							}}
							class="w-full"
						>
							<input type="text" value={user.id} name="secondUserId" hidden />
							<button class="flex w-full gap-2 p-2 text-lg">
								<ProfileImage name={user.fullName} imageUrl={user.profileImage.imageUrl} />
								{user.fullName}
							</button>
						</form>
					</li>
				{/each}
			{:else}
				<div class="flex justify-center gap-2 py-5">
					{#if currentInput}
						No results found for "{currentInput}".
					{:else}
						No results found.
					{/if}
				</div>
			{/if}
		</ul>
	</Card.Content>
</Card.Root>
