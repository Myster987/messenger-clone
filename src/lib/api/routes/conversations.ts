import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { pageQueryParams } from '../validation';
import { queryUserConversations } from '@/db/queries';

export const conversationsRoute = new Hono().get(
	'user/:userId',
	zValidator('query', pageQueryParams(0), (result, c) => {
		if (!result.success) {
			return c.json(
				{
					success: false
				},
				400
			);
		}
	}),
	async (c) => {
		try {
			const { userId } = c.req.param();
			const { page } = c.req.valid('query');

			const limit = 25;
			const offset = page * limit;

			const data = await queryUserConversations.all({ userId, limit, offset });

			return c.json({
				succcess: true,
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
