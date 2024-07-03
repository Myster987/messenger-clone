<script lang="ts">
	import { Button } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { UserRoundCog } from 'lucide-svelte';
</script>

<Dialog.Root>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]} variant="ghost" class="flex justify-start gap-1"
			><UserRoundCog /> Edit profile</Button
		>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Header>Edit profile</Dialog.Header>
			<Dialog.Description
				>Make changes to your profile here. Click save when you're done.</Dialog.Description
			>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
