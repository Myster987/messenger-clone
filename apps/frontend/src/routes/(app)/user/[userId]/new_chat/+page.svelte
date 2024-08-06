<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { LoaderCircle } from 'lucide-svelte';
	import { honoClientStore} from "@/stores"
	import { ProfileImage } from '@/components/custom/profile_image';
	import * as Card from '@/components/ui/card';
	import * as Command from '@/components/ui/command';

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
</script>

<Card.Root class="h-full w-full">
	<Card.Content class="p-3">
		<Command.Root shouldFilter={false}>
			<Command.Input bind:value={currentInput} />
		</Command.Root>
		<ul class="p-2">
			{#if !resolvedSuggestions && currentInput != ''}
				<div class="flex items-center justify-center gap-2 py-5">
					<LoaderCircle class="animate-spin" /> Searching...
				</div>
			{:else if searchResults.length > 0}
				{#each searchResults as user}
					<li
						class="relative flex cursor-default select-none items-center rounded-sm text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
					>
						<form
							method="post"
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
