<script lang="ts">
	import { createHonoClient } from 'backend';

	const honoClient = createHonoClient();

	const ws = honoClient.api.websocket.chat.$ws();
</script>

<p>Hello</p>
