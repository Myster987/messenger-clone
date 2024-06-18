import { z } from "zod";


export const baseQueryParams = (limit = 100, offset = 0) =>
	z
		.object({
			limit: z.coerce.number().int().positive().default(limit),
			offset: z.coerce.number().int().nonnegative().default(offset)
		})
		.optional()
		.default({ limit, offset });