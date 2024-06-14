import { Hono } from 'hono';

export const api = new Hono()
	.basePath('/api')
	.get('/', (c) => c.text('Hello World!'))

export type Api = typeof api;