<script lang="ts">
	import DocumentAdd from 'carbon-icons-svelte/lib/DocumentAdd.svelte';
	import FolderAdd from 'carbon-icons-svelte/lib/FolderAdd.svelte';
	import { currentUser, pocketbase } from '$lib';

	import { fileOrFolderInFocus, notes, folders } from '$lib/sidebar';

	import Folder from './Folder.svelte';
	import File from './File.svelte';
	import { goto } from '$app/navigation';

	export let data;

	$notes = data.notes;
	$folders = data.folders;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="flex-none py-8 px-2 w-52 h-full overflow-y-auto bg-slate-100 items-list"
	on:click={(e) => {
		if (e.target.className.includes('items-list')) {
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
			on:click={async () => {
				if ($fileOrFolderInFocus.type === 'file') {
					const record = await pocketbase.collection('notes').create({
						title: 'New File',
						note: '',
						user_id: $currentUser?.id
					});

					$notes = [...$notes, record];
				} else {
					const record = await pocketbase.collection('notes').create({
						title: 'New File',
						note: '',
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
			}}><DocumentAdd /></button
		>
		<button
			on:click={async () => {
				const record = await pocketbase.collection('folders').create({
					name: 'New Folder',
					user_id: $currentUser?.id
				});

				$folders = [...$folders, record];
			}}
		>
			<FolderAdd />
		</button>
	</section>
	<hr class="border-slate-300 my-4 mx-3" />

	<div class="px-2 flex flex-col gap-1 list-decimal">
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
</div>
