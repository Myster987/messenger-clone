import { onMount } from 'svelte';
import { get } from 'svelte/store';
import { apiClientStore } from '@/stores';

export const setOfflineStatus = (userId: string) => {
	window.addEventListener(
		'beforeunload',
		() => {
			get(apiClientStore).patch(
				`api/users/is_online/${userId}?` + new URLSearchParams({ online: 'false' }).toString()
			);
		},
		false
	);
};

export const setOnlineStatus = (userId: string) => {
	onMount(() => {
		get(apiClientStore).patch(
			`api/users/is_online/${userId}?` + new URLSearchParams({ online: 'true' }).toString()
		);
	});
};
