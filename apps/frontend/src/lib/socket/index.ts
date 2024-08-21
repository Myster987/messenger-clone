import { get, writable } from 'svelte/store';
import type { Socket } from 'socket.io-client';

export const ioClient = writable<Socket | undefined>();

const callbacksStore = writable(new Set<string>());

export const attachEvent = (
	socket: Socket | undefined,
	eventName: string,
	key: string,
	callback: (...args: any[]) => void
) => {
	if (get(callbacksStore).has(key)) return;
	callbacksStore.update((c) => c.add(key));
	socket?.on(eventName, callback);
};
