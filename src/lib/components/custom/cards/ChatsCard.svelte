<script lang="ts">
	import { UserRoundPlus } from 'lucide-svelte';
	import { conversationsStore, userStore } from '@/stores';
	import { Button } from '@/components/ui/button';
	import { Skeleton } from '@/components/ui/skeleton';
	import { ScrollArea } from '@/components/ui/scroll-area';
	import { DisplayChatName, DisplayConversationImage } from '../other';
	import * as Card from '@/components/ui/card';
	import * as Command from '@/components/ui/command';

	let inputValue = '';
</script>

<Card.Root class="flex w-[360px] flex-col">
	<Card.Header class="flex flex-col gap-1 p-4 pb-0">
		<div class="flex justify-between">
			<h1 class="flex items-center text-2xl font-semibold">Chats</h1>
			<a href="/user/{$userStore?.id}/new_chat"
				><Button variant="secondary" size="icon" class="rounded-full pl-1"><UserRoundPlus /></Button
				></a
			>
		</div>
		<Command.Root class="rounded-full bg-secondary px-1 ">
			<Command.Input
				placeholder="Search in Messenger (clone)"
				class="h-9 bg-secondary py-0"
				bind:value={inputValue}
			/>
		</Command.Root>
	</Card.Header>
	<Card.Content class="h-[calc(100%-102.8px)] flex-grow p-2">
		<ScrollArea class="h-full">
			<ul class="mr-4 grid gap-1">
				{#if $conversationsStore.data}
					{#each $conversationsStore.data as { conversation } (conversation.id)}
						<li class="w-full">
							<Button variant="ghost" class="flex h-16 w-full justify-start gap-2 p-2">
								<DisplayConversationImage
									isGroup={conversation.isGroup}
									conversationName={conversation.name}
									conversationImage={conversation.conversationImage}
									usersProfileImages={conversation.members.map((val) => val.user.profileImage)}
								/>

								<div>
									{#if conversation.isGroup}
										<p class="font-semibold">{conversation.name}</p>
									{:else}
										<p>
											<DisplayChatName members={conversation.members} />
										</p>
									{/if}
									<p></p>
								</div>
							</Button>
						</li>
					{/each}
				{:else if $conversationsStore.isLoading}
					<div class="grid gap-4">
						{#each Array(5) as _}
							<li class="flex items-center space-x-4 p-2">
								<Skeleton class="h-12 w-12 rounded-full" />
								<div class="space-y-2">
									<Skeleton class="h-5 w-[150px]" />
									<Skeleton class="h-4 w-[225px]" />
								</div>
							</li>
						{/each}
					</div>
				{/if}
			</ul>
		</ScrollArea>
	</Card.Content>
</Card.Root>
