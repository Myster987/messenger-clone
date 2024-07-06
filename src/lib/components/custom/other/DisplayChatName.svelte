<script lang="ts">
	import { userStore } from '@/stores';

	export let members: {
		id: string;
		createdAt: string;
		userId: string;
		conversationId: string;
		nick: string;
	}[];
</script>

{members.find((val) => val.userId != $userStore?.id)?.nick}
