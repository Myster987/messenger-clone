import { SECRET_DATABASE_TOKEN, SECRET_DATABASE_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const client = createClient({ url: SECRET_DATABASE_URL, authToken: SECRET_DATABASE_TOKEN });

export const db = drizzle(client);