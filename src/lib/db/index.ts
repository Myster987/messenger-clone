import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

const client = createClient({
	url: process.env.DATABASE_URL!,
	authToken: process.env.DATABASE_TOKEN,
	fetch: (req: Request) => fetch(req.url, req)
});

export const db = drizzle(client, { schema });

console.log(
	await db.run(sql`SELECT count(*) FROM sqlite_master WHERE type='table' AND name='users_ft';`)
);
