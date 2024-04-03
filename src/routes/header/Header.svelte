<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { currentUser, pocketbase } from '$lib';
	import { dndzone } from 'svelte-dnd-action';

	import { stringEncryptAsymmetric } from '$lib/crypto';
	import { notes, showSidebar, tabs } from '$lib/sidebar';
	import Add from 'carbon-icons-svelte/lib/Add.svelte';
	import Cross from 'carbon-icons-svelte/lib/Close.svelte';
	import OpenPanelRight from 'carbon-icons-svelte/lib/OpenPanelRight.svelte';

	import { onMount } from 'svelte';

	onMount(async () => {
		if ($page.params.slug) {
			$tabs = [
				...$tabs,
				{
					id: $page.params.slug,
					name: $notes.find((n) => n.id === $page.params.slug)?.title,
					active: true
				}
			];
		}
	});
</script>

<div
	class="bg-gray-50 flex flex-row gap-[2px]"
	use:dndzone={{ items: $tabs, flipDurationMs: 300 }}
	on:consider={(e) => {
		const { items, info } = e.detail;
		$tabs = items;
	}}
	on:finalize={(e) => {
		const { items, info } = e.detail;
		$tabs = items;
	}}
>
	{#each $tabs as tab (tab.id)}
		<div
			class={`flex flex-row items-center gap-2 ${
				tab.active ? 'bg-white' : 'bg-gray-100'
			} w-fit px-2 rounded-t-sm`}
		>
			<button
				on:click={// change to different tab
				async (e) => {
					$tabs = $tabs.map((t) => {
						if (t.id === tab.id) {
							return { ...t, active: true };
						}
						return { ...t, active: false };
					});

					goto(`/${tab.id}`);
				}}>{tab.name}</button
			>
			<!-- Remove tab button -->
			<button
				title="Close the tab"
				on:click={async () => {
					$tabs = $tabs.filter((t) => t.id !== tab.id);

					// if the tab is active, change to the first tab
					if (tab.active) {
						$tabs = $tabs.map((t) => {
							if (t.id === $tabs[0].id) {
								return { ...t, active: true };
							}
							return { ...t, active: false };
						});

						if ($tabs.length === 0) {
							await goto('/');
						} else {
							await goto(`/${$tabs[0].id}`);
						}
					}
				}}><Cross /></button
			>
		</div>
	{/each}
	{#if $tabs.length !== 0}
		<button
			title="Create new note"
			class="flex flex-row items-center gap-2 bg-gray-50 w-fit px-2 rounded-t-sm"
			on:click={async () => {
				const title = `Note #${$notes.length + 1}`;

				const encryptedNote = stringEncryptAsymmetric(
					localStorage.getItem('priv') || '',
					{ key: localStorage.getItem('pub') || '' },
					`# ${title} \n## Subtitle \n\nTo being with..`
				);

				const record = await pocketbase.collection('notes').create({
					title,
					note: encryptedNote,
					user_id: $currentUser?.id
				});

				$notes = [...$notes, record];

				// set all tabs to inactive
				$tabs = $tabs.map((t) => ({ ...t, active: false }));

				$tabs = [
					...$tabs,
					{
						id: record.id,
						name: record.title,
						active: true
					}
				];

				await goto(`/${record.id}`);
			}}
		>
			<Add />
		</button>
	{/if}
	{#if !$showSidebar}
		<button
			title="Open sidebar"
			class="ml-auto mr-5 p-[4px] bg-slate-50"
			on:click={() => {
				$showSidebar = !$showSidebar;
			}}
		>
			<OpenPanelRight />
		</button>
	{:else}
		&nbsp;
	{/if}
</div>
