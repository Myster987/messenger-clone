<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { signInFormSchema } from '@/auth/form_schemas';
	import { toast } from 'svelte-sonner';
	import { Input } from '@/components/ui/input';
	import { Separator } from '@/components/ui/separator';
	import * as Form from '@/components/ui/form';
	import type { PageData } from './$types';

	export let data: PageData;

	const form = superForm(data.form, {
		validators: zodClient(signInFormSchema),
		onSubmit() {
			toast.loading('Please wait...');
		},
		onResult({ result }) {
			if (result.type == 'failure') {
				toast.error('Something went wrong.');
			} else if (result.type == 'redirect') {
				toast.success('Login successfull!');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<main class="flex min-h-[100dvh] items-center justify-center">
	<div class="rounded-xl p-6 sm:w-2/3 sm:border-2 md:w-1/2 lg:w-1/3">
		<div class="pb-3">
			<h1 class="text-xl sm:text-2xl">Sign In</h1>
			<p class="text-muted-foreground sm:text-base">Enter data to sign in.</p>
		</div>
		<div>
			<form method="post" use:enhance>
				<Form.Field {form} name="email">
					<Form.Control let:attrs>
						<Form.Label class="text-base">Email</Form.Label>
						<Input {...attrs} bind:value={$formData.email} />
					</Form.Control>
					<Form.FieldErrors class="flex flex-wrap gap-1	" />
				</Form.Field>

				<Form.Field {form} name="password">
					<Form.Control let:attrs>
						<Form.Label class="text-base">Password</Form.Label>
						<Input {...attrs} type="password" bind:value={$formData.password} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Button type="submit" class="my-2 mt-3 w-full text-base">Login</Form.Button>
			</form>

			<div class="grid grid-cols-3 items-center gap-1 p-1 text-center">
				<Separator />
				<p class="text-muted-foreground text-xs sm:text-sm">If you don't have an account</p>
				<Separator />
			</div>
			<a href="/sign_up">
				<Form.Button variant="outline" class="my-1 w-full text-base">Sign Up</Form.Button>
			</a>
		</div>
	</div>
</main>
