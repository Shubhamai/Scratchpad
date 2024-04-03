<script lang="ts">
	import CodeMirror from 'svelte-codemirror-editor';
	import { markdown } from '@codemirror/lang-markdown';
	import { pocketbase } from '$lib';
	import { stringEncryptAsymmetric, stringDecryptAsymmetric } from '$lib/crypto';
	import { onMount } from 'svelte';
	import { afterNavigate, beforeNavigate, onNavigate } from '$app/navigation';
	import { showSidebar } from '$lib/sidebar.js';

	export let data;

	afterNavigate(() => {
		// console.log('afterNavigate');
		data.record.note = stringDecryptAsymmetric(
			localStorage.getItem('priv') || '',
			{ key: localStorage.getItem('pub') || '' },
			data.record?.note
		);
	});

	let styleObj = {
		height: 'calc(100vh - 2.9rem)',
		width: `calc(100vw - 13rem)`
	};

	onMount(() => {
		const handleResize = () => {
			showSidebar.subscribe((v) => {
				if (v) {
					if (window.innerWidth >= 1024) {
						styleObj = {
							...styleObj,
							width: `calc(100vw - 13rem)`
						};
					} else if (window.innerWidth >= 768) {
						styleObj = {
							...styleObj,
							width: `calc(100vw - 11rem)`
						};
					} else {
						styleObj = {
							...styleObj,
							width: `calc(100vw - 9rem)`
						};
					}
				} else {
					styleObj = {
						...styleObj,
						width: `100vw`
					};
				}
			});

			// Assuming 768px as a breakpoint for tablet devices. Adjust as needed.
			if ($showSidebar) {
				if (window.innerWidth >= 1024) {
					styleObj = {
						...styleObj,
						width: `calc(100vw - 13rem)`
					};
				} else if (window.innerWidth >= 768) {
					styleObj = {
						...styleObj,
						width: `calc(100vw - 11rem)`
					};
				} else {
					styleObj = {
						...styleObj,
						width: `calc(100vw - 9rem)`
					};
				}
			} else {
				styleObj = {
					...styleObj,
					width: `100vw`
				};
			}
		};

		window.addEventListener('resize', handleResize);
		handleResize(); // Call once on mount to set initial styles

		return () => window.removeEventListener('resize', handleResize); // Cleanup on destroy
	});
</script>

<svelte:head>
	<title>{data.record?.title}</title>
</svelte:head>

<CodeMirror
	class="editor-wrapper"
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
	styles={{ '&': styleObj }}
/>
<!-- styles={{
	'&': {
		// height: '59.2rem', // TODD : perhaps calculate this for responsive
		height: 'calc(100vh - 2.9rem)',
		// width: '107rem'
		// change width based on this tialwind side changes sm:w-20 md:w-44 lg:w-52
		width: `calc(100vw - 13rem)` // 13, 11, 5, 2.5
	}
}} -->
