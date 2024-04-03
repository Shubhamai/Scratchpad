<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { notes, tabs } from '$lib/sidebar';
	import Cross from 'carbon-icons-svelte/lib/Close.svelte';
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

<div class="bg-slate-200 flex flex-row gap-[2px]">
	{#if $tabs.length === 0}
		<div class="w-full px-2 text-center">Notes</div>
	{/if}
	{#each $tabs as tab (tab.id)}
		<div
			class={`flex flex-row items-center gap-2 ${
				tab.active ? 'bg-white' : 'bg-slate-100'
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
</div>
