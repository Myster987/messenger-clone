import { SECRET_DATABASE_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
	url: SECRET_DATABASE_URL || 'http://db:8080'
});

export const db = drizzle(client, { schema });
