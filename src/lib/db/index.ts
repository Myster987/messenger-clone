import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
// import { sql } from 'drizzle-orm';

// export const createUsersFtsTable = async () => {
// 	const ftsTableExistsQuery = await db.run(
// 		sql`SELECT count(*) FROM sqlite_master WHERE type='table' AND name='users_fts';`
// 	);
// 	const exists = ftsTableExistsQuery.rows[0]['0'];

// if (exists) return;

// 	await db.run(sql`CREATE VIRTUAL TABLE  users_fts USING fts5 (user_id, user_full_name);`);
// 	await db.run(sql`INSERT INTO users_fts SELECT id, full_name FROM users;`);
// 	await db.run(
// 		sql`CREATE TRIGGER inser_users_fts after INSERT on users begin INSERT INTO users_fts (user_id, user_full_name) VALUES (NEW.id, NEW.full_name); end;`
// 	);
// 	await db.run(
// 		sql`CREATE TRIGGER update_users_fts after UPDATE on users begin UPDATE users_fts SET user_id = NEW.id, user_full_name = NEW.full_name WHERE user_id = NEW.id; end;`
// 	);
// 	await db.run(
// 		sql`CREATE TRIGGER delete_users_fts after DELETE on users begin DELETE FROM users_fts WHERE user_id = OLD.id; end;`
// 	);
// };

const client = createClient({
	url: process.env.DATABASE_URL!,
	authToken: process.env.DATABASE_TOKEN,
	fetch: (req: Request) => fetch(req.url, req)
});

export const db = drizzle(client, { schema });

// await createUsersFtsTable()
