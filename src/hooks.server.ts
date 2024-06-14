import { createHonoClient } from '@/api/client';
import { authenticateUser } from '@/auth/handlers';
import { type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const { user, session } = await authenticateUser(event.cookies);
	event.locals.user = user;
	event.locals.session = session;
	event.locals.honoClient = createHonoClient(event.fetch);

	return resolve(event);
};