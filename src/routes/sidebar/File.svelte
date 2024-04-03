<script lang="ts">
	import Delete from 'carbon-icons-svelte/lib/TrashCan.svelte';
	import Edit from 'carbon-icons-svelte/lib/Edit.svelte';

	import { fileOrFolderInFocus, tabs, notes } from '$lib/sidebar';
	import { pocketbase } from '$lib';
	import { goto, preloadCode, preloadData } from '$app/navigation';
	import { page } from '$app/stores';

	export let note: any;
	let isEditing = false;
</script>

<div
	class={`flex flex-row items-center gap-1 ${
		note.id === $page.params.slug && $fileOrFolderInFocus.type === 'file'
			? 'bg-slate-200'
			: 'bg-slate-100'
	} rounded-md pr-2`}
>
	<Delete class="invisible" />
	<div
		class={`group hover:underline flex flex-row justify-between text-sm py-1 w-full text-left rounded-sm`}
	>
		{#if isEditing}
			<input
				class="text-left w-full max-w-full focus:outline-none bg-transparent"
				type="text"
				bind:value={note.title}
				on:change={(e) => {
					pocketbase.collection('notes').update(note.id, {
						title: e?.target?.value
					});

					$notes = $notes.map((n) => {
						if (n.id === note.id) {
							return { ...n, title: e?.target?.value };
						}
						return n;
					});

					$tabs = $tabs.map((t) => {
						if (t.id === note.id) {
							return { ...t, name: e?.target?.value };
						}
						return t;
					});
				}}
				on:blur={() => {
					isEditing = false;
				}}
			/>
		{:else}
			<button
				class="text-left w-full truncate"
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
		<div class="flex flex-row gap-2 invisible group-hover:visible">
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
						if ($tabs.length > 1) {
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
			>
		</div>
	</div>
</div>
