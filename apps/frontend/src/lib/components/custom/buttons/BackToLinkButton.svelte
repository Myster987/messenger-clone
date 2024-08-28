<script lang="ts">
	import { cn } from '@/utils';
	import { ArrowLeft } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';

	export let href: string;

	let className: string | undefined = undefined;
	export { className as class };
</script>

<a {href}>
	<Button variant="ghost" size="icon" class={cn('rounded-full', className)}><ArrowLeft /></Button>
</a>
