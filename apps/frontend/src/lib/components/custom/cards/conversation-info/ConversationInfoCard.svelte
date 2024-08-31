<script lang="ts">
	import { cn } from '@/utils';
	import { addMembersToGroup } from '@/auth/form_schemas';
	import { LeaveGroupButton } from '@/components/custom/buttons';
	import { ProfileImage } from '@/components/custom/profile_image';
	import { DisplayConversationImage, DisplayConversationName } from '@/components/custom/other';
	import {
		AddNewMembersToGroup,
		EditConversationNicksDialog,
		EditGroupImageDialog,
		EditGroupName
	} from '@/components/custom/dialog';
	import { ScrollArea } from '@/components/ui/scroll-area';
	import * as Accordion from '@/components/ui/accordion';
	import * as Card from '@/components/ui/card';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { MemberWithProfileImage, StoreConversation } from '@/types';

	export let currentMember: MemberWithProfileImage;
	export let conversationData: StoreConversation['conversation'] | null | undefined;
	export let addMembersToGroupFormObject: SuperValidated<Infer<typeof addMembersToGroup>>;

	let className: string | undefined = undefined;
	export { className as class };
</script>

<Card.Root class={cn('h-full', className)}>
	<ScrollArea class="h-[100dvh] lg:h-[calc(100dvh-32px)]">
		<Card.Header class="flex items-center gap-1">
			{#if conversationData}
				{#if conversationData.isGroup}
					<div class="h-[66px] w-[66px]">
						<DisplayConversationImage
							isGroup={conversationData.isGroup}
							conversationImage={conversationData.conversationImage}
							conversationName={conversationData.name}
							usersProfileImages={conversationData.members.map(
								(member) => member.user.profileImage
							)}
							width={14}
							height={14}
						/>
					</div>
				{:else}
					<div class="h-24 w-24">
						<DisplayConversationImage
							isGroup={conversationData.isGroup}
							conversationImage={conversationData.conversationImage}
							conversationName={conversationData.name}
							usersProfileImages={conversationData.members.map(
								(member) => member.user.profileImage
							)}
							width={15}
							height={15}
						/>
					</div>
				{/if}
			{/if}
			<Card.Title
				><DisplayConversationName
					members={conversationData?.members || []}
					isGroup={conversationData?.isGroup}
					groupName={conversationData?.name}
				/></Card.Title
			>
		</Card.Header>

		<!-- <div class="flex flex-col gap-2 px-3"> -->

		<Accordion.Root class="mx-2 flex flex-col gap-2">
			<Accordion.Item value="editing" class="w-full border-none">
				<Accordion.Trigger
					class="hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-3 hover:no-underline"
					>Menage conversation</Accordion.Trigger
				>
				<Accordion.Content class="mt-2">
					<div class="flex flex-col gap-2">
						<EditConversationNicksDialog members={conversationData?.members || []} />
						{#if conversationData?.isGroup}
							<EditGroupName conversation={conversationData} />
							<EditGroupImageDialog
								conversationImage={conversationData.conversationImage}
								{currentMember}
							/>
						{/if}
					</div>
				</Accordion.Content>
			</Accordion.Item>

			{#if conversationData?.isGroup}
				<Accordion.Item value="users" class="w-full border-none">
					<Accordion.Trigger
						class="hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-3 hover:no-underline"
						>Conversation members</Accordion.Trigger
					>
					<Accordion.Content class="mt-2">
						<ul class="flex flex-col gap-2">
							{#each conversationData?.members || [] as member}
								{#if member.currentlyMember}
									<li class="flex w-full items-center justify-start gap-2 p-2">
										<div>
											<ProfileImage
												imageUrl={member.user.profileImage?.imageUrl}
												name={member.user.fullName}
											/>
										</div>
										<div>
											<p class="font-semibold">{member.user.fullName}</p>
											<p class="text-muted-foreground text-left text-sm">
												{#if member.isAdmin}
													Admin
												{:else}
													Member
												{/if}
											</p>
										</div>
									</li>
								{/if}
							{/each}
							<li>
								<AddNewMembersToGroup
									{currentMember}
									{addMembersToGroupFormObject}
									currentConversation={conversationData}
								/>
							</li>
						</ul>
					</Accordion.Content>
				</Accordion.Item>

				<div>
					<LeaveGroupButton {currentMember} />
				</div>
			{/if}
		</Accordion.Root>
	</ScrollArea>
</Card.Root>
