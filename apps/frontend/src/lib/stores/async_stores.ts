import { writable } from 'svelte/store';

interface PromiseStoreType<Data> {
	promise: Promise<Data> | undefined;
	data: Data | undefined;
	isLoading: boolean;
	isError: boolean;
}

export function createAsyncStore<T>(initialValue?: Promise<T>) {
	const store = writable<PromiseStoreType<T>>({
		promise: undefined,
		data: undefined,
		isLoading: false,
		isError: false
	});

	function updateStatus(promiseObject: Promise<T>) {
		store.set({ promise: promiseObject, data: undefined, isLoading: true, isError: false });
		promiseObject
			.then((data) => {
				store.set({ promise: undefined, data, isLoading: false, isError: false });
			})
			.catch(() => {
				store.set({ promise: undefined, data: undefined, isLoading: false, isError: true });
			});
	}

	function updateAsync(newPromise: Promise<T>) {
		updateStatus(newPromise);
	}

	if (initialValue) {
		updateStatus(initialValue);
	}

	return {
		...store,
		updateAsync
	};
}

export type AsyncStore = ReturnType<typeof createAsyncStore>;
