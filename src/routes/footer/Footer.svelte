<script lang="ts">
	import { page } from '$app/stores';
	// import { pocketbase } from '$lib';
	import { onMount } from 'svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import updateLocale from 'dayjs/plugin/updateLocale';
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
	// onMount(async () => {
	// 	page.subscribe(async (value) => {
	// 		if (value.params.slug) {
	// 			const record = await pocketbase.collection('notes').getOne(value.params.slug);
	// 			timeFromNow = dayjs(record.updated).fromNow();

	// 			await pocketbase.collection('notes').subscribe(record.id, async ({ action, record }) => {
	// 				timeFromNow = dayjs(record.updated).fromNow();
	// 			});
	// 		}
	// 	});
	// });
</script>

<div class="bg-gray-50 border-t-gray-100 border-t-[2px] flex flex-row items-center justify-end">
	{#if $page.params.slug && timeFromNow}
		<p class="text-right pr-20 sm:pr-56 text-sm">{timeFromNow}</p>
	{:else}
		<p class="text-right text-sm">&nbsp;</p>
	{/if}
</div>
