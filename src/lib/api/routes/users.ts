import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { queryUsersByName } from '@/db/queries';
import { customQueryParams } from '../validation';

export const usersRoute = new Hono().get(
	'/by_full_name/:fullName',
	zValidator('query', customQueryParams(15)),
	async (c) => {
		try {
			const { fullName } = c.req.param();
			const { limit, offset } = c.req.valid('query');

			const data = await queryUsersByName(fullName, limit, offset);

			return c.json({
				success: true,
				data
			});
		} catch (error) {
			console.log(c.req.path, error);
			return c.json(
				{
					success: false,
					data: null
				},
				500
			);
		}
	}
);
