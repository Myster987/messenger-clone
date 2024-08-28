<script lang="ts">
	import { Ellipsis } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';
	import { ConversationInfoCard } from '@/components/custom/cards/conversation-info';
	import * as Sheet from '@/components/ui/sheet';
	import type { addMembersToGroup } from '@/auth/form_schemas';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { MemberWithProfileImage, StoreConversation } from '@/types';

	export let currentMember: MemberWithProfileImage;
	export let conversationData: StoreConversation['conversation'] | null | undefined;
	export let addMembersToGroupFormObject: SuperValidated<Infer<typeof addMembersToGroup>>;
</script>

<Sheet.Root>
	<Sheet.Trigger asChild let:builder>
		<Button builders={[builder]} variant="ghost" size="icon" class="rounded-full"
			><Ellipsis /></Button
		>
	</Sheet.Trigger>
	<Sheet.Content side="right" class="p-0">
		<ConversationInfoCard
			{currentMember}
			{conversationData}
			{addMembersToGroupFormObject}
			class="border-none"
		/>
	</Sheet.Content>
</Sheet.Root>
