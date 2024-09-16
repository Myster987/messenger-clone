import { writable } from 'svelte/store';
import { createAsyncStore } from './async_stores';
import ky from 'ky';
import type { User, StoreConversation } from '@/types';

export const userStore = writable<User | null>(null);

export const conversationsStore = createAsyncStore<StoreConversation[]>();

export const apiClientStore = writable(
	ky.create({
		prefixUrl: process.env.PUBLIC_API_URL,
		credentials: 'include',
		throwHttpErrors: false
	})
);

export const windowWidth = writable(0);
