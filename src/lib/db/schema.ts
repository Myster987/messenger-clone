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
		.references(() => profileImages.id)
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

export const conversations = sqliteTable('conversations', {
	id: text('id').notNull().primaryKey(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`current_timestamp`),
	lastMessageAt: text('last_message_at')
		.notNull()
		.default(sql`current_timestamp`),
	name: text('name').notNull(),
	isGroup: integer('is_group', { mode: 'boolean' }),
	conversationImageId: text('conversation_image_id')
		.notNull()
		.references(() => conversationImages.id)
});

export const conversationsRelations = relations(conversations, ({ many, one }) => ({
	members: many(conversationMembers),
	conversationImage: one(conversationImages, {
		fields: [conversations.conversationImageId],
		references: [conversationImages.id]
	})
}));

export const conversationImages = sqliteTable('conversation_images', {
	id: text('id').notNull().primaryKey(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`current_timestamp`),
	imageUrl: text('image_url').notNull(),
	publicId: text('public_id').notNull()
});

export const conversationMembers = sqliteTable('conversation_members', {
	id: text('id').notNull().primaryKey(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`current_timestamp`),
	conversationId: text('conversation_id')
		.notNull()
		.references(() => conversations.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	nick: text('nick').notNull()
});

export const conversationMembersRelations = relations(conversationMembers, ({ many, one }) => ({
	messages: many(messages),
	conversation: one(conversations, {
		fields: [conversationMembers.conversationId],
		references: [conversations.id]
	}),
	user: one(users, {
		fields: [conversationMembers.userId],
		references: [users.id]
	})
}));

export const messages = sqliteTable('messages', {
	id: text('id').notNull().primaryKey(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`current_timestamp`),
	senderId: text('sender_id')
		.notNull()
		.references(() => conversationMembers.id),
	body: text('body'),
	imageId: text('image_id').references(() => images.id)
});

export const messagesRelations = relations(messages, ({ one }) => ({
	sender: one(conversationMembers, {
		fields: [messages.senderId],
		references: [conversationMembers.id]
	}),
	image: one(images, {
		fields: [messages.imageId],
		references: [images.id]
	})
}));

export const seenMessages = sqliteTable('seen_messages', {
	id: text('id').notNull().primaryKey(),
	memberId: text('member_id')
		.notNull()
		.references(() => conversationMembers.id),
	conversationId: text('conversation_id')
		.notNull()
		.references(() => conversations.id),
	lastSeenMessageId: text('last_seen_message_id').references(() => messages.id)
});

export const seenMessagesRelations = relations(seenMessages, ({ one }) => ({
	viewer: one(conversationMembers, {
		fields: [seenMessages.memberId],
		references: [conversationMembers.id]
	}),
	conversation: one(conversations, {
		fields: [seenMessages.conversationId],
		references: [conversations.id]
	}),
	lastSeenMessage: one(messages, {
		fields: [seenMessages.lastSeenMessageId],
		references: [messages.id]
	})
}));

export const images = sqliteTable('images', {
	id: text('id').notNull().primaryKey(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`current_timestamp`),
	imageUrl: text('image_url').notNull(),
	publicId: text('public_id').notNull()
});
