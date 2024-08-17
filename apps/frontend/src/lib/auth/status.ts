import { onMount } from 'svelte';
import { get } from 'svelte/store';
import { honoClientStore } from '@/stores';

export const setOfflineStatus = (userId: string) => {
	window.addEventListener(
		'beforeunload',
		() => {
			get(honoClientStore).api.users.is_online[':userId'].$patch({
				param: {
					userId
				},
				query: {
					online: 'false'
				}
			});
		},
		false
	);
};

export const setOnlineStatus = (userId: string) => {
	onMount(() => {
		get(honoClientStore).api.users.is_online[':userId'].$patch({
			param: {
				userId
			},
			query: {
				online: 'true'
			}
		});
	});
};
