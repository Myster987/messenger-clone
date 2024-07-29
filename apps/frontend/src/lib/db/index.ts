import { SECRET_DATABASE_TOKEN, SECRET_DATABASE_URL } from '$env/static/private';
import { createDbClient } from 'db';

export const db = createDbClient(SECRET_DATABASE_URL, SECRET_DATABASE_TOKEN);
