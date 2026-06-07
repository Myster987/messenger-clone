import type { RequestEvent } from '@sveltejs/kit';

export const handleLoginRedirect = (event: RequestEvent) => {
	const redirectTo = event.url.pathname + event.url.search;
	return `/sign_in?redirectTo=${redirectTo}`;
};
