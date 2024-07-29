<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '@/components/ui/sonner';
	import { userStore } from '@/stores';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	$: $userStore = data.user;
</script>

<ModeWatcher />
<Toaster />

<div class="h-screen">
	<slot />
</div>
