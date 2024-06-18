import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').notNull().primaryKey(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`current_timestamp`),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	fullName: text('full_name').notNull(),
	profileImageId: text('profile_image_id')
		.notNull()
		.references(() => profileImages.id, { onDelete: 'cascade' })
});

export const usersRelations = relations(users, ({ one }) => ({
	profileImage: one(profileImages, {
		fields: [users.profileImageId],
		references: [profileImages.id]
	})
}));

export const sessions = sqliteTable('sessions', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at').notNull()
});

export const profileImages = sqliteTable('profile_images', {
	id: text('id').notNull().primaryKey(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`current_timestamp`),
	imageUrl: text('image_url').notNull(),
	publicId: text('public_id').notNull()
});

export const profileImagesRelations = relations(profileImages, ({ one }) => ({
	user: one(users, {
		fields: [profileImages.id],
		references: [users.profileImageId]
	})
}));
