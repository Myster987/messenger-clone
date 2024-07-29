import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

export const createDbClient = (url: string, authToken?: string) => {
    const client = createClient({
        url,
        authToken,
    });
    const db = drizzle(client, { schema });
    return db;
};
