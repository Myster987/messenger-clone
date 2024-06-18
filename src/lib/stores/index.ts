import { writable } from 'svelte/store';
import type { InferQueryModel } from '@/db/types';

type User = Omit<InferQueryModel<'users', { with: { profileImage: true } }>, 'password'>;

export const userStore = writable<User | null>(null);
