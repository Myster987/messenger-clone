<script lang="ts">
	import { enhance } from '$app/forms';
	import { Pencil, UserRoundPen } from 'lucide-svelte';
	import { userStore } from '@/stores';
	import { Button } from '@/components/ui/button';
	import { Input } from '@/components/ui/input';
	import { ProfileImage } from '@/components/custom/profile_image';
	import * as Dialog from '@/components/ui/dialog';
	import type { MemberWithProfileImage } from '@/types';
	import { toast } from 'svelte-sonner';

	export let members: MemberWithProfileImage[];
</script>

<Dialog.Root>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]} variant="ghost" class="flex w-full justify-start gap-1"
			><UserRoundPen /> Edit nicks</Button
		>
	</Dialog.Trigger>

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Nicks</Dialog.Title>
		</Dialog.Header>
		<ul class="flex flex-col gap-4">
			{#each members as member}
				<li class="flex items-center gap-3">
					<ProfileImage
						name={member.nick || member.user.fullName}
						imageUrl={member.user.profileImage?.imageUrl}
					/>
					<form
						action="/user/{$userStore?.id}/conversation/{member.conversationId}?/editNick"
						method="post"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type == 'success') {
									toast.success('Nick successfully changed.');
								}
							};
						}}
						class="flex w-full items-center gap-3"
					>
						<input type="text" name="memberId" value={member.id} hidden />

						<Input name="newNick" value={member.nick || member.user.fullName} />

						<Button type="submit" size="icon" class="px-2"><Pencil /></Button>
					</form>
				</li>
			{/each}
		</ul>
	</Dialog.Content>
</Dialog.Root>
