<script lang="ts">
	import Delete from 'carbon-icons-svelte/lib/TrashCan.svelte';
	import ChevronRight from 'carbon-icons-svelte/lib/ChevronRight.svelte';
	import ChevronDown from 'carbon-icons-svelte/lib/ChevronDown.svelte';
	import Edit from 'carbon-icons-svelte/lib/Edit.svelte';
	import Checkmark from 'carbon-icons-svelte/lib/Checkmark.svelte';
	import Close from 'carbon-icons-svelte/lib/Close.svelte';

	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	import { pocketbase } from '$lib';
	import { fileOrFolderInFocus, folders, notes, tabs } from '$lib/sidebar';
	import File from './File.svelte';
	import { goto } from '$app/navigation';

	export let folder: any;
	let files = $notes.filter((n) => n.folder_id === folder.id);

	notes.subscribe((n) => {
		files = n.filter((n) => n.folder_id === folder.id);
	});

	let isEditing = false;
	let open = false;
	let folderName = folder.name;

	const changeFolderName = () => {
		pocketbase.collection('folders').update(folder.id, {
			name: folderName
		});

		$folders = $folders.map((n) => {
			if (n.id === folder.id) {
				return { ...n, name: folderName };
			}
			return n;
		});
	};
</script>

<div
	class={`flex flex-row items-center gap-1 rounded-md pr-2 ${
		$fileOrFolderInFocus.id === folder.id ? 'bg-gray-100' : ''
	}`}
>
	{#if open}
		<ChevronDown />
	{:else}
		<ChevronRight />
	{/if}

	<div
		class={`group hover:underline flex flex-row justify-between text-sm py-1 w-full text-left rounded-sm`}
	>
		{#if isEditing}
			<input
				class="text-left w-full max-w-full focus:outline-none bg-transparent"
				type="text"
				bind:value={folderName}
			/>
		{:else}
			<button
				class="text-left w-full"
				on:click={async () => {
					$fileOrFolderInFocus = {
						type: 'folder',
						id: folder.id
					};

					open = !open;
				}}
			>
				{folder.name}
			</button>
		{/if}
		<div class="flex flex-row gap-2 invisible group-hover:visible">
			{#if isEditing}
				<button
					title="Done"
					on:click={() => {
						isEditing = !isEditing;
						changeFolderName();
					}}
					><Checkmark />
				</button>
				<button
					title="Cancel"
					on:click={() => {
						isEditing = !isEditing;
						folderName = folder.name;
					}}
					><Close />
				</button>
			{:else}
				<button
					title="rename folder"
					on:click={() => {
						isEditing = !isEditing;
					}}
				>
					<Edit />
				</button>
				<button
					title="delete the folder and all its notes"
					on:click={async () => {
						$folders = $folders.filter((n) => n.id !== folder.id);

						// delete notes from the folders expand.notes array in pocketbase
						for (const note of $notes.filter((n) => n.folder_id === folder.id)) {
							await pocketbase.collection('notes').delete(note.id);

							$tabs = $tabs.filter((t) => t.id !== note.id);
						}

						await pocketbase.collection('folders').delete(folder.id);

						// if any tab is active, change to the first tab else go to home
						if ($tabs.length > 0) {
							$tabs = $tabs.map((t) => {
								if (t.id === $tabs[0].id) {
									return { ...t, active: true };
								}
								return { ...t, active: false };
							});

							await goto(`/${$tabs[0].id}`);
						} else {
							await goto('/');
						}
					}}><Delete /></button
				>
			{/if}
		</div>
	</div>
</div>

{#if open}
	<div
		class="flex flex-col ml-6 rounded-md"
		use:dndzone={{
			items: files,
			type: 'files',
			dropTargetStyle: {},
			dropTargetClasses: ['bg-gray-300']
		}}
		on:consider={(e) => {
			const { items, info } = e.detail;

			// console.log('consider folder ', info.trigger);
			if (info.trigger === 'draggedEntered') {
				open = true;
			}
			// else if (info.trigger === 'draggedLeft') {
			// 	open = false;
			// }

			files = items;
		}}
		on:finalize={async (e) => {
			const { items, info } = e.detail;
			// console.log('finalize folder ', info.trigger);

			if (info.trigger === 'droppedIntoZone') {
				$notes = $notes.map((n) => {
					if (items.find((i) => i.id === n.id)) {
						return { ...n, folder_id: folder.id };
					}
					return n;
				});

				items.map(
					async (i) =>
						await pocketbase.collection('notes').update(i.id, {
							folder_id: folder.id
						})
				);
				// console.log('droppedIntoZone ', $notes);
			}

			files = items;
		}}
	>
		{#each files as note (note.id)}
			<div animate:flip={{ duration: 300 }}>
				<File {note} />
			</div>
		{/each}
		{#if files.length === 0}
			<div class="py-3" />
		{/if}
	</div>
{/if}
