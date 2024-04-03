<script lang="ts">
	import CodeMirror from 'svelte-codemirror-editor';
	import { markdown } from '@codemirror/lang-markdown';
	import { pocketbase } from '$lib';
	import { stringEncryptAsymmetric, stringDecryptAsymmetric } from '$lib/crypto';
	import { onMount } from 'svelte';

	export let data;
	let note = '';

	onMount(() => {
		note = stringDecryptAsymmetric(
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
		value={note}
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
				height: '100%', // TODD : perhaps calculate this for responsive
				maxHeight: '100%',
				width: '100%',
				maxWidth: '100%'
			}
		}}
	/>
</div>
