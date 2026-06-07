import { dev } from '$app/environment';
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { db } from '@/db';
import { sessions, users, accounts, verifications } from '@/db/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema: {
			user: users,
			session: sessions,
			account: accounts,
			verification: verifications
		}
	}),

	user: {
		fields: {
			name: 'fullName'
		},
		additionalFields: {
			profileImageId: {
				type: 'string',
				required: false,
				nullable: true
			}
		}
	},

	session: {
		cookieCache: { enabled: true }
	},

	advanced: {
		useSecureCookies: !dev
	},

	emailAndPassword: { enabled: true },

	baseURL: env.BETTER_AUTH_URL || 'http://placeholder',
	secret: env.BETTER_AUTH_SECRET || 'dummysecret123',

	telemetry: {
		enabled: false
	},
	logger: {
		disabled: true
	},

	plugins: [sveltekitCookies(getRequestEvent)]
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
