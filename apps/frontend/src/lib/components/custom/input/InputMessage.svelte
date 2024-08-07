<script lang="ts">
	import { fileProxy, superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { imageInputSchema, messageInputSchema } from '@/auth/form_schemas';
	import { ImageUp, SendHorizontal } from 'lucide-svelte';
	import { Input } from '@/components/ui/input';
	import { Button } from '@/components/ui/button';
	import * as Form from '@/components/ui/form';
	import * as Dialog from '@/components/ui/dialog';
	import { toast } from 'svelte-sonner';

	export let messageFormObject: SuperValidated<Infer<typeof messageInputSchema>>;
	export let imageFormObject: SuperValidated<Infer<typeof imageInputSchema>>;
	export let currentMemberId: string;
	let dialogOpen = false;

	const messageForm = superForm(messageFormObject, {
		validators: zodClient(messageInputSchema),
		invalidateAll: false,
		onSubmit({ formData }) {
			formData.append('senderId', currentMemberId);
		},
		onUpdate({ form, result }) {
			if (form.message) {
				if (result.type == 'failure') {
					toast.error(form.message?.text);
				}
			}
		}
	});

	const { form: messageFormData, enhance: messageEnhance } = messageForm;

	const imageForm = superForm(imageFormObject, {
		validators: zodClient(imageInputSchema),
		invalidateAll: false,
		onSubmit({ formData }) {
			formData.append('senderId', currentMemberId);
			formData.append('image', $imageFormData.image);
		},
		onUpdate({ form, result }) {
			if (!form.valid && !form?.message?.text) {
				toast.error('Something went wrong.');
			} else if (result.type == 'failure') {
				toast.error(form?.message?.text);
			} else {
				dialogOpen = false;
			}
			$imageFormData.senderId = currentMemberId;
		}
	});

	const { form: imageFormData, enhance: imageEnhance, submit: imageFormSubmit } = imageForm;

	$messageFormData.senderId = currentMemberId;
	$imageFormData.senderId = currentMemberId;

	$: if (!$messageFormData.senderId) $messageFormData.senderId = currentMemberId;
	$: if (!$imageFormData.senderId) $imageFormData.senderId = currentMemberId;

	const image = fileProxy(imageForm, 'image');
</script>

<div class="flex w-full flex-nowrap gap-1">
	<form action="?/sendImage" method="post" enctype="multipart/form-data" use:imageEnhance>
		<Form.Field form={imageForm} name="senderId" class="hidden">
			<Form.Control let:attrs>
				<input {...attrs} type="text" bind:value={$messageFormData.senderId} hidden />
			</Form.Control>
		</Form.Field>

		<Form.Field form={imageForm} name="image">
			<Form.Control let:attrs>
				<Dialog.Root bind:open={dialogOpen}>
					<Dialog.Trigger>
						<Button variant="ghost" size="icon" class="hover:bg-transparent">
							<ImageUp class="text-primary" />
						</Button>
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Upload image</Dialog.Title>
							<Dialog.Description
								>Click button to select photo and then click submit button</Dialog.Description
							>
						</Dialog.Header>
						<input type="file" {...attrs} accept="image/*" bind:files={$image} hidden />

						<div class="h-60">
							{#if $imageFormData.image}
								<div class="h-full w-full overflow-hidden rounded-md">
									<!-- It's fine -->
									<img
										src={URL.createObjectURL($imageFormData.image)}
										alt={$imageFormData.image.name}
										on:load={(e) => URL.revokeObjectURL(e.target?.src)}
										class="h-full w-full object-contain"
									/>
								</div>
							{:else}
								<Button
									variant="outline"
									on:click={() => document.getElementById(attrs.id)?.click()}
									class="h-full w-full">Select photo</Button
								>
							{/if}
						</div>
						<Form.FieldErrors />

						<Dialog.Footer>
							<div class="flex w-full justify-between">
								<Button on:click={() => document.getElementById(attrs.id)?.click()}
									>Upload other image</Button
								>
								<Button type="submit" on:click={() => imageFormSubmit()}>Submit</Button>
							</div>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
			</Form.Control>
		</Form.Field>
	</form>

	<form
		method="post"
		action="?/sendMessage"
		use:messageEnhance
		class="flex w-full items-center gap-1"
	>
		<Form.Field form={messageForm} name="senderId" class="hidden">
			<Form.Control let:attrs>
				<input {...attrs} type="text" bind:value={$messageFormData.senderId} hidden />
			</Form.Control>
		</Form.Field>

		<Form.Field form={messageForm} name="text" class="flex w-full items-center">
			<Form.Control let:attrs>
				<Input
					{...attrs}
					bind:value={$messageFormData.text}
					autocomplete="off"
					placeholder="Aa"
					class="bg-secondary h-9 w-full rounded-full"
				/>
			</Form.Control>
		</Form.Field>

		<Button variant="ghost" size="icon" class="hover:bg-transparent" type="submit">
			<SendHorizontal class="text-primary" />
		</Button>
	</form>
</div>
