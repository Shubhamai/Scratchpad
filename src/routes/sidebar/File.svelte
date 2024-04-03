<script lang="ts">
	import Delete from 'carbon-icons-svelte/lib/TrashCan.svelte';

	import { fileOrFolderInFocus, tabs, notes } from '$lib/sidebar';
	import { pocketbase } from '$lib';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	export let note: any;
</script>

<div
	class={`flex flex-row items-center gap-1 ${
		// note.id === $fileOrFolderInFocus.id
		// 	? 'bg-slate-200'
		// :
		note.id === $page.params.slug ? 'bg-slate-200' : 'bg-slate-100'

		// ""
	} rounded-md pr-2`}
>
	<Delete class="invisible" />
	<div
		class={`group hover:underline flex flex-row justify-between text-sm py-1 w-full text-left rounded-sm`}
	>
		<button
			class="text-left w-full"
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

		<!-- Delete note button -->
		<div class="flex flex-row gap-2 invisible group-hover:visible">
			<button
				on:click={async () => {
					$notes = $notes.filter((n) => n.id !== note.id);

					await pocketbase.collection('notes').delete(note.id);

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
