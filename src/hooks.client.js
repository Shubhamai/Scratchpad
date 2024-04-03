import { pocketbase, currentUser} from "$lib";

pocketbase.authStore.loadFromCookie(document.cookie);

pocketbase.authStore.onChange(() => {
    currentUser.set(pocketbase.authStore.model)

    // TODO : httpOnly: false is to to read cookies using javascript, see https://github.com/pocketbase/pocketbase/discussions/3051#discussioncomment-6619295
    document.cookie = pocketbase.authStore.exportToCookie({ httpOnly: false })
})