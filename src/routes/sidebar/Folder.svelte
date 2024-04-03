<script lang="ts">
	import Delete from 'carbon-icons-svelte/lib/TrashCan.svelte';
	import ChevronRight from 'carbon-icons-svelte/lib/ChevronRight.svelte';
	import ChevronDown from 'carbon-icons-svelte/lib/ChevronDown.svelte';
	import Edit from 'carbon-icons-svelte/lib/Edit.svelte';
	import Checkmark from 'carbon-icons-svelte/lib/Checkmark.svelte';
	import Close from 'carbon-icons-svelte/lib/Close.svelte';

	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	import { notesdb } from '$lib';
	import { fileOrFolderInFocus, tabs } from '$lib/sidebar';
	import File from './File.svelte';
	import { goto } from '$app/navigation';
	import { liveQuery } from 'dexie';

	export let folder: any;

	let files: any[] = [];
	liveQuery(() => notesdb.notes.toArray()).subscribe((n) => {
		files = n.filter((n) => n.folder_id === folder.id);
	});

	let isEditing = false;
	let open = false;
	let folderName = folder.name;

	const changeFolderName = () => {
		notesdb.folders.update(folder.id, {
			name: folderName
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
				class="text-left w-full focus:outline-none underline bg-transparent text-xs sm:text-base"
				type="text"
				bind:value={folderName}
			/>
		{:else}
			<button
				class="text-left w-fit truncate text-xs sm:text-base"
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
		<div class="flex flex-row gap-1 sm:gap-2 invisible group-hover:visible">
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
						const notesList = await notesdb.notes
							.filter((n) => n.folder_id === folder.id)
							.toArray();
						for (const note of notesList) {
							await notesdb.notes.delete(note.id);

							$tabs = $tabs.filter((t) => t.id !== note.id);
						}

						await notesdb.folders.delete(folder.id);

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

			if (info.trigger === 'draggedEntered') {
				open = true;
			}

			files = items;
		}}
		on:finalize={async (e) => {
			const { items, info } = e.detail;

			if (info.trigger === 'droppedIntoZone') {
				items.map(async (i) => {
					await notesdb.notes.update(i.id, {
						folder_id: folder.id
					});
				});
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
