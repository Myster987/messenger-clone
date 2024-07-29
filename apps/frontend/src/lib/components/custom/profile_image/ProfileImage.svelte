<script lang="ts">
	import { cn } from '@/utils';
	import * as Avatar from '@/components/ui/avatar';

	let className: string | undefined = undefined;
	export let name: string;
	export let imageUrl: string | undefined;
	export { className as class };
</script>

<Avatar.Root class={cn('h-8 w-8', className)}>
	<Avatar.Image src={imageUrl} alt="Image of {name}" on:load class="pointer-events-none" />
	<Avatar.Fallback
		>{name
			.split(' ')
			.map((val) => val.at(0))
			.join('')}</Avatar.Fallback
	>
</Avatar.Root>
