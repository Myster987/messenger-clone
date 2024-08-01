import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { generateId } from "../../auth/generate_id";
import { insertMessageSchema } from "../../auth/form_schemas";
import {
    insertMessageAsText,
    insertSeenMessage,
    queryConversationMessagesById,
    updateConversationMessageAt,
} from "../../db/queries";
import { pageQueryParams } from "../../validation";
import type { HonoSocketServer } from "../../socket-helpers";

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

                return c.json({
                    success: true,
                    data,
                });
            } catch (error) {
                console.log(c.req.path, error);
                return c.json(
                    {
                        success: false,
                        data: null,
                    },
                    500
                );
            }
        }
    )
    .post(
        "/:conversationId",
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

                const insertedSeenMessage = await insertSeenMessage.get({
                    id: generateId(),
                    memberId: reqBody.senderId,
                    lastSeenMessageId: insertedMessage.id,
                });

                if (!insertedSeenMessage) {
                    throw Error(
                        "Something went wrong when inserting seen message"
                    );
                }

                await updateConversationMessageAt(
                    insertedMessage.createdAt,
                    conversationId
                );

                const conversationKey = `conversation:${conversationId}:messages`;

                io.emit(conversationKey, {
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
    );
