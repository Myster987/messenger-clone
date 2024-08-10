import type { InferQueryModel } from 'db/types';

export type Prittyfy<T> = {
	[K in keyof T]: T[K];
} & {};

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
