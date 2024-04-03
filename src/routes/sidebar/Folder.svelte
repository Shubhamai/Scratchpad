<script lang="ts">
	import Delete from 'carbon-icons-svelte/lib/TrashCan.svelte';
	import ChevronRight from 'carbon-icons-svelte/lib/ChevronRight.svelte';
	import ChevronDown from 'carbon-icons-svelte/lib/ChevronDown.svelte';

	import { pocketbase } from '$lib';
	import { fileOrFolderInFocus, folders, notes, tabs } from '$lib/sidebar';
	import File from './File.svelte';
	import { goto } from '$app/navigation';

	export let folder: any;
	
	let open = false;
</script>

<div
	class={`flex flex-row items-center gap-1 rounded-md pr-2 ${
		$fileOrFolderInFocus.id === folder.id ? 'bg-slate-200' : 'bg-slate-100'
	}`}
>
	<!-- <Delete class="" /> -->
	{#if open}
		<ChevronDown />
	{:else}
		<ChevronRight />
	{/if}

	<div
		class={`group hover:underline flex flex-row justify-between text-sm py-1 w-full text-left rounded-sm`}
	>
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

		<div class="flex flex-row gap-2 invisible group-hover:visible">
			<button
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
		</div>
	</div>
</div>

{#if open}
	<div class="flex flex-col ml-6">
		{#each $notes.filter((n) => n.folder_id === folder.id) as note}
			<File {note} />
		{/each}
	</div>
{/if}
