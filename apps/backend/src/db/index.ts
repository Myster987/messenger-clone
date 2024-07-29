import { createDbClient } from "db";

export const db = createDbClient(
    process.env.DATABASE_URL!,
    process.env.DATABASE_TOKEN
);
