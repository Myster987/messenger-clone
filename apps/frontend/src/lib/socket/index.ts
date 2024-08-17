import { writable } from 'svelte/store';
import type { Socket } from 'socket.io-client';

export const ioClient = writable<Socket | undefined>();

export const attachEvent = (
	socket: Socket | undefined,
	eventName: string,
	callback: (...args: any[]) => void
) => {
	const existingListeners = socket?.listeners(eventName) || [];
	if (existingListeners.length > 0) return;
	socket?.on(eventName, callback);
};
