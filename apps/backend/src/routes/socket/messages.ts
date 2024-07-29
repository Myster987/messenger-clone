import { Hono } from "hono";
import type { HonoSocketServer } from "../../socket-helpers";

export const messagesRoute = new Hono<{ Variables: HonoSocketServer }>();
