<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { LogOut } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';
	import { conversationsStore } from '@/stores';
</script>

<form
	action="/sign_out"
	method="post"
	use:enhance={() => {
		toast.loading('Please wait...');

		return async ({ result }) => {
			if (result.type == 'failure' || result.type == 'error') {
				toast.error('Something went wrong.');
			} else if (result.type == 'redirect') {
				toast.success('Successfully signed out.');
				await goto(result.location);
				$conversationsStore.data = [];
			}
		};
	}}
>
	<Button type="submit" variant="ghost" class="flex w-full justify-start gap-2"
		><LogOut /> Sign Out</Button
	>
</form>
