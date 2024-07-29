// See https://kit.svelte.dev/docs/types#app

import type { Session, User } from 'lucia';
import type { HonoClient } from 'backend';
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
			session: Session | null;
			honoClient: HonoClient;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
