// See https://kit.svelte.dev/docs/types#app

import type { KyInstance } from 'ky';
import type { Session, User } from 'lucia';
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
