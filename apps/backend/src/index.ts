import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { Server } from "socket.io";
import { protect } from "./utils";
import {
    usersRoute,
    authRoute,
    conversationsRoute,
    socketRoute,
} from "./routes";
import {
    type ExtendedGlobal,
    GlobalThisWSS,
    type HonoSocketServer,
} from "./socket-helpers";

type Env = {
    Variables: HonoSocketServer;
};

export const api = new Hono<Env>()
    .basePath("/api")
    .use(
        cors({
            origin: process.env.SITE_URL!,
            credentials: true,
            allowMethods: [
                "GET",
                "HEAD",
                "PUT",
                "POST",
                "DELETE",
                "PATCH",
                "OPTIONS",
            ],
        })
    )
    .use(protect)
    .use(async (c, next) => {
        c.set("io", (globalThis as ExtendedGlobal)[GlobalThisWSS]);
        await next();
    })
    .get("/", (c) => c.text("Hello World!"))
    .route("/auth", authRoute)
    .route("/users", usersRoute)
    .route("/conversations", conversationsRoute)
    .route("/socket", socketRoute);

const server = serve(api, (info) =>
    console.log(`Hono server running on port ${info.port}`)
);

const io = new Server(server, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    serveClient: false,
    cors: {
        credentials: true,
        origin: process.env.SITE_URL,
    },
});

(globalThis as ExtendedGlobal)[GlobalThisWSS] = io;

export type Api = typeof api;
