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
import { pageQueryParams } from "../../validation";
import type { HonoSocketServer } from "../../socket-helpers";
import { uploadImage } from "../../cloudinary";

export const messagesRoute = new Hono<{ Variables: HonoSocketServer }>()
    .get(
        "/:conversationId",
        zValidator("query", pageQueryParams()),
        async (c) => {
            try {
                const { conversationId } = c.req.param();
                const { page } = c.req.valid("query");

                const limit = 10;
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

                await updateConversationMemberLastSeenMessage({
                    lastSeenMessageId: insertedMessage.id,
                    memberId: insertedMessage.senderId,
                });

                await updateConversationMessageAt({
                    lastMessageAt: insertedMessage.createdAt,
                    conversationId,
                });

                const conversationKey = `conversation:${conversationId}:messages`;

                io.emit(conversationKey, {
                    type: "message",
                    message: reqBody.body,
                    senderId: reqBody.senderId,
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

                const insetedImage = await insertImage.get({
                    id: generateId(),
                    imageUrl: uploadData.secure_url,
                    publicId: uploadData.public_id,
                });

                const insertedMessage = await insertMessageAsImage.get({
                    id: generateId(),
                    senderId: reqBody.senderId,
                    imageId: insetedImage.id,
                });

                if (!insertedMessage) {
                    throw Error("Something went wrong when inserting message");
                }

                await updateConversationMemberLastSeenMessage({
                    lastSeenMessageId: insertedMessage.id,
                    memberId: insertedMessage.senderId,
                });

                await updateConversationMessageAt({
                    lastMessageAt: insertedMessage.createdAt,
                    conversationId,
                });

                const conversationKey = `conversation:${conversationId}:messages`;

                io.emit(conversationKey, {
                    type: "image",
                    imageUrl: insetedImage.imageUrl,
                    senderId: reqBody.senderId,
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
