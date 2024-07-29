import type { Server } from "socket.io";

export const GlobalThisWSS = Symbol.for("socket.io.server");

export type ExtendedGlobal = typeof globalThis & {
    [GlobalThisWSS]: Server;
};

export type HonoSocketServer = {
    io: Server;
};
