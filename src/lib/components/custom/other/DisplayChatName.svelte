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
				id: string;
				createdAt: string;
				imageUrl: string;
				publicId: string;
				userId: string;
			} | null;
		};
	}[];

	const secondUser = members.find((val) => val.userId != $userStore?.id);
</script>

{#if secondUser?.nick}
	{secondUser.nick}
{:else}
	{secondUser?.user.fullName}
{/if}
