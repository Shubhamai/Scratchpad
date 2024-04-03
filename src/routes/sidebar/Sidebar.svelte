<script lang="ts">
	import DocumentAdd from 'carbon-icons-svelte/lib/DocumentAdd.svelte';
	import Delete from 'carbon-icons-svelte/lib/TrashCan.svelte';
	import Edit from 'carbon-icons-svelte/lib/Edit.svelte';
	import { currentUser, pocketbase } from '$lib';
	import { nanoid } from 'nanoid';

	import { onDestroy, onMount } from 'svelte';
	import { tabs } from '$lib/tabs';
	import { goto } from '$app/navigation';

	// add 100 lines in the start of message
	let notes: any[] = [];
	let unsubscribe: () => void;
	let editing = false;

	function edit(event) {
		//update db functionality goes here
		//alert("you've 'submitted' your edit")
	}

	onMount(async () => {
		// Get initial messages
		notes = (
			await pocketbase.collection('notes').getList(1, 50, {
				sort: 'created'
			})
		).items;

		// Subscribe to realtime messages
		unsubscribe = await pocketbase
			.collection('notes')
			.subscribe('*', async ({ action, record }) => {
				if (action === 'create') {
					notes = [...notes, record];
				}
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
	<section class="flex flex-col items-end px-6">
		<button
			on:click={async () => {
				await pocketbase.collection('notes').create({
					title: 'New File',
					note: '',
					user_id: $currentUser?.id
				});
			}}><DocumentAdd /></button
		>
	</section>
	<hr class="border-slate-300 my-4 mx-4" />
	<div class="px-4 flex flex-col gap-1 list-decimal">
		{#each notes as note}
			<div
				class="group hover:underline flex flex-row justify-between text-sm hover:bg-slate-100 w-full text-left rounded-sm"
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

							// if the tab is active, close it
							const activeTab = $tabs.find((t) => t.active);
							if (activeTab?.id === note.id) {
								$tabs = $tabs.filter((t) => t.id !== note.id);

								// if there si another tab, set that as active
								if ($tabs.length > 0) {
									$tabs = [{ ...$tabs[0], active: true }];
									await goto(`/${$tabs[0].id}`);
								} else {
									await goto('/');
								}
							}
						}}><Delete /></button
					>
				</div>
			</div>
		{/each}
	</div>
</div>
