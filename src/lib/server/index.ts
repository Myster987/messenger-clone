import { Server } from 'socket.io';

export const GlobalThisWSS = Symbol.for('Sveltekit.WebsocketServer');

export type ExtendedGlobal = typeof globalThis & {
	[GlobalThisWSS]: Server;
};

// export const onHttpServerUpgrade = (req: IncomingMessage, sock: Duplex, head: Buffer) => {
//     if (req.url !== '/api/websocket') return;

//     const io = (globalThis as ExtendedGlobal)[GlobalThisWSS];

//     io.engine

//     // wss.handleUpgrade(req, sock, head, (ws) => {
//     //   console.log('[handleUpgrade] creating new connecttion');
//     //   wss.emit('connection', ws, req);
//     // });
//   };

//   export const createWSSGlobalInstance = () => {
//     const wss = new WebSocketServer({ noServer: true });
//     const io = new Server(wss, { path: "/api/websocket", addTrailingSlash: false});

//     (globalThis as ExtendedGlobal)[GlobalThisWSS] = io;

//     io.on("connection", (ws) => {
//         console.log(`Socket connected ${ws.id}`);

//         ws.on("close", () => {
//           console.log(`Socket disconnected ${ws.id}`)
//         })
//     })

//     return wss;
//   };
