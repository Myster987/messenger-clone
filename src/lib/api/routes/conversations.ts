import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { pageQueryParams, postNewConversation } from '../validation';
import {
	insertConversationAsChat,
	insertConversationMember,
	queryUserById,
	queryUserConversations
} from '@/db/queries';
import { generateId } from '@/auth/generate_id';
import { inArray } from 'drizzle-orm';
import { db } from '@/db';
import * as schema from '@/db/schema';

export const conversationsRoute = new Hono()
	.get(
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
	)
	.post('/chat', zValidator('json', postNewConversation), async (c) => {
		try {
			const body = c.req.valid('json');

			const exists = await db.query.conversations.findFirst({
				with: {
					members: {
						where: inArray(schema.conversationMembers.userId, [body.firstUserId, body.secondUserId])
					}
				}
			});

			if (exists) {
				return c.json(
					{
						success: false
					},
					400
				);
			}

			const conversationInsertion = await insertConversationAsChat.get({
				id: generateId(),
				name: `${body.firstUserId}-${body.secondUserId}`
			});

			if (!conversationInsertion) {
				throw Error('Something went wrong when inserting conversation');
			}

			const usersData = await Promise.all(
				Object.values(body).map((val) => queryUserById.get({ userId: val }))
			);

			const membersInsertion = await Promise.all(
				usersData.map((user) =>
					insertConversationMember.get({
						id: generateId(),
						conversationId: conversationInsertion.id,
						userId: user?.id
					})
				)
			);

			if (membersInsertion.length == 0) {
				throw Error('Something went wrong when inserting conversation');
			}

			return c.json({
				success: true
			});
		} catch (error) {
			console.log(c.req.path, error);
			return c.json(
				{
					success: false
				},
				500
			);
		}
	});
