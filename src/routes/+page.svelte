<script>
	import { goto } from '$app/navigation';
	import { currentUser, pocketbase } from '$lib';
	import { stringEncryptAsymmetric } from '$lib/crypto';
	import { notes, showSidebar, tabs } from '$lib/sidebar';
	import Add from 'carbon-icons-svelte/lib/Add.svelte';

	let feedbackSentMessage = '';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="ScratchPad - Your end-to-end encrypted notepad." />
</svelte:head>

<div>&nbsp;</div>
<div
	class="flex flex-col justify-center items-center gap-4 mx-auto my-auto text-sm sm:text-sm md:text-base"
>
	<h1 class="text-2xl sm:text-5xl font-black">ScratchPad</h1>

	<h3 class="text-sm sm:text-base text-center">Your end-to-end encrypted notepad.</h3>

	<!-- Dark them in createw note button, like shadcn -->
	<button
		title="Create new note"
		class="bg-black hover:shadow-xl text-white text-xs pl-[8px] pr-[3px] py-[2px] sm:text-base sm:pl-5 sm:pr-4 sm:py-2 rounded-3xl flex flex-row items-center gap-1"
		on:click={async () => {
			const title = `Note #${$notes.length + 1}`;

			const encryptedNote = stringEncryptAsymmetric(
				localStorage.getItem('priv') || '',
				{ key: localStorage.getItem('pub') || '' },
				`# ${title} \n## Subtitle \n\nTo being with..`
			);

			const record = await pocketbase.collection('notes').create({
				title,
				note: encryptedNote,
				user_id: $currentUser?.id
			});

			$notes = [...$notes, record];

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
