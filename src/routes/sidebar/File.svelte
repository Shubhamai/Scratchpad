<script lang="ts">
	import Delete from 'carbon-icons-svelte/lib/TrashCan.svelte';
	import Edit from 'carbon-icons-svelte/lib/Edit.svelte';
	import Checkmark from 'carbon-icons-svelte/lib/Checkmark.svelte';
	import Close from 'carbon-icons-svelte/lib/Close.svelte';
	import Draggable from 'carbon-icons-svelte/lib/Draggable.svelte';

	import { fileOrFolderInFocus, tabs, notes } from '$lib/sidebar';
	import { pocketbase } from '$lib';
	import { goto, preloadCode, preloadData } from '$app/navigation';
	import { page } from '$app/stores';

	export let note: any;
	let isEditing = false;

	let noteTitle = note.title;
	const changeFileName = () => {
		pocketbase.collection('notes').update(note.id, {
			title: noteTitle
		});

		$notes = $notes.map((n) => {
			if (n.id === note.id) {
				return { ...n, title: noteTitle };
			}
			return n;
		});

		$tabs = $tabs.map((t) => {
			if (t.id === note.id) {
				return { ...t, name: noteTitle };
			}
			return t;
		});
	};
</script>

<div
	class={`group flex flex-row items-center gap-1 ${
		note.id === $page.params.slug && $fileOrFolderInFocus.type === 'file' ? 'bg-gray-100' : ''
	} rounded-md pr-2`}
>
	<Draggable class="invisible group-hover:visible stroke-gray-50" />
	<div
		class={`group hover:underline flex flex-row justify-between text-sm py-1 w-full text-left rounded-sm `}
	>
		{#if isEditing}
			<input
				class="text-left focus:outline-none underline bg-transparent"
				type="text"
				bind:value={noteTitle}
			/>
		{:else}
			<button
				class="text-left w-full truncate text-xs sm:text-base"
				on:mouseover={() => {
					preloadData(`/${note.id}`);
					preloadCode(`/${note.id}`);
				}}
				on:focus={() => {
					preloadData(`/${note.id}`);
					preloadCode(`/${note.id}`);
				}}
				on:click={async () => {
					// check if tab with same id exists
					const alreadyOpenedTab = $tabs.find((t) => t.id === note.id);

					$fileOrFolderInFocus = {
						type: 'file',
						id: note.id
					};

					if (alreadyOpenedTab) {
						// if exists, make it active
						$tabs = $tabs.map((t) => {
							if (t.id === alreadyOpenedTab.id) {
								return { ...t, active: true };
							}
							return { ...t, active: false };
						});
					} else {
						// make every other tab inactive
						$tabs = $tabs.map((t) => {
							return { ...t, active: false };
						});

						$tabs = [
							...$tabs,
							{
								id: note.id,
								name: note.title,
								active: true
							}
						];
					}

					await goto(`/${note.id}`);
				}}
			>
				{note.title}
			</button>
		{/if}

		<!-- Delete note button -->
		<div class="flex flex-row gap-1 sm:gap-2 invisible group-hover:visible">
			{#if isEditing}
				<button
					title="Done"
					on:click={() => {
						isEditing = !isEditing;
						changeFileName();
					}}
					><Checkmark />
				</button>
				<button
					title="Cancel"
					on:click={() => {
						isEditing = !isEditing;
						noteTitle = note.title;
					}}
					><Close />
				</button>
			{:else}
				<button
					title="rename note"
					on:click={() => {
						isEditing = !isEditing;
					}}
				>
					<Edit />
				</button>
				<button
					title="Delete note"
					on:click={async () => {
						$notes = $notes.filter((n) => n.id !== note.id);

						pocketbase.collection('notes').delete(note.id);

						// if the tab is active, close it
						const activeTab = $tabs.find((t) => t.active);
						if (activeTab?.id === note.id) {
							$tabs = $tabs.filter((t) => t.id !== note.id);

							// if there si another tab, set that as active
							if ($tabs.length > 0) {
								// change the first tab to active,
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
						} else {
							// if the tab is not active, just remove it
							$tabs = $tabs.filter((t) => t.id !== note.id);
						}
					}}><Delete /></button
				>{/if}
		</div>
	</div>
</div>
