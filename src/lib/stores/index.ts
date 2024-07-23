import { writable } from 'svelte/store';
import { createAsyncStore } from './async_stores';
import type { InferQueryModel } from '@/db/types';

type User = Omit<InferQueryModel<'users', { with: { profileImage: true } }>, 'password'>;

export const userStore = writable<User | null>(null);

type Conversations = InferQueryModel<
	'conversationMembers',
	{
		columns: { conversationId: false; createdAt: false; id: false; nick: false; userId: false };
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
