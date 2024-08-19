import type { InferQueryModel } from 'db/types';

export type Prittyfy<T> = {
	[K in keyof T]: T[K];
} & {};

export type User = Omit<InferQueryModel<'users', { with: { profileImage: true } }>, 'password'>;

export type Member = {
	id: string;
	conversationId: string;
	userId: string;
	nick: string | null;
	lastSeenMessageId: string | null;
};

export type Message = {
	id: string;
	createdAt: string;
	updatedAt: string;
	imageUrl: string;
	senderId: string;
	body: string | null;
	imageId: string | null;
};

export type MessageWithMember = {
	message: Message;
	conversationMember: Member;
};

export type SocketMessage = {
	type: 'message' | 'image';
	body: MessageWithMember;
};

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
		};
		with: {
			conversation: {
				with: {
					conversationImage: true;
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
