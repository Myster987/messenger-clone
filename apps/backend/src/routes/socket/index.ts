import { Hono } from "hono";
import { membersRoute } from "./members";
import { messagesRoute } from "./messages";

export const socketRoute = new Hono()
    .route("/messages", messagesRoute)
    .route("/members", membersRoute);
