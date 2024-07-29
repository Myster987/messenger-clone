<script lang="ts">
	import { ioClient } from '@/socket';

	$ioClient?.on('hello', (msg: string) => {
		console.log(msg);
	});
</script>

<p>Hello</p>
