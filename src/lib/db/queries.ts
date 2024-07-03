import { desc, eq, sql } from 'drizzle-orm';
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
		profileImageId: sql.placeholder('profileImageId'),
		isOnline: sql.placeholder('isOnline')
	})
	.onConflictDoNothing()
	.returning()
	.prepare();

export const updateUserStatusToOfflineById = db
	.update(schema.users)
	.set({
		isOnline: false
	})
	.where(eq(schema.users.id, sql.placeholder('userId')))
	.prepare();

export const updateUserStatusToOnlineById = db
	.update(schema.users)
	.set({
		isOnline: true
	})
	.where(eq(schema.users.id, sql.placeholder('userId')))
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

export const queryUserByIdWithProfileImage = db.query.users
	.findFirst({
		where: eq(schema.users.id, sql.placeholder('userId')),
		with: {
			profileImage: true
		}
	})
	.prepare();

export const queryUserByIdWithProfileImageWithoutPassword = db.query.users
	.findFirst({
		where: eq(schema.users.id, sql.placeholder('userId')),
		with: {
			profileImage: true
		},
		columns: {
			password: false
		}
	})
	.prepare();

export const minimalQueryUserByIdWithProfileImage = db.query.users
	.findFirst({
		where: eq(schema.users.id, sql.placeholder('userId')),
		with: {
			profileImage: {
				columns: {
					imageUrl: true
				}
			}
		},
		columns: {
			id: true,
			fullName: true
		}
	})
	.prepare();

export const queryUserConversations = db.query.conversations
	.findMany({
		with: {
			members: {
				where: eq(schema.conversationMembers.userId, sql.placeholder('userId')),
				limit: 0
			},
			conversationImages: true
		},
		orderBy: [desc(schema.conversations.lastMessageAt)],
		limit: sql.placeholder('limit'),
		offset: sql.placeholder('offset')
	})
	.prepare();

export const queryUsersByName = async (fullName: string, limit = 15, offset = 0) => {
	const res = await db.run(
		sql`SELECT users.id, users.full_name, users.profile_image_id  FROM users INNER JOIN users_fts ON users_fts.user_id = users.id WHERE users_fts MATCH 'user_full_name:' || ${fullName} ORDER BY rank LIMIT ${limit} OFFSET ${offset}`
	);
	const data = await Promise.all(
		res.rows.map((val) => minimalQueryUserByIdWithProfileImage.get({ userId: val.id }))
	);
	return data as {
		id: string;
		fullName: string;
		profileImage: {
			imageUrl: string;
		};
	}[];
};
