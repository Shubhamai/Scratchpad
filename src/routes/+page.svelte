<script>
	import { goto } from '$app/navigation';
	import { currentUser, notesdb } from '$lib';
	import { showSidebar, tabs } from '$lib/sidebar';
	import Add from 'carbon-icons-svelte/lib/Add.svelte';
	import keystore from 'keystore-idb';
	import { nanoid } from 'nanoid';

	let feedbackSentMessage = '';
</script>

<svelte:head>
	<title>ScratchPad</title>
	<meta name="title" content="ScratchPad" />
	<meta name="description" content="Your end-to-end encrypted offline first notepad." />
	<meta name="keywords" content="scratchpad, notepad, end-to-end, encrypted, notes, scratch, pad" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://notes.reddeadlabs.com/" />
	<meta
		property="og:title"
		content="ScratchPad - Your end-to-end encrypted offline first notepad."
	/>
	<meta
		property="og:description"
		content="Save your notes in a secure way on cloud. Your notes are end-to-end encrypted and only you can access them."
	/>
	<!-- <meta property="og:image" content="/large_image.png" /> -->

	<!-- Twitter -->
	<meta property="twitter:card" content="summary" />
	<meta property="twitter:url" content="https://notes.reddeadlabs.com/" />
	<meta name="twitter:site" content="@reddeadlabs" />
	<meta
		property="twitter:title"
		content="ScratchPad - Your end-to-end encrypted offline first notepad."
	/>
	<meta
		property="twitter:description"
		content="Save your notes in a secure way on cloud. Your notes are end-to-end encrypted and only you can access them. Works offline and online."
	/>
	<meta property="twitter:image" content="/twitter.png" />
</svelte:head>

<div>&nbsp;</div>
<div
	class="flex flex-col justify-center items-center gap-4 mx-auto my-auto text-sm sm:text-sm md:text-base"
>
	<h1 class="text-2xl sm:text-5xl font-black">ScratchPad</h1>

	<h3 class="text-sm sm:text-base text-center">Your end-to-end encrypted offline first notepad.</h3>

	<!-- Dark them in createw note button, like shadcn -->
	<button
		title="Create new note"
		class="bg-black hover:shadow-xl text-white text-xs pl-[8px] pr-[3px] py-[2px] sm:text-base sm:pl-5 sm:pr-4 sm:py-2 rounded-3xl flex flex-row items-center gap-1"
		on:click={async () => {
			const title = `Note #${(await notesdb.notes.count()) + 1}`;

			const ks1 = await keystore.init({ storeName: 'keystore' });
			const ks2 = await keystore.init({ storeName: 'keystore2' });

			const exchangeKey2 = await ks2.publicExchangeKey();

			const cipher = await ks1.encrypt(
				`# ${title} \n## Subtitle \n\nTo being with..`,
				exchangeKey2
			);

			const record = {
				id: nanoid(15),
				title,
				note: cipher,
				user_id: $currentUser?.id,
				created: new Date().toISOString(),
				updated: new Date().toISOString(),
				folder_id: ''
			};
			await notesdb.notes.add(record);

			$tabs = [
				...$tabs,
				{
					id: record.id,
					name: record.title,
					active: true
				}
			];

			await goto(`/${record.id}`);

			$showSidebar = true;
		}}>Create Note <Add size={24} /></button
	>
</div>

<p class="text-xs sm:text-sm text-center italic pb-4 text-gray-600">
	The application is currently in development. So expect bugs and issues as we are working on it. <br
	/> Do not store any sensitive information on this application.
</p>
