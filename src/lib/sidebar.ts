import type { RecordModel } from 'pocketbase';
import { writable, type Writable } from 'svelte/store';

type Tab = {
    name: string;
    id : string;
    active : boolean;
}

export const tabs : Writable<Tab[]> = writable([]);


export const fileOrFolderInFocus : Writable<{
    type: 'file' | 'folder';
    id: string;
}> = writable({
    type: 'file',
    id: ''
}); // id of the folder in focus

export const notes : Writable<RecordModel[]> = writable([]); 
export const folders : Writable<RecordModel[]> = writable([]); 
export const showSidebar : Writable<boolean> = writable(true);