import { lucia } from '.';
import type { Cookies, RequestEvent } from '@sveltejs/kit';
import type { Session, User } from 'lucia';

export interface AuthData {
	user: User | null;
	session: Session | null;
}

export const handleLoginRedirect = (event: RequestEvent) => {
	const redirectTo = event.url.pathname + event.url.search;
	return `/sign_in?redirectTo=${redirectTo}`;
};

export const createUserSession = async (userId: string, cookies: Cookies) => {
	const session = await lucia.createSession(userId, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '/',
		...sessionCookie.attributes
	});
};

export const authenticateUser = async (cookies: Cookies) => {
	const authData: AuthData = { user: null, session: null };
	const sessionId = cookies.get(lucia.sessionCookieName);

	if (!sessionId) {
		return authData;
	}

	const { session, user } = await lucia.validateSession(sessionId);

	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});
	}
	authData.user = user;
	authData.session = session;
	return authData;
};
