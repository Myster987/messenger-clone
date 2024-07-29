import { hc } from "hono/client";
import type { Api } from ".";

export const createHonoClient = (origin: string, customFetch = fetch) =>
    hc<Api>(origin, { fetch: customFetch });

export type HonoClient = ReturnType<typeof createHonoClient>;
