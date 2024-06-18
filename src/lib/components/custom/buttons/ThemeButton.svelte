<script lang="ts">
	import { setMode } from 'mode-watcher';
	import { Button } from '@/components/ui/button';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="ghost"
			size="icon"
			class="flex items-center justify-center"
		>
			<Sun class="flex dark:hidden" />
			<Moon class="hidden dark:flex" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Label>Motyw</DropdownMenu.Label>
		<DropdownMenu.Separator />

		<DropdownMenu.Item on:click={() => setMode('light')}>Jasny</DropdownMenu.Item>
		<DropdownMenu.Item on:click={() => setMode('dark')}>Ciemny</DropdownMenu.Item>
		<DropdownMenu.Item on:click={() => setMode('system')}>Systemowy</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
