// place files you want to import through the `$lib` alias in this folder.

import PocketBase from 'pocketbase';
import Dexie, { type Table } from 'dexie';
import { writable } from 'svelte/store';
import {
    PUBLIC_POCKETBASE_URL
} from '$env/static/public';


export const pocketbase = new PocketBase(PUBLIC_POCKETBASE_URL);

export const currentUser = writable(pocketbase.authStore.model)

export interface Note {
    id: string;
    title: string;
    note: string;
    created: string;
    updated: string;
    folder_id: string;
}

export interface Folder {
    id: string;
    name: string;
    created: string;
    updated: string;
}

class MySubClassedDexie extends Dexie {
  notes!: Table<Note>; 
  folders!: Table<Folder>;

  constructor() {
    super('notesdb');
    this.version(1).stores({
        notes: 'id, title, note, created, updated',
        folders: 'id, name, created, updated'
    });
  }
}

export const notesdb = new MySubClassedDexie();