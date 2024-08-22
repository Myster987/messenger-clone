import { get, writable } from 'svelte/store';
import type { Socket } from 'socket.io-client';

type Props = {
	eventName: string;
	key: string;
	callback: (...args: any[]) => void;
};

const createIoClient = (initialValue?: Socket) => {
	const ioClient = writable(initialValue);
	const callbacksStore = writable(new Map<string, (...args: any[]) => void>());

	const attachEvent = ({ eventName, key, callback }: Props) => {
		if (get(callbacksStore).has(key)) return;
		callbacksStore.update((c) => c.set(key, callback));
		get(ioClient)?.on(eventName, callback);
	};

	const deleteListenerByKey = ({ eventName, key }: { eventName: string; key: string }) => {
		const callback = get(callbacksStore).get(key);
		if (typeof callback != 'undefined') {
			get(ioClient).off(eventName, callback);
			callbacksStore.update((c) => {
				c.delete(key);
				return c;
			});
		}
	};

	return {
		...ioClient,
		attachEvent,
		deleteListenerByKey
	};
};

export const ioClient = createIoClient();
