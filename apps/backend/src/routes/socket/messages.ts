import { Hono } from "hono";

export const messagesRoute = new Hono().get("/", (c) => c.text("Hello"));
