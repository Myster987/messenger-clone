<script lang="ts">
	import { MessageCircle, UsersRound, PanelLeft } from 'lucide-svelte';
	import { userStore, windowWidth } from '@/stores';
	import { Button } from '@/components/ui/button';
	import { ThemeButton, UserProfileButton } from '@/components/custom/buttons';
	import * as Tooltip from '@/components/ui/tooltip';

	let expanded = false;

	$: if ($windowWidth < 1280) {
		expanded = false;
	}
</script>

<div class="hidden h-full lg:flex {expanded ? 'w-56' : 'w-11'} flex-col justify-between">
	<div class="flex flex-col gap-1">
		<div>
			<a href="/user/{$userStore?.id}">
				{#if !expanded}
					<Tooltip.Root>
						<Tooltip.Trigger asChild let:builder>
							<Button builders={[builder]} variant="ghost" size="icon"
								><MessageCircle fill="currentColor" /></Button
							>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>Chats</p>
						</Tooltip.Content>
					</Tooltip.Root>
				{:else}
					<Button variant="ghost" class="flex w-full justify-start gap-3 p-2 text-lg"
						><MessageCircle fill="currentColor" /> Chats</Button
					>
				{/if}
			</a>
		</div>
		<div>
			{#if !expanded}
				<Tooltip.Root>
					<Tooltip.Trigger asChild let:builder>
						<a href="/user/{$userStore?.id}/new_group"
							><Button builders={[builder]} variant="ghost" size="icon"><UsersRound /></Button></a
						>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>New group</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{:else}
				<a href="/user/{$userStore?.id}/new_group">
					<Button variant="ghost" class="flex w-full justify-start gap-3 p-2 text-lg"
						><UsersRound /> New group</Button
					>
				</a>
			{/if}
		</div>
		<div>
			{#if expanded}
				<ThemeButton class="flex w-full justify-start gap-3 p-2 text-lg">Theme</ThemeButton>
			{:else}
				<ThemeButton />
			{/if}
		</div>
	</div>

	<div class="flex gap-1 {expanded ? 'flex-row' : 'flex-col'}">
		<div class="grow">
			<UserProfileButton {expanded} />
		</div>
		<div class="hidden xl:block">
			<Button variant="ghost" size="icon" on:click={() => (expanded = !expanded)}
				><PanelLeft /></Button
			>
		</div>
	</div>
</div>
