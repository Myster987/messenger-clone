import { Hono } from 'hono';
import { chatRoute } from './chat';

export const websocketRoutes = new Hono().route('/chat', chatRoute);
