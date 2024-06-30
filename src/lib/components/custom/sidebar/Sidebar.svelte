<script lang="ts">
	import { MessageCircle, UsersRound, PanelLeft } from 'lucide-svelte';
	import { userStore } from '@/stores';
	import { Button } from '@/components/ui/button';
	import { ThemeButton } from '@/components/custom/buttons';
	import * as Avatar from '@/components/ui/avatar';
	import * as Tooltip from '@/components/ui/tooltip';

	let expanded = false;
</script>

<div class="flex h-full {expanded ? 'w-56' : 'w-11'} flex-col justify-between">
	<div class="flex flex-col gap-1">
		<div>
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
		</div>
		<div>
			{#if !expanded}
				<Tooltip.Root>
					<Tooltip.Trigger asChild let:builder>
						<Button builders={[builder]} variant="ghost" size="icon"><UsersRound /></Button>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Users</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{:else}
				<Button variant="ghost" class="flex w-full justify-start gap-3 p-2 text-lg"
					><UsersRound /> Users</Button
				>
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
			<Button
				variant="ghost"
				size="icon"
				class={expanded ? 'w-full justify-start gap-2 pl-1 text-base' : ''}
			>
				<Avatar.Root class="h-8 w-8">
					<Avatar.Image src={$userStore?.profileImage.imageUrl} alt={$userStore?.fullName} />
					<Avatar.Fallback
						>{$userStore?.fullName
							.split(' ')
							.map((val) => val.at(0))
							.join('')}</Avatar.Fallback
					>
				</Avatar.Root>

				{#if expanded}
					{$userStore?.fullName.split(' ').at(0)}
				{/if}
			</Button>
		</div>
		<div>
			<Button variant="ghost" size="icon" on:click={() => (expanded = !expanded)}
				><PanelLeft /></Button
			>
		</div>
	</div>
</div>
