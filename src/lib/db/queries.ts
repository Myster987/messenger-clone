import { eq, sql } from "drizzle-orm";
import { db } from ".";
import * as schema from "./schema";

export const checkIfUserExists = db
	.select()
	.from(schema.users)
	.where(eq(schema.users.email, sql.placeholder('email')))
	.prepare();

    export const insertUser = db
	.insert(schema.users)
	.values({
		id: sql.placeholder('id'),
		email: sql.placeholder('email'),
		password: sql.placeholder('password'),
        fullName: sql.placeholder('fullName'),
        profileImageId: sql.placeholder('profileImageId'),
	})
	.onConflictDoNothing()
	.prepare();