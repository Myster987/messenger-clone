<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { fileProxy, superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { imageInputSchema, messageInputSchema } from '@/auth/form_schemas';
	import { ImageUp, SendHorizontal } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';
	import * as Form from '@/components/ui/form';
	import * as Dialog from '@/components/ui/dialog';

	export let messageFormObject: SuperValidated<Infer<typeof messageInputSchema>>;
	export let imageFormObject: SuperValidated<Infer<typeof imageInputSchema>>;
	export let currentMemberId: string;
	let dialogOpen = false;
	let inputElement: HTMLElement;

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
			inputElement.focus();
		}
	});

	$: ({ form: messageFormData, enhance: messageEnhance } = messageForm);

	const imageForm = superForm(imageFormObject, {
		validators: zodClient(imageInputSchema),
		invalidateAll: false,
		onSubmit({ formData }) {
			formData.append('senderId', currentMemberId);
			formData.append('image', $imageFormData.image);
			toast.loading('Please wait. It can take a while...');
		},
		onUpdate({ form, result }) {
			if (!form.valid && !form?.message?.text) {
				toast.error('Something went wrong.');
			} else if (result.type == 'failure') {
				toast.error(form?.message?.text);
			} else {
				dialogOpen = false;
				toast.success('Image uploaded.');
			}
			$imageFormData.senderId = currentMemberId;
		}
	});

	$: ({ form: imageFormData, enhance: imageEnhance, submit: imageFormSubmit } = imageForm);

	$: if ($messageFormData) $messageFormData.senderId = currentMemberId;
	$: if ($imageFormData) $imageFormData.senderId = currentMemberId;

	$: if (!$messageFormData.senderId) $messageFormData.senderId = currentMemberId;
	$: if (!$imageFormData.senderId) $imageFormData.senderId = currentMemberId;

	$: image = fileProxy(imageForm, 'image');
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
				<input
					{...attrs}
					bind:value={$messageFormData.text}
					bind:this={inputElement}
					autocomplete="off"
					placeholder="Aa"
					class="border-input bg-secondary ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-full border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				/>
			</Form.Control>
		</Form.Field>

		<Button variant="ghost" size="icon" class="hover:bg-transparent" type="submit">
			<SendHorizontal class="text-primary" />
		</Button>
	</form>
</div>
