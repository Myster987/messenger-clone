import { writable } from 'svelte/store';
import type { Socket } from 'socket.io-client';

export const ioClient = writable<Socket | undefined>();
