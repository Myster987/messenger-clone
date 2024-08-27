<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { userStore } from '@/stores';
	import { toast } from 'svelte-sonner';
	import { LogOut } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';
	import type { MemberWithProfileImage } from '@/types';

	export let currentMember: MemberWithProfileImage;
</script>

<form
	action="/user/{$userStore?.id}/conversation/{currentMember.conversationId}?/leaveGroup"
	method="post"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type == 'redirect') {
				await goto(result.location, { invalidateAll: true });
				toast.success('You successfully left the group.');
			}
		};
	}}
>
	<input type="text" name="memberId" value={currentMember.id} hidden />
	<Button
		type="submit"
		variant="ghost"
		class="hover:text-destructive flex w-full justify-start gap-1"><LogOut /> Leave group</Button
	>
</form>
