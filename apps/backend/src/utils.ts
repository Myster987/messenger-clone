import { lucia } from "./auth";
import { getCookie } from "hono/cookie";
import type { Context, Next } from "hono";

export async function protect(c: Context, next: Next) {
    if (!c.req.path.startsWith("/api/auth")) {
        const sessionId = getCookie(c, lucia.sessionCookieName);

        if (!sessionId) {
            return c.json(
                {
                    error: "Unauthorized",
                },
                401
            );
        }

        const { session, user } = await lucia.validateSession(sessionId);

        if (!session || !user) {
            return c.json(
                {
                    error: "Unauthorized",
                },
                401
            );
        }
    }
    await next();
}
