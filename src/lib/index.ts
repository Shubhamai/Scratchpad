// place files you want to import through the `$lib` alias in this folder.

import PocketBase from 'pocketbase';
import Dexie, { type Table } from 'dexie';
import { writable } from 'svelte/store';
import {
    PUBLIC_POCKETBASE_URL
} from '$env/static/public';


export const pocketbase = new PocketBase(PUBLIC_POCKETBASE_URL);

export const currentUser = writable(pocketbase.authStore.model)

export interface Notes {
    id: string;
    title: string;
    user_id: string;
    note: string;
    created: string;
    updated: string;
    folder_id: string;
}

export interface Folders {
    id: string;
    name: string;
    user_id: string;
    created: string;
    updated: string;
}

class MySubClassedDexie extends Dexie {
  notes!: Table<Notes>; 
  folders!: Table<Folders>;

  constructor() {
    super('notesdb');
    this.version(1).stores({
        notes: 'id, title, note, user_id, created, updated',
        folders: 'id, name, user_id, created, updated'
    });
  }
}

export const notesdb = new MySubClassedDexie();