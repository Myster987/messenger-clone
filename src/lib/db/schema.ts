import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";


export const users = pgTable('users', {
	id: varchar('id', { length: 20 }).notNull().primaryKey(),
	createdAt: timestamp('created_at').defaultNow(),
	email: varchar('email', { length: 64 }).notNull().unique(),
	password: varchar('password', { length: 128}).notNull()
});
                                                               
export const sessions = pgTable('sessions', {
	id: varchar('id', { length: 20 }).notNull().primaryKey(),
	userId: varchar('user_id', { length: 20})
		.notNull()
		.references(() => users.id),
    expiresAt: timestamp("expires_at", {
            withTimezone: true,
            mode: "date"
        }).notNull()
});