import { Hono } from "hono";
import { messagesRoute } from "./messages";

export const socketRoute = new Hono().route("/messages", messagesRoute);
