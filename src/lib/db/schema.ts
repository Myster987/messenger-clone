import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const users = sqliteTable("user", {
	id: text("id").notNull().primaryKey(),
	createdAt: text("created_at").notNull().default(sql`current_timestamp`),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	fullName: text("full_name").notNull(),
	profileImageId: text("profile_image_id").notNull().references(() => profileImages.id, { onDelete: "cascade"}),
});

export const sessions = sqliteTable("session", {
	id: text("id").notNull().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id),
	expiresAt: integer("expires_at").notNull()
});

export const profileImages = sqliteTable("profile_images", {
	id: text("id").notNull().primaryKey(),
	createdAt: text("created_at").notNull().default(sql`current_timestamp`),
	imageUrl: text("image_url").notNull(),
	publicId: text("public_id").notNull()
})
