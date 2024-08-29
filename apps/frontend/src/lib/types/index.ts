import type { InferQueryModel } from '@/db/types';
import type { SelectConversationMembers, SelectMessages } from '@/db/schema';

export type Prettify<T> = {
	[K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K];
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
} & unknown;

export type User = Omit<InferQueryModel<'users', { with: { profileImage: true } }>, 'password'>;

export type Member = SelectConversationMembers;

export type Message = SelectMessages & { imageUrl: string };

export type MessageWithMember = Prettify<{
	message: Message;
	conversationMember: Member;
}>;

export type SocketMessage = Prettify<{
	type: 'message' | 'image';
	body: MessageWithMember;
}>;

export type SocketUpdateMembers = {
	conversationId: string;
} & ({ type: 'add'; members: MemberWithProfileImage[] } | { type: 'leave'; memberId: string });

export type MemberWithProfileImage = InferQueryModel<
	'conversationMembers',
	{
		with: {
			user: {
				with: { profileImage: { columns: { userId: true; imageUrl: true } } };
				columns: { isOnline: true; fullName: true };
			};
		};
	}
>;

export type StoreConversation = InferQueryModel<
	'conversationMembers',
	{
		columns: {
			conversationId: false;
			createdAt: false;
			id: false;
			nick: false;
			userId: false;
			lastSeenMessageId: false;
			isAdmin: false;
			currentlyMember: false;
		};
		with: {
			conversation: {
				with: {
					conversationImage: true;
					latestMessage: true;
					members: {
						with: {
							user: {
								with: { profileImage: { columns: { userId: true; imageUrl: true } } };
								columns: { isOnline: true; fullName: true };
							};
						};
					};
				};
			};
		};
	}
>;

export type DefaultApiResponse = { success: boolean };

export type ApiResponse<T extends Record<string, unknown>> = DefaultApiResponse & T;
