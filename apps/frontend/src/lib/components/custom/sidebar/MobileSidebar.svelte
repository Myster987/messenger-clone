<script lang="ts">
	import { Menu, MessageCircle, UsersRound } from 'lucide-svelte';
	import { userStore } from '@/stores';
	import { Button } from '@/components/ui/button';
	import { ThemeButton, UserProfileButton } from '@/components/custom/buttons';
	import * as Sheet from '@/components/ui/sheet';
</script>

<Sheet.Root>
	<Sheet.Trigger asChild let:builder>
		<Button builders={[builder]} variant="secondary" size="icon" class="rounded-full"
			><Menu /></Button
		>
	</Sheet.Trigger>
	<Sheet.Content side="left">
		<div class="flex h-full w-full flex-col gap-2 lg:hidden">
			<UserProfileButton expanded={true} />

			<a href="/user/{$userStore?.id}">
				<Button variant="ghost" class="flex w-full justify-start gap-3 p-2 text-lg"
					><MessageCircle fill="currentColor" /> Chats</Button
				>
			</a>
			<a href="/user/{$userStore?.id}/new_group">
				<Button variant="ghost" class="flex w-full justify-start gap-3 p-2 text-lg"
					><UsersRound /> New group</Button
				>
			</a>
			<ThemeButton class="flex w-full justify-start gap-3 p-2 text-lg">Theme</ThemeButton>
		</div></Sheet.Content
	>
</Sheet.Root>
