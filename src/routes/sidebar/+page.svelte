<script lang="ts">
	import DocumentAdd from 'carbon-icons-svelte/lib/DocumentAdd.svelte';
	import FolderAdd from 'carbon-icons-svelte/lib/FolderAdd.svelte';
	import OpenPanelRight from 'carbon-icons-svelte/lib/OpenPanelRight.svelte';
	import { currentUser, pocketbase } from '$lib';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { fileOrFolderInFocus, notes, folders, tabs, showSidebar } from '$lib/sidebar';

	import Folder from './Folder.svelte';
	import File from './File.svelte';
	import { goto } from '$app/navigation';
	import { stringEncryptAsymmetric } from '$lib/crypto';

	export let data;

	$notes = data.notes;
	$folders = data.folders;

	const removeFocus = (e: any) => {
		if (e.target.classList.contains('items-list')) {
			$fileOrFolderInFocus = {
				type: 'file',
				id: ''
			};
		}
	};

	let files = $notes.filter((n) => !n.folder_id);

	notes.subscribe((n) => {
		files = n.filter((n) => !n.folder_id);
	});
</script>


<!-- svelte-ignore a11y-no-static-element-interactions -->

<div
	class={`bg-gray-50 flex-none py-8 px-2 h-full max-sm:w-36 md:w-44 lg:w-52 overflow-y-auto border-l-[1px] border-l-gray-100 items-list `}
	style="display: {$showSidebar ? 'block' : 'none'}"
	on:click={removeFocus}
	on:keydown={(e) => {
		if (e.key === 'Escape') {
			$fileOrFolderInFocus = {
				type: 'file',
				id: ''
			};
		}
	}}
>
	<section class="flex flex-row items-center place-content-end gap-2 px-4">
		<button
			title="close sidebar"
			class="mr-auto mt-1"
			on:click={() => {
				$showSidebar = !$showSidebar;
			}}><OpenPanelRight /></button
		>
		<button
			title="Create new note"
			on:click={async () => {
				let record;

				const title = `Note #${$notes.length + 1}`;

				const encryptedNote = stringEncryptAsymmetric(
					localStorage.getItem('priv') || '',
					{ key: localStorage.getItem('pub') || '' },
					`# ${title} \n## Subtitle \n\nTo being with..`
				);

				if ($fileOrFolderInFocus.type === 'file') {
					record = await pocketbase.collection('notes').create({
						title,
						note: encryptedNote,
						user_id: $currentUser?.id
					});

					$notes = [...$notes, record];
				} else {
					record = await pocketbase.collection('notes').create({
						title,
						note: encryptedNote,
						user_id: $currentUser?.id,
						folder_id: $fileOrFolderInFocus.id
					});

					await pocketbase.collection('folders').update($fileOrFolderInFocus.id, {
						notes: $folders.find((f) => f.id === $fileOrFolderInFocus.id)?.notes
							? [...$folders.find((f) => f.id === $fileOrFolderInFocus.id)?.notes, record.id]
							: [record.id]
					});

					$notes = [...$notes, record];
				}

				// $fileOrFolderInFocus = {
				// 	type: 'file',
				// 	id: record.id
				// };

				$tabs = $tabs.map((t) => {
					return { ...t, active: false };
				});
				$tabs = [
					...$tabs,
					{
						id: record.id,
						name: record.title,
						active: true
					}
				];

				await goto(`/${record.id}`);
			}}><DocumentAdd /></button
		>
		<button
			title="Create new folder"
			on:click={async () => {
				const name = `Folder #${$folders.length + 1}`;

				const record = await pocketbase.collection('folders').create({
					name,
					user_id: $currentUser?.id
				});

				$folders = [...$folders, record];
			}}
		>
			<FolderAdd />
		</button>
	</section>
	<section class="px-2">
		<hr class="border-t-[1px] border-gray-100 my-5" />

		<div class="flex flex-col gap-1 list-decimal">
			{#each $folders as folder (folder.id)}
				<Folder {folder} />
			{/each}
			<section
				class="rounded-md"
				use:dndzone={{
					items: files,
					type: 'files',
					dropTargetStyle: {},
					dropTargetClasses: ['bg-gray-300']
				}}
				on:consider={(e) => {
					const { items, info } = e.detail;

					// console.log('consider ', info.trigger);
					// console.log('consider items ', items);

					files = items;
				}}
				on:finalize={async (e) => {
					const { items, info } = e.detail;

					// console.log('finalize ', info.trigger);

					files = items;

					if (info.trigger === 'droppedIntoZone') {
						$notes = $notes.map((n) => {
							if (items.find((i) => i.id === n.id)) {
								return { ...n, folder_id: '' };
							}
							return n;
						});

						items.map(
							async (i) =>
								await pocketbase.collection('notes').update(i.id, {
									folder_id: ''
								})
						);
					}

					// console.log('finalize notes ', $notes);
				}}
			>
				{#if files.length === 0}
					<div class="py-3" />
				{/if}
				{#each files as note (note.id)}
					<div animate:flip={{ duration: 300 }}>
						<File {note} />
					</div>
				{/each}
			</section>
		</div>
	</section>
</div>
