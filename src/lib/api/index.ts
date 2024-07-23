import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { protect } from './utils';
import { usersRoute, authRoute, conversationsRoute, websocketRoutes } from './routes';

const api = new Hono()
	.basePath('/api')
	.use(logger())

	.use(protect)
	.get('/', (c) => c.text('Hello World!'))
	.route('/auth', authRoute)
	.route('/users', usersRoute)
	.route('/conversations', conversationsRoute)
	.route('/websocket', websocketRoutes);

export type Api = typeof api;
