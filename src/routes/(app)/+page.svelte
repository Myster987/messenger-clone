<script lang="ts">
	import { Separator } from '@/components/ui/separator';
	import { Button } from '@/components/ui/button';
	import * as Card from '@/components/ui/card';
	import MessengerLogo from '@/assets/messenger_logo.png';
</script>

<div class="flex h-screen items-center justify-center">
	<div>
		<div class="grid justify-center pb-2">
			<div class="aspect-square w-16 justify-self-center">
				<img src={MessengerLogo} alt="Messenger logo" />
			</div>
			<h1 class="text-2xl font-bold">To continue</h1>
		</div>
		<div>
			<Card.Root>
				<Card.Content class="flex flex-col gap-1 p-4">
					<a href="/sign_in" class="w-60">
						<Button class="w-full">Sign In</Button>
					</a>

					<div class="grid grid-cols-3 items-center gap-1 p-1 text-center">
						<Separator />
						<p class="text-muted-foreground">Or</p>
						<Separator />
					</div>

					<a href="/sign_up">
						<Button class="w-full">Sign Up</Button>
					</a>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
