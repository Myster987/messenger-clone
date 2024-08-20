import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { editMemberNick } from "../../auth/form_schemas";
import { updateConversationMemberNick } from "../../db/queries";
import type { HonoSocketServer } from "../../socket-helpers";

export const membersRoute = new Hono<{ Variables: HonoSocketServer }>().patch(
    "/nick/:memberId",
    zValidator("json", editMemberNick),
    async (c) => {
        try {
            const { memberId } = c.req.param();
            const { newNick, conversationId } = c.req.valid("json");
            const io = c.get("io");

            await updateConversationMemberNick({
                memberId,
                newNick,
            });

            const eventKey = `conversation:${conversationId}:nicks`;

            io.emit(eventKey, {
                memberId,
                newNick,
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
