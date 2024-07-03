<script lang="ts">
	import * as Avatar from '@/components/ui/avatar';

	export let name: string;
	export let imageUrl: string | undefined;
</script>

<Avatar.Root class="h-8 w-8">
	<Avatar.Image src={imageUrl} alt="Image of {name}" />
	<Avatar.Fallback
		>{name
			.split(' ')
			.map((val) => val.at(0))
			.join('')}</Avatar.Fallback
	>
</Avatar.Root>
