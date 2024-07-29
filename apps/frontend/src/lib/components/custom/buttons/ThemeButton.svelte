<script lang="ts">
	import { setMode } from 'mode-watcher';
	import { cn } from '@/utils';
	import { Button } from '@/components/ui/button';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';

	let className = '';

	export { className as class };
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="ghost"
			size="icon"
			class={cn('flex items-center justify-center', className)}
		>
			<Sun class="flex dark:hidden" />
			<Moon class="hidden dark:flex" />
			<slot />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Label>Theme</DropdownMenu.Label>
		<DropdownMenu.Separator />

		<DropdownMenu.Item on:click={() => setMode('light')}>Light</DropdownMenu.Item>
		<DropdownMenu.Item on:click={() => setMode('dark')}>Dark</DropdownMenu.Item>
		<DropdownMenu.Item on:click={() => setMode('system')}>System</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
