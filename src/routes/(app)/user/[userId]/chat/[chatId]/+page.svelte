<script lang="ts">
	import { io } from 'socket.io-client';

	const socket = io({ path: '/api/websocket', addTrailingSlash: false });

	socket.on('eventFromServer', (message) => {
		console.log(message);
	});
</script>

<p>Hello</p>
