import { PUBLIC_API_URL } from '$env/static/public';
import { writable } from 'svelte/store';
import { createHonoClient } from 'backend';
import { createAsyncStore } from './async_stores';
import { fetchWithCredentials } from '@/utils';
import type { User, StoreConversation } from '@/types';

export const userStore = writable<User | null>(null);

export const conversationsStore = createAsyncStore<StoreConversation[]>();

export const honoClientStore = writable(createHonoClient(PUBLIC_API_URL, fetchWithCredentials));
