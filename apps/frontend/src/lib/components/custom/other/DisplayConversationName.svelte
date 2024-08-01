<script lang="ts">
	import { userStore } from '@/stores';

	export let members: {
		id: string;
		createdAt: string;
		userId: string;
		conversationId: string;
		nick: string | null;
		user: {
			isOnline: boolean;
			fullName: string;
			profileImage: {
				imageUrl: string;
				userId: string;
			} | null;
		};
	}[];

	export let isGroup: boolean = false;
	export let groupName: string | undefined;

	const secondUser = members.find((val) => val.userId != $userStore?.id);
</script>

{#if isGroup}
	{groupName}
{:else if secondUser?.nick}
	{secondUser.nick}
{:else}
	{secondUser?.user.fullName}
{/if}
