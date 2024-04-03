<script>
	import { goto } from '$app/navigation';
	import { currentUser, pocketbase } from '$lib';
	import { stringEncryptAsymmetric } from '$lib/crypto';
	import { notes, tabs } from '$lib/sidebar';
	import Add from 'carbon-icons-svelte/lib/Add.svelte';

	let feedbackSentMessage = '';
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div
	class="flex flex-col justify-center items-center gap-4 mx-auto my-auto text-sm sm:text-sm md:text-base"
>
	<h1 class="text-5xl font-black">ScratchPad</h1>

	<h3 class="text-base">An end-to-end encrypted notepad.</h3>

	<button
		title="Create new note"
		class="bg-slate-100 shadow-md hover:bg-slate-200 hover:border-slate-200 px-2 py-1 rounded-md flex flex-row items-center gap-1"
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
		}}>Create Note <Add /></button
	>
</div>
