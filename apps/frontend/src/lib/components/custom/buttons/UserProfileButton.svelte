<script lang="ts">
	import { UserRoundCog } from 'lucide-svelte';
	import { userStore } from '@/stores';
	import { Button } from '@/components/ui/button';
	import { ProfileImage } from '@/components/custom/profile_image';
	import { SignOutButton } from '.';
	import * as Popover from '@/components/ui/popover';

	export let expanded: boolean;
</script>

<Popover.Root portal={null}>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="ghost"
			size="icon"
			class={expanded ? 'w-full justify-start gap-2 pl-1 text-base' : ''}
		>
			<ProfileImage
				name={$userStore?.fullName || ''}
				imageUrl={$userStore?.profileImage?.imageUrl}
			/>

			{#if expanded}
				{$userStore?.fullName.split(' ').at(0)}
			{/if}
		</Button>
	</Popover.Trigger>

	<Popover.Content class="grid w-[200px] gap-1 p-1">
		<a href="/user/{$userStore?.id}/edit_profile">
			<Button variant="ghost" class="flex w-full justify-start gap-2"
				><UserRoundCog />Edit profile</Button
			>
		</a>
		<SignOutButton />
	</Popover.Content>
</Popover.Root>
