import { authenticateUser } from '@/auth/handlers';
import { type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const { user, session } = await authenticateUser(event.cookies);
	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};