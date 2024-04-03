<script lang="ts">
	import DocumentAdd from 'carbon-icons-svelte/lib/DocumentAdd.svelte';
	import Delete from 'carbon-icons-svelte/lib/TrashCan.svelte';
	import { currentUser, pocketbase } from '$lib';
	import { nanoid } from 'nanoid';

	import { onDestroy, onMount } from 'svelte';

	// add 100 lines in the start of message
	let messages: any[] = [];
	let unsubscribe: () => void;
	
	onMount(async () => {
		// Get initial messages
		messages = (
			await pocketbase.collection('notes').getList(1, 50, {
				sort: 'created'
			})
		).items;

		// Subscribe to realtime messages
		unsubscribe = await pocketbase
			.collection('notes')
			.subscribe('*', async ({ action, record }) => {
				if (action === 'create') {
					messages = [...messages, record];
				}
				if (action === 'delete') {
					messages = messages.filter((m) => m.id !== record.id);
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
				console.log($currentUser);
				await pocketbase.collection('notes').create({
					title: nanoid(7),
					note: 'test_title',
					user_id: $currentUser?.id
				});
			}}><DocumentAdd /></button
		>
	</section>
	<hr class="border-slate-300 my-4 mx-4" />
	<div class="px-4 flex flex-col gap-1 list-decimal">
		{#each messages as message}
			<div
				class="group hover:underline flex flex-row justify-between text-sm hover:bg-slate-100 w-full text-left rounded-sm"
			>
				<a href={`/${message.id}`}>{message.title}</a><button
					on:click={async () => {
						await pocketbase.collection('notes').delete(message.id);
					}}><Delete class="invisible group-hover:visible" /></button
				>
			</div>
		{/each}
	</div>
</div>
