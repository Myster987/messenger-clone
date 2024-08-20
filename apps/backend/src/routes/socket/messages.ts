import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { generateId } from "../../auth/generate_id";
import {
    editImageMessage,
    editTextMessage,
    insertImageSchema,
    insertMessageSchema,
} from "../../auth/form_schemas";
import {
    deleteImage,
    insertImage,
    insertMessageAsImage,
    insertMessageAsText,
    queryConversationMessagesById,
    queryMessageByIdWithImageAndSender,
    setEmptyMessage,
    updateConversationMemberLastSeenMessage,
    updateConversationMessageAt,
    updateImageMessage,
    updateTextMessage,
} from "../../db/queries";
import { deleteImagesFromCloudinary, uploadImage } from "../../cloudinary";
import {
    deleteMessageById,
    pageQueryParams,
    patchSeenMessage,
} from "../../validation";
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
                            updatedAt: insertedMessage.updatedAt,
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
                            updatedAt: insertedMessage.updatedAt,
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
    )
    .patch(
        "/text/:messageId",
        zValidator("json", editTextMessage),
        async (c) => {
            try {
                const { messageId } = c.req.param();
                const { senderId, newBody } = c.req.valid("json");
                const io = c.get("io");

                const checkIfMessageExists =
                    await queryMessageByIdWithImageAndSender.get({
                        messageId,
                    });

                if (!checkIfMessageExists) {
                    return c.json({ success: false }, 400);
                }

                if (checkIfMessageExists.senderId != senderId) {
                    return c.json({ success: false }, 401);
                }

                const updatedMessage = await updateTextMessage({
                    messageId,
                    body: newBody,
                });

                if (!updatedMessage) {
                    throw Error("Something went wrong when updating message");
                }

                const eventKey = `conversation:${checkIfMessageExists.sender.conversationId}:editedMessages`;

                io.emit(eventKey, {
                    messageId,
                    newBody,
                    imageUrl: null,
                    updatedAt: updatedMessage.updatedAt,
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
    .patch(
        "/image/:messageId",
        zValidator("form", editImageMessage),
        async (c) => {
            try {
                const { messageId } = c.req.param();
                const { senderId, newImage } = c.req.valid("form");
                const io = c.get("io");

                const checkIfMessageExists =
                    await queryMessageByIdWithImageAndSender.get({
                        messageId,
                    });

                if (!checkIfMessageExists) {
                    return c.json({ success: false }, 400);
                }

                if (checkIfMessageExists.senderId != senderId) {
                    return c.json({ success: false }, 401);
                }

                const deletedFromCloudinary = await deleteImagesFromCloudinary([
                    checkIfMessageExists.image?.publicId!,
                ]);

                if (!deletedFromCloudinary) {
                    throw Error(
                        "Something went wrong when deleting image from cloudinary"
                    );
                }

                const uploadData = await uploadImage(newImage);

                const updatedMessage = await updateImageMessage({
                    messageId,
                    imageId: checkIfMessageExists.imageId!,
                    imageUrl: uploadData.secure_url,
                    publicId: uploadData.public_id,
                });

                const eventKey = `conversation:${checkIfMessageExists.sender.conversationId}:editedMessages`;

                io.emit(eventKey, {
                    messageId,
                    newBody: null,
                    imageUrl: uploadData.secure_url,
                    updatedAt: updatedMessage[0].updatedAt,
                });

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
    .delete("/:messageId", zValidator("json", deleteMessageById), async (c) => {
        try {
            const { messageId } = c.req.param();
            const { senderId } = c.req.valid("json");
            const io = c.get("io");

            const checkIfMessageExists =
                await queryMessageByIdWithImageAndSender.get({
                    messageId,
                });

            if (!checkIfMessageExists) {
                return c.json({ success: false }, 400);
            }

            if (checkIfMessageExists.senderId != senderId) {
                return c.json({ success: false }, 401);
            }

            const deleteMessageImage = async (
                imageId: string,
                publicId: string
            ) => {
                const deletedFromCloudinary = await deleteImagesFromCloudinary([
                    publicId,
                ]);

                if (!deletedFromCloudinary) {
                    throw Error(
                        "Something went wrong when deleting image from cloudinary"
                    );
                }

                const imageDeleted = await deleteImage.get({ imageId });

                if (!imageDeleted) {
                    throw Error(
                        "Something went wrong when deleting image from database"
                    );
                }
            };

            if (checkIfMessageExists.image) {
                await deleteMessageImage(
                    checkIfMessageExists.image.id,
                    checkIfMessageExists.image.publicId
                );
            }

            const deletedMessage = await setEmptyMessage.get({ messageId });

            if (!deletedMessage) {
                throw Error("Something went wrong whem deleting messege");
            }

            const eventKey = `conversation:${checkIfMessageExists.sender.conversationId}:deletedMessages`;

            io.emit(eventKey, { messageId });

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
    });
