<script lang="ts">
	import * as Card from '@/components/ui/card';
	import * as Command from '$lib/components/ui/command';
</script>

<Card.Root class="h-full w-full">
	<Card.Content class="p-3">
		<div>
			<Command.Root>
				<Command.Input />
				<Command.List>
					<Command.Empty>No results found.</Command.Empty>
				</Command.List>
			</Command.Root>
		</div>
	</Card.Content>
</Card.Root>
