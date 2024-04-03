<script lang="ts">
	import toast_ from 'svelte-french-toast';
	import { currentUser, notesdb, pocketbase } from '$lib/index';
	import { nanoid } from 'nanoid';
	import 'dexie-export-import';

	export let toast;
	// export let someProp: any;

	let isAuthValid = pocketbase.authStore.isValid;

	pocketbase.authStore.onChange(async (auth) => {
		isAuthValid = pocketbase.authStore.isValid;
		$currentUser = pocketbase.authStore.model;
	});
</script>

<span class="flex flex-col gap-2">
	{#if isAuthValid}
		<p class="text-sm">If you like to disable sync and delete cloud data, click here:</p>
	{:else}
		<p class="text-sm">If you like to enable sync, click here:</p>
	{/if}
	<div class="flex flex-row justify-between">
		{#if isAuthValid}
			<button
				class="bg-red-500 text-white rounded-md w-fit p-2 text-xs"
				on:click={async () => {
					await pocketbase.collection('users').delete($currentUser?.id);

					pocketbase.authStore.clear();
				}}>Disable Sync & Delete Data</button
			>
		{:else}
			<button
				class="bg-gray-400 text-white rounded-md w-fit p-2 text-xs"
				on:click={async () => {
					const username = nanoid(10);
					const password = nanoid(12);

					await pocketbase.collection('users').create({
						username: username,
						password: password,
						passwordConfirm: password
					});
					await pocketbase.collection('users').authWithPassword(username, password);

					await pocketbase.collection('users').authRefresh();

					const blob = await notesdb.export({ prettyJson: true });

					const file = new File([blob], 'notesdb.json', {
						type: 'application/json'
					});

					const formData = new FormData();
					formData.append('id', $currentUser?.id);
					formData.append('db', file);
					formData.append('user_id', $currentUser?.id);

					await pocketbase.collection('sync').create(formData);
				}}>Enable Online Sync</button
			>
		{/if}

		<button
			class="bg-gray-100 rounded-md w-fit p-2 text-xs"
			on:click={() => toast_.dismiss(toast.id)}
		>
			Dismiss
		</button>
	</div>
</span>
