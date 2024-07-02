import { Hono } from 'hono';
import { customQueryParams } from '../validation';
import { zValidator } from '@hono/zod-validator';

export const usersRoute = new Hono().get(
	'/by_full_name/:fullName',
	zValidator('query', customQueryParams(15)),
	async (c) => {
		try {
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
