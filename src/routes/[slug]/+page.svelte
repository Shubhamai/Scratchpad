<script lang="ts">
	import CodeMirror from 'svelte-codemirror-editor';
	import { markdown } from '@codemirror/lang-markdown';
	import { pocketbase } from '$lib';
	import { stringEncryptAsymmetric, stringDecryptAsymmetric } from '$lib/crypto';
	import { onMount } from 'svelte';
	import { afterNavigate, beforeNavigate, onNavigate } from '$app/navigation';
	import { showSidebar } from '$lib/sidebar.js';
	import keystore from 'keystore-idb';
	import type { KeyStore } from 'keystore-idb/lib/types.js';

	export let data;
	let note = '';

	let ks1: null | KeyStore;
	let ks2: null | KeyStore;

	afterNavigate(async () => {
		ks1 = await keystore.init({ storeName: 'keystore' });
		ks2 = await keystore.init({ storeName: 'keystore2' });

		const exchangeKey1 = await ks1.publicExchangeKey();

		note = await ks2.decrypt(data.record?.note, exchangeKey1);
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
	value={note}
	on:change={async (e) => {
		if (!ks1 || !ks2) {
			ks1 = await keystore.init({ storeName: 'keystore' });
			ks2 = await keystore.init({ storeName: 'keystore2' });
		}
		const exchangeKey2 = await ks2.publicExchangeKey();
		const cipher = await ks1.encrypt(e.detail, exchangeKey2);

		await pocketbase.collection('notes').update(data.record?.id, { note: cipher });
	}}
	styles={{ '&': styleObj }}
/>
