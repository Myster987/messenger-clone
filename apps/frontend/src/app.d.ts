// See https://kit.svelte.dev/docs/types#app

import type { KyInstance } from 'ky';
import type { Session } from '$lib/auth';
import type { User } from '@/types';
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
			session: Session | null;
			apiClient: KyInstance;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
