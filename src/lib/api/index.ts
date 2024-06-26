import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { protect } from './utils';
import { usersRoute, authRoute, conversationsRoute } from './routes';

export const api = new Hono()
	.basePath('/api')
	.use(logger())
	.use(protect)
	.get('/', (c) => c.text('Hello World!'))
	.route('/auth', authRoute)
	.route('/users', usersRoute)
	.route('/conversations', conversationsRoute);

export type Api = typeof api;
