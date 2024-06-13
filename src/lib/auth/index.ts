import { dev } from "$app/environment";
import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { db} from "@/db";
import { sessions, users } from "@/db/schema";


const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: !dev
		}
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
	}
}