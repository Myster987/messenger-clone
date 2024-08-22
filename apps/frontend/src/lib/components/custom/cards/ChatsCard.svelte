<script lang="ts">
	import { UserRoundPlus } from 'lucide-svelte';
	import { conversationsStore, userStore } from '@/stores';
	import { Button } from '@/components/ui/button';
	import { Skeleton } from '@/components/ui/skeleton';
	import { ScrollArea } from '@/components/ui/scroll-area';
	import { Badge } from '@/components/ui/badge';
	import {
		DisplayConversationName,
		DisplayConversationImage,
		DisplayLatestMessage
	} from '../other';
	import * as Card from '@/components/ui/card';
	import * as Command from '@/components/ui/command';
	import * as Tooltip from '@/components/ui/tooltip';
	import type { StoreConversation } from '@/types';

	let inputValue = '';

	let conversations: StoreConversation[];

	$: conversations = $conversationsStore.data || [];
	$: conversations =
		$conversationsStore.data?.filter(
			(val) =>
				val.conversation.name.toLowerCase().includes(inputValue.toLowerCase()) ||
				val.conversation.members.some(
					(el) =>
						el.userId != $userStore?.id &&
						(el.nick?.toLowerCase().includes(inputValue.toLowerCase()) ||
							el.user.fullName.toLowerCase().includes(inputValue.toLowerCase()))
				)
		) || [];
</script>

<Card.Root class="flex w-[360px] flex-col">
	<Card.Header class="flex flex-col gap-1 p-4 pb-0">
		<div class="flex justify-between">
			<h1 class="flex items-center text-2xl font-semibold">Chats</h1>
			<div class="flex gap-2">
				<a href="/user/{$userStore?.id}/new_chat">
					<Tooltip.Root>
						<Tooltip.Trigger asChild let:builder>
							<Button builders={[builder]} variant="secondary" size="icon" class="rounded-full"
								><UserRoundPlus class="ml-1" /></Button
							>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>New chat</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</a>
			</div>
		</div>
		<Command.Root class="bg-secondary rounded-full px-1 ">
			<Command.Input
				placeholder="Search in Messenger (clone)"
				class="bg-secondary h-9 py-0"
				bind:value={inputValue}
			/>
		</Command.Root>
	</Card.Header>
	<Card.Content class="h-[calc(100%-102.8px)] p-2">
		<ScrollArea class="h-full">
			<ul class="mr-4 grid gap-1">
				{#if $conversationsStore.data}
					{#each conversations as { conversation } (conversation.id)}
						<li>
							<a href="/user/{$userStore?.id}/conversation/{conversation.id}">
								<Button variant="ghost" class="flex h-16 w-full justify-start gap-2 p-2">
									<div class="relative">
										<DisplayConversationImage
											isGroup={conversation.isGroup}
											conversationName={conversation.name}
											conversationImage={conversation.conversationImage}
											usersProfileImages={conversation.members.map((val) => val.user.profileImage)}
										/>
										{#if conversation.members.some((val) => val.user.isOnline && val.userId != $userStore?.id)}
											<Badge variant="online" class="absolute bottom-0 right-0" />
										{/if}
									</div>

									<div>
										<p class="text-left font-semibold">
											<DisplayConversationName
												members={conversation.members}
												isGroup={conversation.isGroup}
												groupName={conversation.name}
											/>
										</p>
										<DisplayLatestMessage
											latestMessage={conversation.latestMessage}
											members={conversation.members}
											class="max-w-[225px] truncate"
										/>
									</div>
									<!-- {#if conversation.}
										
									<Badge variant="notification" class="ml-auto" />
									{/if} -->
								</Button>
							</a>
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
