<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { userStore } from '@/stores';
	import { editUserSchema } from '@/auth/form_schemas';
	import { Button } from '@/components/ui/button';
	import { Input } from '@/components/ui/input';
	import { Separator } from '@/components/ui/separator';
	import { Skeleton } from '@/components/ui/skeleton';
	import { BackToLinkButton } from '@/components/custom/buttons';
	import { ProfileImage } from '@/components/custom/profile_image';
	import * as Card from '@/components/ui/card';
	import * as Form from '@/components/ui/form';
	import type { PageData } from './$types';

	export let data: PageData;
	let mounted = false;
	let newImageUploaded = false;

	const fetchImage = async (url: string, name: string) => {
		const res = await fetch(url);
		const blob = await res.blob();
		return new File([blob], name);
	};

	const setDefaults = async () => {
		$formData.fullName = $userStore?.fullName || '';
		const oldProfileImage = await fetchImage(
			$userStore?.profileImage?.imageUrl as string,
			'old_profile_image.avif`'
		);
		mounted = true;
		$formData.profileImage = oldProfileImage;
	};

	const form = superForm(data.form, {
		validators: zodClient(editUserSchema),
		onSubmit({ formData, cancel }) {
			if (newImageUploaded) {
				formData.append('profileImage', $formData.profileImage as File);
			}
			if ($formData.fullName == $userStore?.fullName && !newImageUploaded) {
				toast.error('No changes made');
				cancel();
				return;
			}
			toast.loading('Please wait...');
		},
		onUpdated({ form }) {
			if (!form.valid && !form.message.text) {
				toast.error('Incorrect form');
			} else if (form.message.success) {
				toast.success(form.message.text);
				setDefaults();
			} else {
				toast.error(form.message.text);
			}
		}
	});

	const { form: formData, enhance } = form;

	const image = fileProxy(form, 'profileImage');

	onMount(() => setDefaults());
</script>

<BackToLinkButton href="/user/{$userStore?.id}" class="absolute left-4 top-4 lg:hidden" />

<Card.Root
	class="flex h-full w-full items-center justify-center border-none lg:border lg:border-solid"
>
	<div>
		<Card.Header>
			<Card.Title class="text-xl">Edit profile</Card.Title>
			<Card.Description class="text-base"
				>Make changes to your profile here. Click save when you're done.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form
				action="?/editUserFullName"
				method="post"
				enctype="multipart/form-data"
				use:enhance
				class="grid gap-2"
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
						<Form.Label class="text-base">Profile Image</Form.Label>

						<div class="flex items-center gap-5">
							{#if !mounted || !$formData.profileImage}
								<Skeleton class="h-12 w-12 rounded-full" />
							{:else}
								<!-- it's fine -->
								<ProfileImage
									imageUrl={URL.createObjectURL($formData.profileImage)}
									name={$userStore?.fullName || ''}
									on:load={(e) => URL.revokeObjectURL(e.target?.src)}
									class="h-12 w-12"
								/>
							{/if}

							<input
								type="file"
								{...attrs}
								accept="image/*"
								bind:files={$image}
								on:input={() => (newImageUploaded = true)}
								hidden
							/>
							<Button
								disabled={!mounted}
								variant="outline"
								on:click={() => document.getElementById(attrs.id)?.click()}>Change</Button
							>
						</div>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Separator class="mt-2" />

				<div class="flex justify-between py-4">
					<Button variant="outline">Cancel</Button>
					<Button type="submit">Submit</Button>
				</div>
			</form>
		</Card.Content>
	</div>
</Card.Root>
