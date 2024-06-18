<script lang="ts">
	import { Sidebar } from '@/components/custom/sidebar';
</script>

<div class="flex h-full p-4">
	<Sidebar />
	<div>Chats</div>
	<div>
		<slot />
	</div>
</div>
