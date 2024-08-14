import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { generateId } from "../../auth/generate_id";
import {
    insertImageSchema,
    insertMessageSchema,
} from "../../auth/form_schemas";
import {
    insertImage,
    insertMessageAsImage,
    insertMessageAsText,
    queryConversationMessagesById,
    updateConversationMemberLastSeenMessage,
    updateConversationMessageAt,
} from "../../db/queries";
import { uploadImage } from "../../cloudinary";
import { pageQueryParams, patchSeenMessage } from "../../validation";
import type { HonoSocketServer } from "../../socket-helpers";

export const messagesRoute = new Hono<{ Variables: HonoSocketServer }>()
    .get(
        "/:conversationId",
        zValidator("query", pageQueryParams()),
        async (c) => {
            try {
                const { conversationId } = c.req.param();
                const { page } = c.req.valid("query");

                const limit = 25;
                const offset = page * limit;

                const data = await queryConversationMessagesById.all({
                    conversationId,
                    limit,
                    offset,
                });

                let nextPage: null | number = null;

                if (data.length == limit) {
                    nextPage = page + 1;
                }

                return c.json({
                    success: true,
                    data,
                    nextPage,
                });
            } catch (error) {
                console.log(c.req.path, error);
                return c.json(
                    {
                        success: false,
                        data: null,
                        nextPage: null,
                    },
                    500
                );
            }
        }
    )
    .patch(
        "/seen_message/:conversationId",
        zValidator("json", patchSeenMessage),
        async (c) => {
            try {
                const io = c.get("io");
                const { conversationId } = c.req.param();
                const reqBody = c.req.valid("json");

                await updateConversationMemberLastSeenMessage(reqBody);

                const socketKey = `conversation:${conversationId}:seenMessage`;

                io.emit(socketKey, reqBody);

                return c.json({ success: true });
            } catch (error) {
                console.log(c.req.path, error);
                return c.json(
                    {
                        success: false,
                    },
                    500
                );
            }
        }
    )
    .post(
        "/text/:conversationId",
        zValidator("form", insertMessageSchema),
        async (c) => {
            try {
                const io = c.get("io");
                const reqBody = c.req.valid("form");
                const { conversationId } = c.req.param();

                const insertedMessage = await insertMessageAsText.get({
                    id: generateId(),
                    senderId: reqBody.senderId,
                    body: reqBody.body,
                });

                if (!insertedMessage) {
                    throw Error("Something went wrong when inserting message");
                }

                const updatedMemberData =
                    await updateConversationMemberLastSeenMessage({
                        lastSeenMessageId: insertedMessage.id,
                        memberId: insertedMessage.senderId,
                    });

                const memberData = updatedMemberData[0];

                await updateConversationMessageAt({
                    lastMessageAt: insertedMessage.createdAt,
                    conversationId,
                });

                const conversationKey = `conversation:${conversationId}:messages`;

                io.emit(conversationKey, {
                    type: "message",
                    body: {
                        message: {
                            id: insertedMessage.id,
                            createdAt: insertedMessage.createdAt,
                            senderId: reqBody.senderId,
                            body: insertedMessage.body,
                            imageId: null,
                            imageUrl: null,
                        },
                        conversationMember: {
                            id: reqBody.senderId,
                            conversationId,
                            userId: memberData.userId,
                            nick: memberData.nick,
                            lastSeenMessageId: memberData.lastSeenMessageId,
                        },
                    },
                });

                return c.json({
                    success: true,
                });
            } catch (error) {
                console.log(c.req.path, error);
                return c.json(
                    {
                        success: false,
                    },
                    500
                );
            }
        }
    )
    .post(
        "/image/:conversationId",
        zValidator("form", insertImageSchema),
        async (c) => {
            try {
                const io = c.get("io");
                const reqBody = c.req.valid("form");
                const { conversationId } = c.req.param();

                const uploadData = await uploadImage(reqBody.image);

                if (uploadData.http_code >= 400) {
                    throw Error(
                        "Something went wrong when uploading message image"
                    );
                }

                const insertedImage = await insertImage.get({
                    id: generateId(),
                    imageUrl: uploadData.secure_url,
                    publicId: uploadData.public_id,
                });

                const insertedMessage = await insertMessageAsImage.get({
                    id: generateId(),
                    senderId: reqBody.senderId,
                    imageId: insertedImage.id,
                });

                if (!insertedMessage) {
                    throw Error("Something went wrong when inserting message");
                }

                const updatedMemberData =
                    await updateConversationMemberLastSeenMessage({
                        lastSeenMessageId: insertedMessage.id,
                        memberId: insertedMessage.senderId,
                    });

                const memberData = updatedMemberData[0];

                await updateConversationMessageAt({
                    lastMessageAt: insertedMessage.createdAt,
                    conversationId,
                });

                const conversationKey = `conversation:${conversationId}:messages`;

                io.emit(conversationKey, {
                    type: "image",
                    body: {
                        message: {
                            id: insertedMessage.id,
                            createdAt: insertedMessage.createdAt,
                            senderId: reqBody.senderId,
                            body: null,
                            imageId: insertedImage.id,
                            imageUrl: insertedImage.imageUrl,
                        },
                        conversationMember: {
                            id: reqBody.senderId,
                            conversationId,
                            userId: memberData.userId,
                            nick: memberData.nick,
                            lastSeenMessageId: memberData.lastSeenMessageId,
                        },
                    },
                });

                return c.json({
                    success: true,
                });
            } catch (error) {
                console.log(c.req.path, error);
                return c.json(
                    {
                        success: false,
                    },
                    500
                );
            }
        }
    );
