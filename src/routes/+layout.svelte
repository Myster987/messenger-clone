<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '@/components/ui/sonner';
</script>

<ModeWatcher />
<Toaster />

<div class="min-h-screen">
	<slot />
</div>

