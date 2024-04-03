<script lang="ts">
	import DocumentAdd from 'carbon-icons-svelte/lib/DocumentAdd.svelte';
	import FolderAdd from 'carbon-icons-svelte/lib/FolderAdd.svelte';
	import { currentUser, pocketbase } from '$lib';

	import { fileOrFolderInFocus, notes, folders, tabs } from '$lib/sidebar';

	import Folder from './Folder.svelte';
	import File from './File.svelte';
	import { goto } from '$app/navigation';
	import { stringEncryptAsymmetric } from '$lib/crypto';

	export let data;

	$notes = data.notes;
	$folders = data.folders;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="flex-none py-8 px-2 w-52 h-full overflow-y-auto bg-slate-100 items-list overflow-x-clip"
	on:click={(e) => {
		// console.log(e.target?.className);
		if (e.target?.className.includes('items-list')) {
			$fileOrFolderInFocus = {
				type: 'file',
				id: ''
			};
		}
	}}
	on:keydown={(e) => {
		if (e.key === 'Escape') {
			$fileOrFolderInFocus = {
				type: 'file',
				id: ''
			};
		}
	}}
>
	<section class="flex flex-row place-content-end gap-2 px-4">
		<button
			title="Create new note"
			on:click={async () => {
				let record;

				const title = `Note #${$notes.length + 1}`;

				const encryptedNote = stringEncryptAsymmetric(
					localStorage.getItem('priv') || '',
					{ key: localStorage.getItem('pub') || '' },
					`# ${title} \n## Subtitle \n\nTo being with..`
				);

				if ($fileOrFolderInFocus.type === 'file') {
					record = await pocketbase.collection('notes').create({
						title,
						note: encryptedNote,
						user_id: $currentUser?.id
					});

					$notes = [...$notes, record];
				} else {
					record = await pocketbase.collection('notes').create({
						title,
						note: encryptedNote,
						user_id: $currentUser?.id,
						folder_id: $fileOrFolderInFocus.id
					});

					await pocketbase.collection('folders').update($fileOrFolderInFocus.id, {
						notes: $folders.find((f) => f.id === $fileOrFolderInFocus.id)?.notes
							? [...$folders.find((f) => f.id === $fileOrFolderInFocus.id)?.notes, record.id]
							: [record.id]
					});

					$notes = [...$notes, record];
				}

				$fileOrFolderInFocus = {
					type: 'file',
					id: record.id
				};

				$tabs = $tabs.map((t) => {
					return { ...t, active: false };
				});
				$tabs = [
					...$tabs,
					{
						id: record.id,
						name: record.title,
						active: true
					}
				];

				await goto(`/${record.id}`);
			}}><DocumentAdd /></button
		>
		<button
			title="Create new folder"
			on:click={async () => {
				const name = `Folder #${$folders.length + 1}`;

				const record = await pocketbase.collection('folders').create({
					name,
					user_id: $currentUser?.id
				});

				$folders = [...$folders, record];
			}}
		>
			<FolderAdd />
		</button>
	</section>
	<section class="px-2">
		<hr class="border-slate-300 my-4" />

		<div class="flex flex-col gap-1 list-decimal">
			{#each $folders as folder (folder.id)}
				<Folder {folder} />
				<!-- <Folder {folder} {folders} /> -->
			{/each}
			{#each $notes as note (note.id)}
				{#if !note.folder_id}
					<File {note} />
				{/if}

				<!-- <File {note} {notes} /> -->
			{/each}
		</div>
	</section>
</div>
