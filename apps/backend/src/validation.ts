import { z } from "zod";

export const baseQueryParams = (limit = 100, offset = 0) =>
    z
        .object({
            limit: z.coerce.number().int().positive().default(limit),
            offset: z.coerce.number().int().nonnegative().default(offset),
        })
        .optional()
        .default({ limit, offset });

export const customQueryParams = (defaultLimit = 100, defaultOffset = 0) =>
    z
        .object({
            limit: z.coerce.number().int().positive().default(defaultLimit),
            offset: z.coerce
                .number()
                .int()
                .nonnegative()
                .default(defaultOffset),
        })
        .optional()
        .default({ limit: defaultLimit, offset: defaultOffset });

export const pageQueryParams = (defaultPage = 0) =>
    z
        .object({
            page: z.coerce.number().int().nonnegative().default(defaultPage),
        })
        .optional()
        .default({ page: defaultPage });

export const postNewConversation = z.object({
    firstUserId: z.string().min(1).max(20),
    secondUserId: z.string().min(1).max(20),
});

export const patchSeenMessage = z.object({
    memberId: z.string().min(1).max(20).trim(),
    lastSeenMessageId: z.string().min(1).max(20).trim(),
});
