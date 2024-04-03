<script lang="ts">
	import DocumentAdd from 'carbon-icons-svelte/lib/DocumentAdd.svelte';
	import FolderAdd from 'carbon-icons-svelte/lib/FolderAdd.svelte';
	import OpenPanelRight from 'carbon-icons-svelte/lib/OpenPanelRight.svelte';
	import { currentUser, notesdb, pocketbase, type Folders, type Notes } from '$lib';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { fileOrFolderInFocus, tabs, showSidebar } from '$lib/sidebar';
	import keystore from 'keystore-idb';

	import Folder from './Folder.svelte';
	import File from './File.svelte';
	import { goto } from '$app/navigation';
	import { nanoid } from 'nanoid';
	import { liveQuery } from 'dexie';
	import { compareArrays } from '$lib/utils';

	let files: Notes[] = [];
	let folders: Folders[] = [];
	let filteredFiles: Notes[] = [];

	// TODO : This shouldn't be necessary
	let firstRunNotes = true;
	let firstRunFolders = true;

	liveQuery(() => notesdb.notes.toArray()).subscribe((latestNotes) => {
		const comparisonResults = compareArrays(files, latestNotes);

		files = latestNotes;
		filteredFiles = latestNotes.filter((n) => !n.folder_id);

		if (firstRunNotes) {
			firstRunNotes = false;
			return;
		}

		comparisonResults.missingInNew.map(async (f) => {
			await pocketbase.collection('notes').delete(f.id);
		});
		comparisonResults.missingInOld.map(async (f) => {
			await pocketbase.collection('notes').create(f);
		});
		comparisonResults.updated.map(async (f) => {
			await pocketbase.collection('notes').update(f.new.id, f.new);
		});
	});

	liveQuery(() => notesdb.folders.toArray()).subscribe((latestFolders) => {
		const comparisonResults = compareArrays(folders, latestFolders);

		folders = latestFolders;

		if (firstRunFolders) {
			firstRunFolders = false;
			return;
		}

		comparisonResults.missingInNew.map(async (f) => {
			await pocketbase.collection('folders').delete(f.id);
		});
		comparisonResults.missingInOld.map(async (f) => {
			await pocketbase.collection('folders').create(f);
		});
		comparisonResults.updated.map(async (f) => {
			await pocketbase.collection('folders').update(f.new.id, f.new);
		});
	});

	const removeFocus = (e: any) => {
		if (e.target.classList.contains('items-list')) {
			$fileOrFolderInFocus = {
				type: 'file',
				id: ''
			};
		}
	};
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

				const title = `Note #${(await notesdb.notes.count()) + 1}`;

				const ks1 = await keystore.init({ storeName: 'keystore' });
				const ks2 = await keystore.init({ storeName: 'keystore2' });

				const exchangeKey2 = await ks2.publicExchangeKey();

				const encryptedNote = await ks1.encrypt(
					`# ${title} \n## Subtitle \n\nTo being with..`,
					exchangeKey2
				);

				if ($fileOrFolderInFocus.type === 'file') {
					record = {
						id: nanoid(15),
						title,
						note: encryptedNote,
						user_id: $currentUser?.id,
						created: new Date().toISOString(),
						updated: new Date().toISOString(),
						folder_id: ''
					};
					await notesdb.notes.add(record);
				} else {
					record = {
						id: nanoid(15),
						title,
						note: encryptedNote,
						user_id: $currentUser?.id,
						folder_id: $fileOrFolderInFocus.id,
						created: new Date().toISOString(),
						updated: new Date().toISOString()
					};
					await notesdb.notes.add(record);
				}

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
				const name = `Folder #${(await notesdb.folders.count()) + 1}`;

				const record = {
					id: nanoid(15),
					name,
					user_id: $currentUser?.id,
					created: new Date().toISOString(),
					updated: new Date().toISOString()
				};
				await notesdb.folders.add(record);
			}}
		>
			<FolderAdd />
		</button>
	</section>
	<section class="px-2">
		<hr class="border-t-[1px] border-gray-100 my-5" />

		<div class="flex flex-col gap-1 list-decimal">
			{#each folders as folder (folder.id)}
				<Folder {folder} />
			{/each}
			<section
				class="rounded-md"
				use:dndzone={{
					items: filteredFiles,
					type: 'files',
					dropTargetStyle: {},
					dropTargetClasses: ['bg-gray-300']
				}}
				on:consider={(e) => {
					const { items, info } = e.detail;

					filteredFiles = items;
				}}
				on:finalize={async (e) => {
					const { items, info } = e.detail;

					filteredFiles = items;

					if (info.trigger === 'droppedIntoZone') {
						items.map(async (i) => {
							await notesdb.notes.update(i.id, {
								folder_id: ''
							});
						});
					}
				}}
			>
				{#if filteredFiles.length === 0}
					<div class="py-3" />
				{/if}
				{#each filteredFiles as note (note.id)}
					<File {note} />
				{/each}
			</section>
		</div>
	</section>
</div>
