import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { deleteImagesFromCloudinary, uploadImage } from "../cloudinary";
import { pageQueryParams, postNewConversation } from "../validation";
import {
    checkIfPossibleToCreateChat,
    insertConversationAsChat,
    insertConversationAsGroup,
    insertConversationImage,
    insertConversationMember,
    insertMessageWithType,
    queryConversationById,
    queryConversationWithImage,
    queryMemberById,
    queryUserByIdWithProfileImageWithoutPassword,
    queryUserConversations,
    updateConversation,
    updateConversationImage,
    updateConversationLatestMessage,
} from "../db/queries";
import { SelectConversationImages } from "db/schema";
import { generateId } from "../auth/generate_id";
import {
    createGroupSchema,
    editConversationImage,
    editConversationName,
} from "../auth/form_schemas";
import type { HonoSocketServer } from "../socket-helpers";

export const conversationsRoute = new Hono<{ Variables: HonoSocketServer }>()
    .get("/by_id/:conversationId", async (c) => {
        try {
            const { conversationId } = c.req.param();

            const data = await queryConversationById.get({ conversationId });

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
    })
    .get(
        "user/:userId",
        zValidator("query", pageQueryParams(0), (result, c) => {
            if (!result.success) {
                return c.json(
                    {
                        success: false,
                    },
                    400
                );
            }
        }),
        async (c) => {
            try {
                const { userId } = c.req.param();
                const { page } = c.req.valid("query");

                const limit = 25;
                const offset = page * limit;

                const data = await queryUserConversations.all({
                    userId,
                    limit,
                    offset,
                });

                return c.json({
                    succcess: true,
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
    .post("/chat", zValidator("json", postNewConversation), async (c) => {
        try {
            const body = c.req.valid("json");
            const io = c.get("io");
            const exists = await checkIfPossibleToCreateChat.all(body);

            if (exists.length != 0) {
                return c.json(
                    {
                        success: false,
                    },
                    400
                );
            }

            const conversationInsertion = await insertConversationAsChat.get({
                id: generateId(),
                name: `${body.firstUserId}-${body.secondUserId}`,
            });

            if (!conversationInsertion) {
                throw Error("Something went wrong when inserting conversation");
            }

            const usersData = await Promise.all(
                Object.values(body).map((val) =>
                    queryUserByIdWithProfileImageWithoutPassword.get({
                        userId: val,
                    })
                )
            );

            const membersInsertion = await Promise.all(
                usersData.map((user) =>
                    insertConversationMember.get({
                        id: generateId(),
                        conversationId: conversationInsertion.id,
                        userId: user?.id,
                        isAdmin: false,
                    })
                )
            );

            if (membersInsertion.length == 0) {
                throw Error("Something went wrong when inserting conversation");
            }

            const eventKeys = membersInsertion.map(
                (m) => `user:${m.userId}:newConversation`
            );

            eventKeys.forEach((eventKey) => {
                io.emit(eventKey, {
                    conversation: {
                        ...conversationInsertion,
                        members: membersInsertion.map((m) => {
                            const user = usersData.find(
                                (u) => u?.id == m.userId
                            );
                            return {
                                ...m,
                                user: {
                                    fullName: user?.fullName,
                                    isOnline: user?.isOnline,
                                    profileImage: {
                                        userId: user?.id,
                                        imageUrl: user?.profileImage?.imageUrl,
                                    },
                                },
                            };
                        }),
                        conversationImage: null,
                    },
                });
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
    })
    .post("/group", zValidator("json", createGroupSchema), async (c) => {
        try {
            const reqBody = c.req.valid("json");
            const io = c.get("io");

            const conversationInsertion = await insertConversationAsGroup.get({
                id: generateId(),
                name: reqBody.groupName,
            });

            if (!conversationInsertion) {
                throw Error("Something went wrong when inserting conversation");
            }

            const usersData = await Promise.all(
                [...reqBody.userIds, reqBody.creatorId].map((userId) =>
                    queryUserByIdWithProfileImageWithoutPassword.get({ userId })
                )
            );

            const membersInsertion = await Promise.all(
                usersData.map((user) =>
                    insertConversationMember.get({
                        id: generateId(),
                        conversationId: conversationInsertion.id,
                        userId: user?.id,
                        isAdmin: user?.id == reqBody.creatorId,
                    })
                )
            );

            if (membersInsertion.length == 0) {
                throw Error("Something went wrong when inserting conversation");
            }

            const eventKeys = membersInsertion.map(
                (m) => `user:${m.userId}:newConversation`
            );

            eventKeys.forEach((eventKey) => {
                io.emit(eventKey, {
                    conversation: {
                        ...conversationInsertion,
                        members: membersInsertion.map((m) => {
                            const user = usersData.find(
                                (u) => u?.id == m.userId
                            );
                            return {
                                ...m,
                                user: {
                                    fullName: user?.fullName,
                                    isOnline: user?.isOnline,
                                    profileImage: {
                                        userId: user?.id,
                                        imageUrl: user?.profileImage?.imageUrl,
                                    },
                                },
                            };
                        }),
                        conversationImage: null,
                    },
                });
            });

            return c.json({
                success: true,
                conversationId: conversationInsertion.id,
            });
        } catch (error) {
            console.log(c.req.path, error);
            return c.json(
                {
                    success: false,
                    conversationId: null,
                },
                500
            );
        }
    })
    .patch(
        "/group/name/:conversationId",
        zValidator("json", editConversationName),
        async (c) => {
            try {
                const { conversationId } = c.req.param();
                const reqBody = c.req.valid("json");
                const io = c.get("io");

                const conversationData = await queryConversationWithImage.get({
                    conversationId,
                });

                if (reqBody.newName != conversationData?.name) {
                    await updateConversation(conversationId, {
                        name: reqBody.newName,
                    });
                }

                const member = await queryMemberById.get({
                    memberId: reqBody.changedById,
                });

                const insertedMessage = await insertMessageWithType.get({
                    id: generateId(),
                    senderId: reqBody.changedById,
                    body: `${member?.nick || member?.user.fullName} to ${reqBody.newName}`,
                    type: "group-name-change",
                });

                await updateConversationLatestMessage(
                    conversationId,
                    insertedMessage.id
                );

                const groupNameEvent = `conversation:${conversationId}:groupName`;
                const messageEvent = `conversation:${conversationId}:messages`;

                io.emit(groupNameEvent, {
                    conversationId,
                    newName: reqBody.newName,
                });

                io.emit(messageEvent, {
                    type: "message",
                    body: {
                        message: insertedMessage,
                        conversationMember: member,
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
        "/group/image/:conversationId",
        zValidator("form", editConversationImage),
        async (c) => {
            try {
                const { conversationId } = c.req.param();
                const reqBody = c.req.valid("form");
                const io = c.get("io");

                const conversationData = await queryConversationWithImage.get({
                    conversationId,
                });

                if (conversationData?.conversationImage) {
                    await deleteImagesFromCloudinary([
                        conversationData.conversationImage.publicId,
                    ]);
                }

                const uploadData = await uploadImage(reqBody.newImage);

                if (uploadData.http_code >= 400) {
                    throw Error(
                        "Something went wrong when uploading conversation image"
                    );
                }

                let newImageData: SelectConversationImages;

                if (conversationData?.conversationImage) {
                    newImageData = await updateConversationImage({
                        imageId: conversationData.conversationImageId!,
                        imageUrl: uploadData.secure_url,
                        publicId: uploadData.public_id,
                    });
                } else {
                    newImageData = await insertConversationImage.get({
                        id: generateId(),
                        imageUrl: uploadData.secure_url,
                        publicId: uploadData.public_id,
                    });
                }

                await updateConversation(conversationId, {
                    conversationImageId: newImageData.id,
                });

                const member = await queryMemberById.get({
                    memberId: reqBody.changedById,
                });

                const insertedMessage = await insertMessageWithType.get({
                    id: generateId(),
                    senderId: reqBody.changedById,
                    body: `${member?.nick || member?.user.fullName} changed group image.`,
                    type: "group-image-change",
                });

                await updateConversationLatestMessage(
                    conversationId,
                    insertedMessage.id
                );

                const groupImageEvent = `conversation:${conversationId}:groupImage`;
                const messageEvent = `conversation:${conversationId}:messages`;

                io.emit(groupImageEvent, {
                    conversationId,
                    newImage: newImageData,
                });

                io.emit(messageEvent, {
                    type: "message",
                    body: {
                        message: insertedMessage,
                        conversationMember: member,
                    },
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
    );
