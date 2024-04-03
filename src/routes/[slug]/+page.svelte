<script lang="ts">
	import CodeMirror from 'svelte-codemirror-editor';
	import { markdown } from '@codemirror/lang-markdown';
	import { pocketbase } from '$lib';

	export let data;
</script>

<div class="flex flex-row w-full h-full">
	<CodeMirror
		class="flex-auto"
		lang={markdown()}
		value={data.record?.note}
		on:change={async (e) => {
			await pocketbase.collection('notes').update(data.record?.id, { note: e.detail });
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
