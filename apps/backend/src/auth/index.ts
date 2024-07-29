import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "../db";
import { sessions, users } from "db/schema";

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            // set to `true` when using HTTPS
            secure: process.env.NODE_ENV == "production",
        },
    },
    getUserAttributes: (attributes) => {
        return {
            fullName: attributes.fullName,
            email: attributes.email,
            createdAt: attributes.createdAt,
            profileImageId: attributes.profileImageId,
        };
    },
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    fullName: string;
    email: string;
    createdAt: string;
    profileImageId: string;
}
