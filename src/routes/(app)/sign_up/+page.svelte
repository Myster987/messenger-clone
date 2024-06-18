<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { signUpFormSchema } from '@/auth/form_schemas';
	import { toast } from 'svelte-sonner';
	import { Input } from '@/components/ui/input';
	import { Separator } from '@/components/ui/separator';
	import * as Form from '@/components/ui/form';
	import type { PageData } from './$types';

	export let data: PageData;

	const form = superForm(data.form, {
		validators: zodClient(signUpFormSchema),
		onSubmit() {
			toast.loading('Creating an account. Please wait...');
		},
		onResult({ result }) {
			if (result.type == 'failure') {
				toast.error('Something went wrong');
			} else if (result.type == 'redirect') {
				toast.success('The account has been successfully created!');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<main class="flex min-h-screen items-center justify-center">
	<div class="rounded-xl p-6 sm:w-2/3 sm:border-2 md:w-1/2 lg:w-1/3">
		<div class="pb-3">
			<h1 class="text-xl sm:text-2xl">Sign Up</h1>
			<p class="text-muted-foreground sm:text-base">Enter data and create an account.</p>
		</div>
		<div>
			<form method="post" use:enhance>
				<Form.Field {form} name="fullName">
					<Form.Control let:attrs>
						<Form.Label class="text-base">Full name</Form.Label>
						<Input {...attrs} bind:value={$formData.fullName} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="email">
					<Form.Control let:attrs>
						<Form.Label class="text-base">Email</Form.Label>
						<Input {...attrs} bind:value={$formData.email} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="password">
					<Form.Control let:attrs>
						<Form.Label class="text-base">Password</Form.Label>
						<Input {...attrs} type="password" bind:value={$formData.password} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="confirmPassword">
					<Form.Control let:attrs>
						<Form.Label class="text-base">Confirm password</Form.Label>
						<Input {...attrs} type="password" bind:value={$formData.confirmPassword} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Button type="submit" class="my-2 mt-3 w-full text-base">Create an account</Form.Button
				>
			</form>

			<div class="grid grid-cols-3 items-center gap-1 p-1 text-center">
				<Separator />
				<p class="text-xs text-muted-foreground sm:text-sm">If you already have an account</p>
				<Separator />
			</div>
			<a href="/sign_in">
				<Form.Button variant="outline" class="my-1 w-full text-base">Sign In</Form.Button>
			</a>
		</div>
	</div>
</main>
