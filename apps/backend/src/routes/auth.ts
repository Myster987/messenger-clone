import { readFile } from "node:fs/promises";
import path from "path";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { generateId } from "../auth/generate_id";
import { insertProfileImage, insertUser } from "../db/queries";
import { uploadImageFromBuffer } from "../cloudinary";

const postUserSchema = z.object({
    email: z.string().email().min(1),
    password: z.string().trim().min(1),
    fullName: z.string().trim().min(1),
});

export const authRoute = new Hono().post(
    "/user",
    zValidator("form", postUserSchema, (result, c) => {
        if (!result.success) {
            return c.json(
                {
                    success: false,
                    userId: null,
                },
                400
            );
        }
    }),
    async (c) => {
        try {
            const body = c.req.valid("form");
            const image = await readFile(
                path.resolve(
                    process.cwd(),
                    "./src/assets/default_profile_image.png"
                )
            );
            const uploadData = await uploadImageFromBuffer(image);

            if (uploadData.http_code >= 400) {
                throw Error(
                    "Something went wrong when uploading profile image"
                );
            }

            const userInsertionRes = await insertUser.get({
                id: generateId(),
                email: body.email,
                password: body.password,
                fullName: body.fullName,
                isOnline: true,
            });

            if (!userInsertionRes) {
                throw Error("Something went wrong when inserting user");
            }

            const imageInsertionRes = await insertProfileImage.get({
                id: generateId(),
                imageUrl: uploadData.secure_url,
                publicId: uploadData.public_id,
                userId: userInsertionRes.id,
            });

            if (!imageInsertionRes) {
                throw Error(
                    "Something went wrong when inserting profile image"
                );
            }

            return c.json({
                success: true,
                userId: userInsertionRes.id,
            });
        } catch (error) {
            console.log(c.req.path, error);
            return c.json(
                {
                    success: false,
                    userId: null,
                },
                500
            );
        }
    }
);
