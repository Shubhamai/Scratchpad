// src/hooks.server.js
import { nanoid } from 'nanoid';
import PocketBase from 'pocketbase';
import {
    PUBLIC_POCKETBASE_URL
} from '$env/static/public';


/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    event.locals.pb = new PocketBase(PUBLIC_POCKETBASE_URL);

    // load the store data from the request cookie string
    event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

    try {
        // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
        event.locals.pb.authStore.isValid && await event.locals.pb.collection('users').authRefresh();
    } catch (_) {
        // clear the auth store on failed refresh
        event.locals.pb.authStore.clear();
    }

    // TODO : Is it in the right place ?
    if (!event.locals.pb.authStore.isValid) {
        const username = nanoid(5);
        const password = nanoid(10);
        

        await event.locals.pb.collection('users').create({
            "username": username,
            "password": password,
            "passwordConfirm": password,
        });
        await event.locals.pb.collection('users').authWithPassword(
            username,
            password,
        );
        
    }

    const response = await resolve(event);

    // send back the default 'pb_auth' cookie to the client with the latest store state
    // TODO : Perhaps set httpOnly: false to  read cookie in browser, see https://github.com/pocketbase/pocketbase/discussions/3051#discussioncomment-6619295
    response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie({
        httpOnly: false,
    }));

    return response;
}