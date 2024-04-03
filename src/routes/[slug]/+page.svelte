<script lang="ts">
	import CodeMirror from 'svelte-codemirror-editor';
	import { markdown } from '@codemirror/lang-markdown';
	import { pocketbase } from '$lib';
	import { stringEncryptAsymmetric, stringDecryptAsymmetric } from '$lib/crypto';
	import { onMount } from 'svelte';
	import { afterNavigate, beforeNavigate, onNavigate } from '$app/navigation';

	export let data;

	// onMount(() => {
		// console.log('onMount');
		// 	data.record.note = stringDecryptAsymmetric(
		// 		localStorage.getItem('priv') || '',
		// 		{ key: localStorage.getItem('pub') || '' },
		// 		data.record?.note
		// 	);
	// });

	afterNavigate(() => {
		// console.log('afterNavigate');
		data.record.note = stringDecryptAsymmetric(
			localStorage.getItem('priv') || '',
			{ key: localStorage.getItem('pub') || '' },
			data.record?.note
		);
	});
</script>

<svelte:head>
	<title>{data.record?.title}</title>
</svelte:head>

<div class="flex flex-row w-full h-full">
	<CodeMirror
		class="flex-auto"
		lang={markdown()}
		value={data.record.note}
		on:change={async (e) => {
			const encrypted = stringEncryptAsymmetric(
				localStorage.getItem('priv') || '',
				{ key: localStorage.getItem('pub') || '' },
				e.detail
			);
			await pocketbase.collection('notes').update(data.record?.id, { note: encrypted });
		}}
		styles={{
			'&': {
				height: '59.2rem', // TODD : perhaps calculate this for responsive
				width: '107rem'
			}
		}}
	/>
</div>
