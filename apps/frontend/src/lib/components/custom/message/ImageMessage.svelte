<script lang="ts">
	export let imageUrl: string;
</script>

<div class="aspect-square max-h-[350px] overflow-hidden rounded-2xl">
	<img src={imageUrl} alt="Uploaded by user" loading="lazy" class="h-full w-full object-cover" />
</div>
