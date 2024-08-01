import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from ".";
import * as schema from "db/schema";

export const checkIfUserExists = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, sql.placeholder("email")))
    .prepare();

export const insertUser = db
    .insert(schema.users)
    .values({
        id: sql.placeholder("id"),
        email: sql.placeholder("email"),
        password: sql.placeholder("password"),
        fullName: sql.placeholder("fullName"),
        isOnline: sql.placeholder("isOnline"),
    })
    .onConflictDoNothing()
    .returning()
    .prepare();

export const updateUserStatusToOfflineById = db
    .update(schema.users)
    .set({
        isOnline: false,
    })
    .where(eq(schema.users.id, sql.placeholder("userId")))
    .prepare();

export const updateUserStatusToOnlineById = db
    .update(schema.users)
    .set({
        isOnline: true,
    })
    .where(eq(schema.users.id, sql.placeholder("userId")))
    .prepare();

export const insertProfileImage = db
    .insert(schema.profileImages)
    .values({
        id: sql.placeholder("id"),
        imageUrl: sql.placeholder("imageUrl"),
        publicId: sql.placeholder("publicId"),
        userId: sql.placeholder("userId"),
    })
    .returning()
    .prepare();

export const queryUserById = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, sql.placeholder("userId")))
    .prepare();

export const queryUserByIdWithProfileImage = db.query.users
    .findFirst({
        where: eq(schema.users.id, sql.placeholder("userId")),
        with: {
            profileImage: true,
        },
    })
    .prepare();

export const queryUserByIdWithProfileImageWithoutPassword = db.query.users
    .findFirst({
        where: eq(schema.users.id, sql.placeholder("userId")),
        with: {
            profileImage: true,
        },
        columns: {
            password: false,
        },
    })
    .prepare();

export const minimalQueryUserByIdWithProfileImage = db.query.users
    .findFirst({
        where: eq(schema.users.id, sql.placeholder("userId")),
        with: {
            profileImage: {
                columns: {
                    imageUrl: true,
                },
            },
        },
        columns: {
            id: true,
            fullName: true,
        },
    })
    .prepare();

export const queryConversationById = db.query.conversations
    .findFirst({
        where: eq(schema.conversations.id, sql.placeholder("conversationId")),
        with: {
            conversationImage: true,
            members: {
                with: {
                    user: {
                        with: {
                            profileImage: {
                                columns: {
                                    userId: true,
                                    imageUrl: true,
                                },
                            },
                        },
                        columns: {
                            password: false,
                        },
                    },
                },
            },
        },
    })
    .prepare();

export const queryUserConversations = db.query.conversationMembers
    .findMany({
        where: eq(schema.conversationMembers.userId, sql.placeholder("userId")),
        columns: {},
        with: {
            conversation: {
                with: {
                    conversationImage: true,
                    members: {
                        with: {
                            user: {
                                with: {
                                    profileImage: {
                                        columns: {
                                            userId: true,
                                            imageUrl: true,
                                        },
                                    },
                                },
                                columns: { isOnline: true, fullName: true },
                            },
                        },
                    },
                },
            },
        },
        limit: sql.placeholder("limit"),
        offset: sql.placeholder("offset"),
    })
    .prepare();

export const queryUsersByName = async (
    fullName: string,
    limit = 15,
    offset = 0
) => {
    const res = await db.run(
        sql`SELECT users.id FROM users INNER JOIN users_fts ON users_fts.user_id = users.id WHERE users_fts MATCH 'user_full_name:' || ${fullName} ORDER BY rank LIMIT ${limit} OFFSET ${offset}`
    );
    const data = await Promise.all(
        res.rows.map((val) =>
            minimalQueryUserByIdWithProfileImage.get({ userId: val.id })
        )
    );
    return data as {
        id: string;
        fullName: string;
        profileImage: {
            imageUrl: string;
        };
    }[];
};

export const deleteUserProfileImage = db
    .delete(schema.profileImages)
    .where(eq(schema.profileImages.userId, sql.placeholder("userId")))
    .returning()
    .prepare();

export const insertConversationAsChat = db
    .insert(schema.conversations)
    .values({
        id: sql.placeholder("id"),
        name: sql.placeholder("name"),
        isGroup: false,
    })
    .returning()
    .prepare();

export const insertConversationAsGroup = db
    .insert(schema.conversations)
    .values({
        id: sql.placeholder("id"),
        name: sql.placeholder("name"),
        isGroup: true,
    })
    .returning()
    .prepare();

export const insertConversationMember = db
    .insert(schema.conversationMembers)
    .values({
        id: sql.placeholder("id"),
        conversationId: sql.placeholder("conversationId"),
        userId: sql.placeholder("userId"),
    })
    .returning()
    .prepare();

export const insertConversationImage = db
    .insert(schema.conversationImages)
    .values({
        id: sql.placeholder("id"),
        imageUrl: sql.placeholder("imageUrl"),
        publicId: sql.placeholder("publicId"),
    })
    .returning()
    .prepare();

export const checkIfConversationExists = db.query.conversations
    .findFirst({
        with: {
            members: {
                where: inArray(
                    schema.conversationMembers.userId,
                    sql`${sql.placeholder("usersId")}`
                ),
            },
        },
    })
    .prepare();

export const insertMessageAsText = db
    .insert(schema.messages)
    .values({
        id: sql.placeholder("id"),
        senderId: sql.placeholder("senderId"),
        body: sql.placeholder("body"),
        imageId: null,
    })
    .returning()
    .prepare();

export const insertSeenMessage = db
    .insert(schema.seenMessages)
    .values({
        id: sql.placeholder("id"),
        memberId: sql.placeholder("memberId"),
        lastSeenMessageId: sql.placeholder("lastSeenMessageId"),
    })
    .returning()
    .prepare();

export const updateConversationMessageAt = (
    lastMessageAt: string,
    conversationId: string
) =>
    db
        .update(schema.conversations)
        .set({ lastMessageAt })
        .where(eq(schema.conversations.id, conversationId));

export const queryConversationMessagesById = db
    .select({
        message: {
            id: schema.messages.id,
            createdAt: schema.messages.createdAt,
            senderId: schema.messages.senderId,
            body: schema.messages.body,
            imageId: schema.messages.imageId,
        },
        conversationMember: {
            id: schema.conversationMembers.id,
            userId: schema.conversationMembers.userId,
            nick: schema.conversationMembers.nick,
        },
        seenBy: sql<
            { id: string; memberId: string; lastSeenMessageId: string }[]
        >`(select json_array("id", "member_id", "last_seen_message_id") as "data" from (select * from "seen_messages" where "seen_messages"."last_seen_message_id" = "messages"."id")) as "seenBy"`.mapWith(
            (val) => {
                const data: string[] = JSON.parse(val);
                const res: {
                    id: string;
                    memberId: string;
                    lastSeenMessageId: string;
                }[] = [];
                for (let i = 0; i < data.length; i += 3) {
                    res.push({
                        id: data[i],
                        memberId: data[i + 1],
                        lastSeenMessageId: data[i + 2],
                    });
                }
                return res;
            }
        ),
    })
    .from(schema.messages)
    .innerJoin(
        schema.conversationMembers,
        eq(schema.conversationMembers.id, schema.messages.senderId)
    )
    .where(
        eq(
            schema.conversationMembers.conversationId,
            sql.placeholder("conversationId")
        )
    )
    .orderBy(desc(schema.messages.createdAt))
    .limit(sql.placeholder("limit"))
    .offset(sql.placeholder("offset"))
    .prepare();
