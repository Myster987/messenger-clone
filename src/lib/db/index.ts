import { SECRET_DATABASE_TOKEN, SECRET_DATABASE_URL } from '$env/static/private';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({ url: SECRET_DATABASE_URL, authToken: SECRET_DATABASE_TOKEN });

export const db = drizzle(client, { schema });

export const createFtsTable = async () => {
	const res = await db.run(
		sql`CREATE VIRTUAL TABLE  users_fts USING fts5 (user_id, user_full_name);`
	);
	console.log(res);

	await db.run(
		sql`CREATE TRIGGER inser_users_fts after INSERT on users begin INSERT INTO users_fts (user_id, user_full_name) VALUES (NEW.id, NEW.full_name); end;`
	);
	await db.run(
		sql`CREATE TRIGGER update_users_fts after UPDATE on users begin UPDATE users_fts SET user_id = NEW.id, user_full_name = NEW.full_name WHERE user_id = NEW.id; end;`
	);
	await db.run(
		sql`CREATE TRIGGER delete_users_fts after DELETE on users begin DELETE FROM users_fts WHERE user_id = OLD.id; end;`
	);
};

// await createFtsTable();
