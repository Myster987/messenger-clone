import { PUBLIC_API_URL } from '$env/static/public';
import { writable } from 'svelte/store';
import { createHonoClient } from 'backend';
import { createAsyncStore } from './async_stores';
import { fetchWithCredentials } from '@/utils';
import type { InferQueryModel } from 'db/types';

type User = Omit<InferQueryModel<'users', { with: { profileImage: true } }>, 'password'>;

export const userStore = writable<User | null>(null);

type Conversations = InferQueryModel<
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

export const conversationsStore = createAsyncStore<Conversations[]>();

export const currentConversationStore = writable<Conversations['conversation']>();

export const honoClientStore = writable(createHonoClient(PUBLIC_API_URL, fetchWithCredentials));
