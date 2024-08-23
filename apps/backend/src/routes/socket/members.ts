import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { generateId } from "../../auth/generate_id";
import { editMemberNick } from "../../auth/form_schemas";
import {
    insertMessageWithType,
    queryMemberById,
    updateConversationLatestMessage,
    updateConversationMemberNick,
} from "../../db/queries";
import type { HonoSocketServer } from "../../socket-helpers";

export const membersRoute = new Hono<{ Variables: HonoSocketServer }>().patch(
    "/nick/:memberId",
    zValidator("json", editMemberNick),
    async (c) => {
        try {
            const { memberId } = c.req.param();
            const reqBody = c.req.valid("json");
            const io = c.get("io");

            const member = await queryMemberById.get({ memberId });

            const updatedMember = await updateConversationMemberNick({
                memberId,
                newNick: reqBody.newNick,
            });

            const changedBy = await queryMemberById.get({
                memberId: reqBody.changedById,
            });

            const insertedMessage = await insertMessageWithType.get({
                id: generateId(),
                senderId: memberId,
                body: `${changedBy?.nick || changedBy?.user.fullName}-${member?.user.fullName}-${updatedMember.nick}`,
                type: "nick-change",
            });

            await updateConversationLatestMessage(
                reqBody.conversationId,
                insertedMessage.id
            );

            const nickEvent = `conversation:${reqBody.conversationId}:nicks`;
            const messageEvent = `conversation:${reqBody.conversationId}:messages`;

            io.emit(nickEvent, {
                memberId,
                newNick: reqBody.newNick,
            });

            io.emit(messageEvent, {
                type: "message",
                body: {
                    message: insertedMessage,
                    conversationMember: updatedMember,
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
