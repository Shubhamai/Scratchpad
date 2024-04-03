// place files you want to import through the `$lib` alias in this folder.

import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';
import {
    PUBLIC_POCKETBASE_URL
} from '$env/static/public';


export const pocketbase = new PocketBase(PUBLIC_POCKETBASE_URL);

export const currentUser = writable(pocketbase.authStore.model)