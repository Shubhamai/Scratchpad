<script lang="ts">
	import { page } from '$app/stores';
	import { currentUser, notesdb, pocketbase } from '$lib';
	import { Cloud } from 'carbon-icons-svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import updateLocale from 'dayjs/plugin/updateLocale';
	import CloudToast from './CloudToast.svelte';
	import toast, { Toaster } from 'svelte-french-toast';

	dayjs.extend(relativeTime);
	dayjs.extend(updateLocale);

	dayjs.updateLocale('en', {
		relativeTime: {
			future: 'in %s',
			past: '%s ago',
			s: '%d seconds',
			m: 'a minute',
			mm: '%d minutes',
			h: 'an hour',
			hh: '%d hours',
			d: 'a day',
			dd: '%d days',
			M: 'a month',
			MM: '%d months',
			y: 'a year',
			yy: '%d years'
		}
	});

	let timeFromNow: string;
	let isOnline: boolean = window.navigator.onLine ? true : false;

	window.addEventListener('online', async () => {
		const blob = await notesdb.export({ prettyJson: true });

		const file = new File([blob], 'notesdb.json', {
			type: 'application/json'
		});

		const formData = new FormData();
		formData.append('db', file);

		await pocketbase.collection('sync').update($currentUser?.id, formData);

		isOnline = true;
	});
	window.addEventListener('offline', () => (isOnline = false));

	// TOOD : Able to delete cloud data & disable cloud sync, or change the database link
</script>

<Toaster />
<div
	class="bg-gray-50 border-t-gray-100 border-t-[2px] flex flex-row gap-2 items-center justify-end pr-20 sm:pr-52"
>
	<button
		on:click={async () => {
			toast(CloudToast, { position: 'bottom-right', duration: 5000 });
			// toast.success('Syncing...');
		}}><Cloud /></button
	>
	{#if $page.params.slug && timeFromNow}
		<p>{timeFromNow}</p>
	{:else}
		<p>&nbsp;</p>
	{/if}
	{#if isOnline}
		<p>Online</p>
	{:else}
		<p>Offline</p>
	{/if}
</div>
