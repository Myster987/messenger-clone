import { PUBLIC_API_URL } from '$env/static/public';
import { writable } from 'svelte/store';
import { createAsyncStore } from './async_stores';
import ky from 'ky';
import type { User, StoreConversation } from '@/types';

export const userStore = writable<User | null>(null);

export const conversationsStore = createAsyncStore<StoreConversation[]>();

export const apiClientStore = writable(
	ky.create({
		prefixUrl: PUBLIC_API_URL,
		credentials: 'include'
	})
);

export const windowWidth = writable(0);
