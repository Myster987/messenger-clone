<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '@/components/ui/sonner';
	import { userStore, windowWidth } from '@/stores';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	$: $userStore = data.user;
</script>

<svelte:window bind:innerWidth={$windowWidth} />

<ModeWatcher />
<Toaster />

<div class="h-[100dvh]">
	<slot />
</div>
