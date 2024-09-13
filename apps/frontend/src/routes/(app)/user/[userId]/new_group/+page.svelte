<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createGroupSchema } from '@/auth/form_schemas';
	import { userStore, conversationsStore } from '@/stores';
	import { Input } from '@/components/ui/input';
	import * as Card from '@/components/ui/card';
	import * as Command from '@/components/ui/command';
	import * as Select from '@/components/ui/select';
	import * as Form from '@/components/ui/form';
	import type { PageData } from './$types';
	import { BackToLinkButton } from '@/components/custom/buttons';

	export let data: PageData;

	const form = superForm(data.form, {
		validators: zodClient(createGroupSchema),
		invalidateAll: false
	});

	const { form: formData, enhance } = form;

	$: selectableUsers = new Map(
		$conversationsStore.data
			?.filter((c) => !c.conversation.isGroup)
			.filter((c) => {
				const member = c.conversation.members.find((m) => m.userId != $userStore?.id)!;
				return member.user.fullName.toLowerCase().includes(currentInput.toLowerCase());
			})
			.map((c) => {
				const member = c.conversation.members.find((m) => m.userId != $userStore?.id)!;
				return [member.userId, member.user.fullName];
			}) || []
	);

	$: selectedMembers = $formData.userIds.map((s) => ({ value: s, label: selectableUsers.get(s) }));

	$formData.creatorId = $userStore?.id!;

	let currentInput = '';
</script>

<BackToLinkButton href="/user/{$userStore?.id}" class="absolute left-4 top-4 lg:hidden" />

<Card.Root class="flex h-full items-center justify-center">
	<div>
		<Card.Header>
			<Card.Title class="text-3xl">Create new group</Card.Title>
			<Card.Description class="text-base">Select members to new group.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form action="?/createGroup" method="post" use:enhance class="flex w-full flex-col gap-3">
				<Form.Field {form} name="groupName">
					<Form.Control let:attrs>
						<Form.Label class="text-xl">Group name</Form.Label>
						<Input
							{...attrs}
							bind:value={$formData.groupName}
							autocomplete="off"
							placeholder="Enter group name..."
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="userIds">
					<Form.Control let:attrs>
						<Form.Label class="text-xl">Select group members</Form.Label>
						<!-- <Select.Root
							multiple
							selected={selectedMembers}
							onSelectedChange={(s) => {
								if (s) {
									$formData.userIds = s.map((c) => c.value);
								} else {
									$formData.userIds = [];
								}
							}}
						>
							<input type="text" name="creatorId" value={$userStore?.id} hidden />
							{#each $formData.userIds as userId}
								<input type="text" name={attrs.name} hidden value={userId} />
							{/each}

							<Select.Trigger {...attrs}>
								<Select.Value placeholder="Choose group members" />
							</Select.Trigger>

							<Select.Content>
								{#each selectableUsers.entries() as [id, name]}
									<Select.Item value={id} label={name} />
								{/each}
							</Select.Content>
						</Select.Root> -->

						<Select.Root
							multiple
							selected={selectedMembers}
							onSelectedChange={(s) => {
								if (s) {
									$formData.userIds = s.map((c) => c.value);
								} else {
									$formData.userIds = [];
								}
							}}
						>
							<input type="text" name="creatorId" value={$userStore?.id} hidden />
							{#each $formData.userIds as userId}
								<input type="text" name={attrs.name} hidden value={userId} />
							{/each}

							<Select.Trigger {...attrs}>
								<Select.Value placeholder="Choose group members" />
							</Select.Trigger>

							<Select.Content>
								<Command.Root shouldFilter={false}>
									<Command.Input bind:value={currentInput} placeholder="Add:" />
								</Command.Root>

								{#each selectableUsers.entries() as [id, name]}
									<Select.Item value={id} label={name} />
								{/each}
							</Select.Content>
						</Select.Root>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Button>Create</Form.Button>
			</form>
		</Card.Content>
	</div>
</Card.Root>
