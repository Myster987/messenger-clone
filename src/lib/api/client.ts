import { hc } from 'hono/client';
import { browser } from '$app/environment';
import type { Api } from '.';

export type HonoClient = ReturnType<typeof hc<Api>>;
let browserClient: HonoClient;

export const createHonoClient = (customFetch = fetch) => {
	const origin = browser ? window.location.origin : '';

	if (browser && browserClient) {
		return browserClient;
	}

	const client = hc<Api>(origin, { fetch: customFetch });

	if (browser) {
		browserClient = client;
	}

	return client;
};
