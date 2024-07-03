<script lang="ts">
	import { LoaderCircle } from 'lucide-svelte';
	import { createHonoClient } from '@/api/client';
	import * as Card from '@/components/ui/card';
	import * as Command from '@/components/ui/command';
	import * as Avatar from '@/components/ui/avatar';
	import { ProfileImage } from '@/components/custom/profile_image';

	const honoClient = createHonoClient();

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
		const res = await honoClient.api.users.by_full_name[':fullName'].$get({
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
		if (currentInput.length < 2) {
			return;
		}
		clearTimeout(suggestDelay);
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
		<Command.Root>
			<Command.Input bind:value={currentInput} />
			<Command.List>
				{#if !resolvedSuggestions && currentInput != ''}
					<Command.Empty>
						<div class="flex items-center justify-center gap-2">
							<LoaderCircle class="animate-spin" /> Searching...
						</div>
					</Command.Empty>
				{:else if searchResults.length > 0}
					<Command.Group heading="Users">
						{#each searchResults as user (user.id)}
							<Command.Item class="flex gap-2 p-2 text-lg">
								<ProfileImage name={user.fullName} imageUrl={user.profileImage.imageUrl} />
								{user.fullName}
							</Command.Item>
						{/each}
					</Command.Group>
				{:else}
					<Command.Empty>
						{#if currentInput}
							No results found for "{currentInput}".
						{:else}
							No results found.
						{/if}
					</Command.Empty>
				{/if}
			</Command.List>
		</Command.Root>
	</Card.Content>
</Card.Root>
