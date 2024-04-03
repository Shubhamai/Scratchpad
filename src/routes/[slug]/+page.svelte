<script lang="ts">
	import CodeMirror from 'svelte-codemirror-editor';
	import { markdown } from '@codemirror/lang-markdown';
	import { pocketbase } from '$lib';

	export let data;
</script>

<div class="flex flex-row">

	<CodeMirror
		class="flex-auto"
		lang={markdown()}
		value={data.record?.note}
		on:change={async (e) => {
			await pocketbase.collection('notes').update(data.record?.id, { note: e.detail });
		}}
		styles={{
			'&': {
				height: '59.2rem', // TODD : perhaps calculate this for responsive
				width: '107rem'
			}
		}}
	/>
	>
</div>
