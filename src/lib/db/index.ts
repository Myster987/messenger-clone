import { SECRET_DATABASE_TOKEN, SECRET_DATABASE_URL } from '$env/static/private';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({ url: SECRET_DATABASE_URL, authToken: SECRET_DATABASE_TOKEN });

export const db = drizzle(client, { schema });

export const createFtsTable = async () => {
	db.run(sql`CREATE VIRTUAL TABLE users_fts (user_id, user_full_name)`);
};
