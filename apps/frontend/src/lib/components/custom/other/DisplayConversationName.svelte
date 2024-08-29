<script lang="ts">
	import { userStore } from '@/stores';
	import type { MemberWithProfileImage } from '@/types';

	export let members: MemberWithProfileImage[];

	export let isGroup: boolean = false;
	export let groupName: string | undefined;

	$: secondUser = members.find((val) => val.userId != $userStore?.id);
</script>

{#if isGroup}
	{groupName}
{:else if secondUser?.nick}
	{secondUser.nick}
{:else}
	{secondUser?.user.fullName}
{/if}
