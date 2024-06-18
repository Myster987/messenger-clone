import { eq, sql } from 'drizzle-orm';
import { db } from '.';
import * as schema from './schema';

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
		profileImageId: sql.placeholder('profileImageId')
	})
	.onConflictDoNothing()
	.returning()
	.prepare();

export const insertProfileImage = db
	.insert(schema.profileImages)
	.values({
		id: sql.placeholder('id'),
		imageUrl: sql.placeholder('imageUrl'),
		publicId: sql.placeholder('publicId')
	})
	.returning()
	.prepare();

export const queryUserProfileImageById = db.query.users
	.findFirst({
		where: eq(schema.users.id, sql.placeholder('userId')),
		with: {
			profileImage: true
		}
	})
	.prepare();
