import {
    relations,
    sql,
    type InferInsertModel,
    type InferSelectModel,
} from "drizzle-orm";
import {
    AnySQLiteColumn,
    foreignKey,
    index,
    integer,
    sqliteTable,
    text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: text("id").notNull().primaryKey(),
    createdAt: text("created_at")
        .notNull()
        .default(sql`current_timestamp`),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    fullName: text("full_name").notNull(),
    isOnline: integer("is_online", { mode: "boolean" })
        .notNull()
        .default(false),
});

export const usersRelations = relations(users, ({ one }) => ({
    profileImage: one(profileImages),
}));
export type SelectUsers = InferSelectModel<typeof users>;
export type InsertUsers = InferInsertModel<typeof users>;

export const sessions = sqliteTable("sessions", {
    id: text("id").notNull().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id),
    expiresAt: integer("expires_at").notNull(),
});
export type SelectSessions = InferSelectModel<typeof sessions>;
export type InsertSessions = InferInsertModel<typeof sessions>;

export const profileImages = sqliteTable("profile_images", {
    id: text("id").notNull().primaryKey(),
    createdAt: text("created_at")
        .notNull()
        .default(sql`current_timestamp`),
    imageUrl: text("image_url").notNull(),
    publicId: text("public_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id),
});

export const profileImagesRelations = relations(profileImages, ({ one }) => ({
    user: one(users, {
        fields: [profileImages.userId],
        references: [users.id],
    }),
}));
export type SelectProfileImages = InferSelectModel<typeof profileImages>;
export type InsertProfileImages = InferInsertModel<typeof profileImages>;

export const conversations = sqliteTable("conversations", {
    id: text("id").notNull().primaryKey(),
    createdAt: text("created_at")
        .notNull()
        .default(sql`current_timestamp`),
    latestMessageId: text("latest_message_id").references(
        (): AnySQLiteColumn => messages.id,
        { onDelete: "set null" }
    ),
    name: text("name").notNull(),
    isGroup: integer("is_group", { mode: "boolean" }).notNull(),
    conversationImageId: text("conversation_image_id").references(
        () => conversationImages.id
    ),
});

export const conversationsRelations = relations(
    conversations,
    ({ many, one }) => ({
        members: many(conversationMembers),
        conversationImage: one(conversationImages, {
            fields: [conversations.conversationImageId],
            references: [conversationImages.id],
        }),
        latestMessage: one(messages, {
            fields: [conversations.latestMessageId],
            references: [messages.id],
        }),
    })
);
export type SelectConversations = InferSelectModel<typeof conversations>;
export type InsertConversations = InferInsertModel<typeof conversations>;

export const conversationImages = sqliteTable("conversation_images", {
    id: text("id").notNull().primaryKey(),
    createdAt: text("created_at")
        .notNull()
        .default(sql`current_timestamp`),
    imageUrl: text("image_url").notNull(),
    publicId: text("public_id").notNull(),
});

export const conversationImagesRelations = relations(
    conversationImages,
    ({ one }) => ({
        conversation: one(conversations),
    })
);
export type SelectConversationImages = InferSelectModel<
    typeof conversationImages
>;
export type InsertConversationImages = InferInsertModel<
    typeof conversationImages
>;

export const conversationMembers = sqliteTable(
    "conversation_members",
    {
        id: text("id").notNull().primaryKey(),
        createdAt: text("created_at")
            .notNull()
            .default(sql`current_timestamp`),
        conversationId: text("conversation_id")
            .notNull()
            .references(() => conversations.id, { onDelete: "cascade" }),
        userId: text("user_id")
            .notNull()
            .references(() => users.id),
        nick: text("nick"),
        isAdmin: integer("is_admin", { mode: "boolean" })
            .notNull()
            .default(false),
        currentlyMember: integer("currently_member", { mode: "boolean" })
            .notNull()
            .default(true),
        lastSeenMessageId: text("last_seen_message_id").references(
            (): AnySQLiteColumn => messages.id
        ),
    },
    (table) => {
        return {
            userIdIdx: index("user_id_idx").on(table.userId),
        };
    }
);

export const conversationMembersRelations = relations(
    conversationMembers,
    ({ many, one }) => ({
        messages: many(messages, { relationName: "messagesWrittenByUser" }),
        conversation: one(conversations, {
            fields: [conversationMembers.conversationId],
            references: [conversations.id],
            relationName: "memberConversation",
        }),
        user: one(users, {
            fields: [conversationMembers.userId],
            references: [users.id],
            relationName: "userProfileOfConversationMember",
        }),
        lastSeenMessage: one(messages, {
            fields: [conversationMembers.lastSeenMessageId],
            references: [messages.id],
            relationName: "lastSeenMessageByUser",
        }),
    })
);
export type SelectConversationMembers = InferSelectModel<
    typeof conversationMembers
>;
export type InsertConversationMembers = InferInsertModel<
    typeof conversationMembers
>;

export const messages = sqliteTable("messages", {
    id: text("id").notNull().primaryKey(),
    createdAt: text("created_at")
        .notNull()
        .default(sql`current_timestamp`),
    updatedAt: text("updated_at")
        .notNull()
        .default(sql`current_timestamp`),
    senderId: text("sender_id")
        .notNull()
        .references(() => conversationMembers.id),
    type: text("type").notNull().default("message"),
    body: text("body"),
    imageId: text("image_id").references(() => images.id, {
        onDelete: "set null",
    }),
});

export const messagesRelations = relations(messages, ({ one, many }) => ({
    sender: one(conversationMembers, {
        fields: [messages.senderId],
        references: [conversationMembers.id],
        relationName: "sendByMember",
    }),
    image: one(images, {
        fields: [messages.imageId],
        references: [images.id],
    }),
    seenBy: many(conversationMembers, { relationName: "seenByMembers" }),
}));
export type SelectMessages = InferSelectModel<typeof messages>;
export type InsertMessages = InferInsertModel<typeof messages>;

export const images = sqliteTable("images", {
    id: text("id").notNull().primaryKey(),
    createdAt: text("created_at")
        .notNull()
        .default(sql`current_timestamp`),
    imageUrl: text("image_url").notNull(),
    publicId: text("public_id").notNull(),
});
export type SelectImages = InferSelectModel<typeof images>;
export type InsertImages = InferInsertModel<typeof images>;
