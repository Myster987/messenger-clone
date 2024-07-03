import { writable } from 'svelte/store';
import { createAsyncStore } from './async_stores';
import type { InferQueryModel } from '@/db/types';

type User = Omit<InferQueryModel<'users', { with: { profileImage: true } }>, 'password'>;

export const userStore = writable<User | null>(null);

type Conversations = InferQueryModel<
	'conversations',
	{ with: { members: true; conversationImages: true } }
>;

export const conversationsStore = createAsyncStore<Conversations[]>();
