<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public';
	import { browser } from '$app/environment';
	import { io } from 'socket.io-client';
	import { ioClient } from '@/socket';
	import { conversationsStore } from '@/stores';
	import { Sidebar } from '@/components/custom/sidebar';
	import { ChatsCard } from '@/components/custom/cards';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: conversationsStore.updateAsync(data.streamed.conversations);
	$: if ($conversationsStore.data)
		$conversationsStore.data = $conversationsStore.data.sort((a, b) => {
			const dateA = new Date(a.conversation.lastMessageAt) as unknown as number;
			const dateB = new Date(b.conversation.lastMessageAt) as unknown as number;
			return dateB - dateA;
		});

	$: if (browser)
		$ioClient = io(PUBLIC_API_URL, { path: '/api/socket/io', addTrailingSlash: false });
</script>

<div class="flex h-full gap-4 p-4">
	<Sidebar />
	<ChatsCard />
	<div class="flex-grow">
		<slot />
	</div>
</div>
