<script lang="ts">
	import type { Message } from '@/types';

	export let message: Message | Omit<Message, 'imageUrl'> | null;
	export let isCurrentUser: boolean;
</script>

{#if isCurrentUser}
	{#if message?.type == 'nick-change'}
		Changed nick to {message?.body?.split('-')[2]}.
	{:else if message?.type == 'group-name-change'}
		You changed group name {message?.body?.split(' ').slice(1).join(' ')}.
	{:else if message?.type == 'group-image-change' || message?.type == 'group-add-members' || message?.type == 'group-member-leave'}
		{message.body}
	{/if}
{:else if message?.type == 'nick-change'}
	{message?.body?.split('-')[0]} changed {message?.body?.split('-')[1]} nick to {message?.body?.split(
		'-'
	)[2]}.
{:else if message?.type == 'group-name-change'}
	{message?.body?.split(' ')[0]} changed group name to {message?.body?.split(' ')[2]}.
{:else if message?.type == 'group-image-change' || message?.type == 'group-add-members' || message?.type == 'group-member-leave'}
	{message.body}
{/if}
