import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from ".";
import * as schema from "./schema";

export const checkIfUserExists = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, sql.placeholder("email")))
    .prepare();

export const checkIfPossibleToCreateChat = db
    .select()
    .from(schema.conversationMembers)
    .where(
        and(
            eq(
                schema.conversationMembers.userId,
                sql.placeholder("firstUserId")
            ),
            eq(
                schema.conversationMembers.userId,
                sql.placeholder("secondUserId")
            )
        )
    )
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
            latestMessage: true,
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
        where: and(
            eq(schema.conversationMembers.userId, sql.placeholder("userId")),
            eq(schema.conversationMembers.currentlyMember, true)
        ),
        columns: {},
        with: {
            conversation: {
                with: {
                    conversationImage: true,
                    latestMessage: true,
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

export const updateConversation = (
    conversationId: string,
    newData: Partial<{ name: string; conversationImageId: string }>
) =>
    db
        .update(schema.conversations)
        .set(newData)
        .where(eq(schema.conversations.id, conversationId))
        .returning()
        .get();

export const updateConversationLatestMessage = (
    conversationId: string,
    messageId: string
) =>
    db
        .update(schema.conversations)
        .set({ latestMessageId: messageId })
        .where(eq(schema.conversations.id, conversationId))
        .returning()
        .get();

export const checkIfUserInConversation = db
    .select()
    .from(schema.conversationMembers)
    .where(
        and(
            eq(
                schema.conversationMembers.conversationId,
                sql.placeholder("conversationId")
            ),
            eq(schema.conversationMembers.userId, sql.placeholder("userId"))
        )
    )
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

export const insertConversationMemberAsAdmin = db
    .insert(schema.conversationMembers)
    .values({
        id: sql.placeholder("id"),
        conversationId: sql.placeholder("conversationId"),
        userId: sql.placeholder("userId"),
        isAdmin: true,
    })
    .returning()
    .prepare();

export const updateIsCurrentMember = ({
    memberId,
    isCurrentMember,
}: {
    memberId: string;
    isCurrentMember: boolean;
}) =>
    db
        .update(schema.conversationMembers)
        .set({ currentlyMember: isCurrentMember })
        .where(eq(schema.conversationMembers.id, memberId))
        .returning()
        .get();

export const updateConversationMemberNick = ({
    memberId,
    newNick,
}: {
    memberId: string;
    newNick: string;
}) =>
    db
        .update(schema.conversationMembers)
        .set({
            nick: newNick,
        })
        .where(eq(schema.conversationMembers.id, memberId))
        .returning()
        .get();

export const queryConversationWithImage = db.query.conversations
    .findFirst({
        where: eq(schema.conversations.id, sql.placeholder("conversationId")),
        with: { conversationImage: true },
    })
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

export const updateConversationImage = ({
    imageId,
    imageUrl,
    publicId,
}: {
    imageId: string;
    imageUrl: string;
    publicId: string;
}) =>
    db
        .update(schema.conversationImages)
        .set({
            imageUrl,
            publicId,
        })
        .where(eq(schema.conversationImages.id, imageId))
        .returning()
        .get();

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

export const queryMessageByIdWithImageAndSender = db.query.messages
    .findFirst({
        where: eq(schema.messages.id, sql.placeholder("messageId")),
        with: {
            image: true,
            sender: true,
        },
    })
    .prepare();

export const queryMemberById = db.query.conversationMembers
    .findFirst({
        where: eq(schema.conversationMembers.id, sql.placeholder("memberId")),
        with: {
            user: true,
        },
    })
    .prepare();

export const queryMemberByUserId = db.query.conversationMembers
    .findFirst({
        where: eq(schema.conversationMembers.userId, sql.placeholder("userId")),
        with: {
            user: {
                with: {
                    profileImage: true,
                },
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
    })
    .returning()
    .prepare();

export const insertMessageWithType = db
    .insert(schema.messages)
    .values({
        id: sql.placeholder("id"),
        senderId: sql.placeholder("senderId"),
        type: sql.placeholder("type"),
        body: sql.placeholder("body"),
    })
    .returning()
    .prepare();

export const insertImage = db
    .insert(schema.images)
    .values({
        id: sql.placeholder("id"),
        imageUrl: sql.placeholder("imageUrl"),
        publicId: sql.placeholder("publicId"),
    })
    .returning()
    .prepare();

export const insertMessageAsImage = db
    .insert(schema.messages)
    .values({
        id: sql.placeholder("id"),
        senderId: sql.placeholder("senderId"),
        imageId: sql.placeholder("imageId"),
    })
    .returning()
    .prepare();

export const setEmptyMessage = db
    .update(schema.messages)
    .set({
        body: null,
        imageId: null,
    })
    .where(eq(schema.messages.id, sql.placeholder("messageId")))
    .returning()
    .prepare();

export const deleteImage = db
    .delete(schema.images)
    .where(eq(schema.images.id, sql.placeholder("imageId")))
    .returning()
    .prepare();

export const updateMessageUpdatedAtToNow = db
    .update(schema.messages)
    .set({ updatedAt: sql`current_timestamp` })
    .where(eq(schema.messages.id, sql.placeholder("messageId")))
    .returning()
    .prepare();

export const updateTextMessage = ({
    body,
    messageId,
}: {
    body: string;
    messageId: string;
}) =>
    db
        .update(schema.messages)
        .set({ body, updatedAt: sql`current_timestamp` })
        .where(eq(schema.messages.id, messageId))
        .returning()
        .get();

export const updateImageMessage = ({
    messageId,
    imageId,
    publicId,
    imageUrl,
}: {
    messageId: string;
    imageId: string;
    publicId: string;
    imageUrl: string;
}) =>
    Promise.all([
        updateMessageUpdatedAtToNow.get({ messageId }),
        db
            .update(schema.images)
            .set({ imageUrl, publicId })
            .where(eq(schema.images.id, imageId))
            .returning()
            .get(),
    ]);

export const updateConversationMemberLastSeenMessage = ({
    lastSeenMessageId,
    memberId,
}: {
    lastSeenMessageId: string;
    memberId: string;
}) =>
    db
        .update(schema.conversationMembers)
        .set({
            lastSeenMessageId,
        })
        .where(eq(schema.conversationMembers.id, memberId))
        .returning();

export const queryConversationMessagesById = db
    .select({
        message: {
            id: schema.messages.id,
            createdAt: schema.messages.createdAt,
            updatedAt: schema.messages.updatedAt,
            senderId: schema.messages.senderId,
            type: schema.messages.type,
            body: schema.messages.body,
            imageId: schema.messages.imageId,
            imageUrl: sql<string>`(select "image_url" from "images" where "messages"."image_id" = "images"."id") as "imageUrl"`,
        },
        conversationMember: schema.conversationMembers,
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
