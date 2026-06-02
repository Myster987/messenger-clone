import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
	url: String(env.SECRET_DATABASE_URL).trim() || 'http://db:8080',
	authToken: env.SECRET_DATABASE_TOKEN
});

export const db = drizzle(client, { schema });
