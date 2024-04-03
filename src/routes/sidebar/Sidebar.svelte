<script lang="ts">
	import DocumentAdd from 'carbon-icons-svelte/lib/DocumentAdd.svelte';
	import Delete from 'carbon-icons-svelte/lib/TrashCan.svelte';
	import FolderAdd from 'carbon-icons-svelte/lib/FolderAdd.svelte';
	import { currentUser, pocketbase } from '$lib';

	import { onDestroy, onMount } from 'svelte';
	import { tabs } from '$lib/tabs';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// add 100 lines in the start of message
	let notes: any[] = [];
	let unsubscribe: () => void;

	onMount(async () => {
		// Get initial messages
		notes = (
			await pocketbase.collection('notes').getList(1, 50, {
				sort: 'created'
			})
		).items;

		// add the current page in the tabs
		if ($page.params.slug) {
			$tabs = [
				...$tabs,
				{
					id: $page.params.slug,
					name: notes.find((n) => n.id === $page.params.slug)?.title,
					active: true
				}
			];
		}

		// Subscribe to realtime messages
		unsubscribe = await pocketbase
			.collection('notes')
			.subscribe('*', async ({ action, record }) => {
				if (action === 'create') {
					notes = [...notes, record];
				}
				// TODO : Some bug here that doesn't sometimes detect the delete action, perhaps because something else has also subscribed
				if (action === 'delete') {
					notes = notes.filter((m) => m.id !== record.id);
				}
			});
	});

	// Unsubscribe from realtime messages
	onDestroy(() => {
		unsubscribe?.();
	});
</script>

<div class="flex-none py-8 px-2 w-52 h-full overflow-y-auto overflow-auto bg-slate-100">
	<section class="flex flex-row place-content-end gap-2 px-4">
		<button
			on:click={async () => {
				await pocketbase.collection('notes').create({
					title: 'New File',
					note: '',
					user_id: $currentUser?.id
				});
			}}><DocumentAdd /></button
		>
		<button>
			<!-- TODO -->
			<FolderAdd />
		</button>
	</section>
	<hr class="border-slate-300 my-4 mx-4" />
	<div class="px-4 flex flex-col gap-1 list-decimal">
		{#each notes as note (note.id)}
			<div
				class={`group hover:underline flex flex-row justify-between ${
					note.id === $page.params.slug ? 'bg-slate-200' : 'bg-slate-100'
				} text-sm px-2 py-1 w-full text-left rounded-sm`}
			>
				<button
					class="text-left w-full"
					on:click={async () => {
						// check if tab with same id exists
						const alreadyOpenedTab = $tabs.find((t) => t.id === note.id);
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
							await pocketbase.collection('notes').delete(note.id);
							notes = notes.filter((n) => n.id !== note.id);

							// if the tab is active, close it
							const activeTab = $tabs.find((t) => t.active);
							if (activeTab?.id === note.id) {
								$tabs = $tabs.filter((t) => t.id !== note.id);

								// if there si another tab, set that as active
								if ($tabs.length > 1) {
									// change the first tab to active,
									$tabs = [...$tabs.filter((e, i) => i !== 0), { ...$tabs[0], active: true }];
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
		{/each}
	</div>
</div>
