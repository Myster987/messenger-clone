import { Hono } from 'hono';

const chatRoute = new Hono().get('/', (c) => c.text('Hello'));

export { chatRoute };
