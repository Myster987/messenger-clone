<script lang="ts">
	import { onMount } from 'svelte';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { userStore } from '@/stores';
	import { editUserSchema } from '@/auth/form_schemas';
	import { Input } from '@/components/ui/input';
	import * as Card from '@/components/ui/card';
	import * as Form from '@/components/ui/form';
	import type { PageData } from './$types';
	import { ProfileImage } from '@/components/custom/profile_image';
	import { Button } from '@/components/ui/button';

	export let data: PageData;
	let mounted = false;

	const form = superForm(data.form, {
		validators: zodClient(editUserSchema)
	});

	const { form: formData, enhance } = form;

	$formData.fullName = $userStore?.fullName || '';

	const fetchImage = async (url: string, name: string) => {
		const res = await fetch(url);
		const blob = await res.blob();
		return new File([blob], name);
	};

	const image = fileProxy(form, 'profileImage');

	onMount(async () => {
		const oldProfileImage = await fetchImage(
			$userStore?.profileImage.imageUrl as string,
			'old_profile_image.avif`'
		);
		mounted = true;
		$formData.profileImage = oldProfileImage;
	});
</script>

<Card.Root class="flex h-full w-full justify-center">
	<div class="">
		<Card.Header>
			<Card.Title class="text-xl">Edit profile</Card.Title>
			<Card.Description class="text-base"
				>Make changes to your profile here. Click save when you're done.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form
				action="/user/{$userStore?.id}?/editUserFullName"
				method="post"
				use:enhance
				enctype="multipart/form-data"
			>
				<Form.Field {form} name="fullName">
					<Form.Control let:attrs>
						<Form.Label class="text-base">Name</Form.Label>
						<Input {...attrs} bind:value={$formData.fullName} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="profileImage">
					<Form.Control let:attrs>
						<!-- it's fine -->
						<Form.Label class="text-base">Profile Image</Form.Label>

						<div class="flex items-center gap-5">
							{#if mounted}
								<ProfileImage
									imageUrl={URL.createObjectURL($formData.profileImage)}
									name="Image of {$userStore?.fullName}"
									on:load={(e) => URL.revokeObjectURL(e.target?.src)}
									class="h-12 w-12"
								/>
							{/if}
							<input type="file" {...attrs} accept="image/*" bind:files={$image} hidden />
							<Button
								disabled={!mounted}
								variant="outline"
								on:click={() => document.getElementById(attrs.id)?.click()}>Change</Button
							>
						</div>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</form>
		</Card.Content>
	</div>
</Card.Root>
