import { writable, type Writable } from 'svelte/store';

type Tab = {
    name: string;
    id : string;
    active : boolean;
}

export const tabs : Writable<Tab[]> = writable([]);
