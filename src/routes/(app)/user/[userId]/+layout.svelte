<script lang="ts">
	import { conversationsStore } from '@/stores';
	import { Sidebar } from '@/components/custom/sidebar';
	import { ChatsCard } from '@/components/custom/cards';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: conversationsStore.updateAsync(data.streamed.conversations);
</script>

<div class="flex h-full gap-4 p-4">
	<Sidebar />
	<ChatsCard />
	<div class="flex-grow">
		<slot />
	</div>
</div>
