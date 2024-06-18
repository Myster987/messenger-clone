<script lang="ts">
	import { MessageCircle, UsersRound, PanelLeft } from 'lucide-svelte';
	import { userStore } from '@/stores';
	import { Button } from '@/components/ui/button';
	import { ThemeButton } from '@/components/custom/buttons';
	import * as Avatar from '@/components/ui/avatar';
	import * as Tooltip from '@/components/ui/tooltip';
</script>

<div class="flex h-full w-11 flex-col justify-between">
	<div class="flex flex-col gap-1">
		<div>
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
		</div>
		<div>
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<Button builders={[builder]} variant="ghost" size="icon"><UsersRound /></Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>Users</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
	</div>

	<div>
		<div>
			<Button variant="ghost" size="icon">
				<Avatar.Root class="h-8 w-8">
					<Avatar.Image src={$userStore?.profileImage.imageUrl} alt={$userStore?.fullName} />
					<Avatar.Fallback
						>{$userStore?.fullName
							.split(' ')
							.map((val) => val.at(0))
							.join('')}</Avatar.Fallback
					>
				</Avatar.Root>
			</Button>
		</div>
		<div><ThemeButton /></div>
		<div><Button variant="ghost" size="icon"><PanelLeft /></Button></div>
	</div>
</div>
