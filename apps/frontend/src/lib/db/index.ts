import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
	url: process.env.SECRET_DATABASE_URL || 'http://db:8081'
});

export const db = drizzle(client, { schema });
