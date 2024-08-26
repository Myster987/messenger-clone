import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { deleteImagesFromCloudinary, uploadImage } from "../cloudinary";
import { pageQueryParams, postNewConversation } from "../validation";
import {
    checkIfPossibleToCreateChat,
    checkIfUserInConversation,
    insertConversationAsChat,
    insertConversationAsGroup,
    insertConversationImage,
    insertConversationMember,
    insertConversationMemberAsAdmin,
    insertMessageWithType,
    queryConversationById,
    queryConversationWithImage,
    queryMemberById,
    queryMemberByUserId,
    queryUserByIdWithProfileImageWithoutPassword,
    queryUserConversations,
    updateConversation,
    updateConversationImage,
    updateConversationLatestMessage,
    updateIsCurrentMember,
} from "../db/queries";
import { SelectConversationImages } from "db/schema";
import { generateId } from "../auth/generate_id";
import {
    addMemberToConversation,
    createGroupSchema,
    editConversationImage,
    editConversationName,
    leaveConversation,
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
                usersData.map((user) => {
                    const isAdmin = user?.id == reqBody.creatorId;
                    if (isAdmin) {
                        return insertConversationMemberAsAdmin.get({
                            id: generateId(),
                            conversationId: conversationInsertion.id,
                            userId: user?.id,
                        });
                    }
                    return insertConversationMember.get({
                        id: generateId(),
                        conversationId: conversationInsertion.id,
                        userId: user?.id,
                    });
                })
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
    )
    .put(
        "members/:conversationId",
        zValidator("json", addMemberToConversation),
        async (c) => {
            try {
                const { conversationId } = c.req.param();
                const reqBody = c.req.valid("json");
                const io = c.get("io");

                const exists = await Promise.all(
                    reqBody.newUserIds.map((userId) =>
                        checkIfUserInConversation.get({
                            conversationId,
                            userId,
                        })
                    )
                );

                let insertedMembers = await Promise.all(
                    exists.map((e, i) => {
                        if (e && e.currentlyMember) {
                            return;
                        } else if (e && !e.currentlyMember) {
                            return updateIsCurrentMember({
                                memberId: e.id,
                                isCurrentMember: true,
                            });
                        } else {
                            return insertConversationMember.get({
                                id: generateId(),
                                conversationId,
                                userId: reqBody.newUserIds[i],
                            });
                        }
                    })
                );

                const conversationData = await queryConversationById.get({
                    conversationId,
                });

                insertedMembers = insertedMembers.filter(
                    (m) => typeof m != "undefined"
                );
                const insertedMembersData = await Promise.all(
                    insertedMembers.map((m) =>
                        queryMemberByUserId.get({ userId: m?.userId })
                    )
                );

                const insertedMembersNames = insertedMembersData.map(
                    (m) => m?.user.fullName
                );

                const addedBy = await queryMemberById.get({
                    memberId: reqBody.addedById,
                });

                let body = "";

                if (insertedMembersNames.length == 1) {
                    body = `${addedBy?.nick || addedBy?.user.fullName} added ${insertedMembersNames[0]}.`;
                } else if (insertedMembersNames.length == 2) {
                    body = `${addedBy?.nick || addedBy?.user.fullName} added ${insertedMembersNames[0]} and ${insertedMembersNames[1]}.`;
                } else {
                    body = `${addedBy?.nick || addedBy?.user.fullName} added ${insertedMembersNames.slice(0, -1).join(", ")} and ${insertedMembersNames.at(-1)}`;
                }

                const insertedMessage = await insertMessageWithType.get({
                    id: generateId(),
                    senderId: reqBody.addedById,
                    body,
                    type: "group-add-members",
                });

                await updateConversationLatestMessage(
                    conversationId,
                    insertedMessage.id
                );

                const newConversaionKeys = insertedMembers.map(
                    (m) => `user:${m?.userId}:newConversation`
                );
                const messageEvent = `conversation:${conversationId}:messages`;
                const updateMembersKey = `conversation:${conversationId}:updateMembers`;

                newConversaionKeys.forEach((eventKey) =>
                    io.emit(eventKey, {
                        conversation: conversationData,
                    })
                );

                io.emit(messageEvent, {
                    type: "message",
                    body: {
                        message: insertedMessage,
                        conversationMember: addedBy,
                    },
                });

                io.emit(updateMembersKey, {
                    type: "add",
                    conversationId,
                    members: insertedMembersData,
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
    .delete(
        "/leave/:conversationId",
        zValidator("json", leaveConversation),
        async (c) => {
            try {
                const { conversationId } = c.req.param();
                const reqBody = c.req.valid("json");
                const io = c.get("io");

                // const memberData =

                const updatedMember = await updateIsCurrentMember({
                    isCurrentMember: false,
                    memberId: reqBody.memberId,
                });

                const removeEventKey = `conversation:${conversationId}:leave`;

                io.emit(removeEventKey, {
                    conversationId,
                    memberId: reqBody.memberId,
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
