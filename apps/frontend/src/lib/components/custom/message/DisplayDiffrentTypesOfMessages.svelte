<script lang="ts">
	import { cn } from '@/utils';
	import type { Message } from '@/types';

	export let message: Message | Omit<Message, 'imageUrl'> | null;
	export let isCurrentUser: boolean;
	export let contentClass: string | undefined = undefined;
	let containerClass: string | undefined = undefined;

	export { containerClass as class };
</script>

{#if isCurrentUser}
	{#if message?.type == 'nick-change'}
		<div class={cn('flex justify-center px-8', containerClass)}>
			<p class={cn('text-muted-foreground text-center text-sm', contentClass)}>
				Changed nick to {message?.body?.split('-')[2]}.
			</p>
		</div>
	{:else if message?.type == 'group-name-change'}
		<div class={cn('flex justify-center px-8', containerClass)}>
			<p class={cn('text-muted-foreground text-center text-sm', contentClass)}>
				You changed group name {message?.body?.split(' ').slice(1).join(' ')}.
			</p>
		</div>
	{:else if message?.type == 'group-image-change' || message?.type == 'group-add-members'}
		<div class={cn('flex justify-center px-8', containerClass)}>
			<p class={cn('text-muted-foreground text-center text-sm', contentClass)}>
				{message.body}
			</p>
		</div>
	{/if}
{:else if message?.type == 'nick-change'}
	<div class={cn('flex justify-center px-8', containerClass)}>
		<p class={cn('text-muted-foreground text-center text-sm', contentClass)}>
			{message?.body?.split('-')[0]} changed {message?.body?.split('-')[1]} nick to {message?.body?.split(
				'-'
			)[2]}.
		</p>
	</div>
{:else if message?.type == 'group-name-change'}
	<div class={cn('flex justify-center px-8', containerClass)}>
		<p class={cn('text-muted-foreground text-center text-sm', contentClass)}>
			{message?.body?.split(' ')[0]} changed group name to {message?.body?.split(' ')[2]}.
		</p>
	</div>
{:else if message?.type == 'group-image-change' || message?.type == 'group-add-members'}
	<div class={cn('flex justify-center px-8', containerClass)}>
		<p class={cn('text-muted-foreground text-center text-sm', contentClass)}>
			{message.body}
		</p>
	</div>
{/if}
