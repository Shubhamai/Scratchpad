<script lang="ts">
	import CodeMirror from 'svelte-codemirror-editor';
	import { markdown } from '@codemirror/lang-markdown';
	import DocumentAdd from 'carbon-icons-svelte/lib/DocumentAdd.svelte';

	// add 100 lines in the start of message
	let value = '\n '.repeat(100);
</script>

<!-- TODO : Entiler frame should be editable, no [enterrr] in the main frame to create new line -->

<div class="flex flex-row">
	<div class="flex-auto flex flex-col h-[60rem]">
		<div class="bg-slate-100">Tabs</div>
		<div class="flex flex-row">
			<!-- max height screen  -->
			<!-- <CodeMirror
				class="flex-auto"
				lang={markdown()}
				{value}
				styles={{
					'&': {
						maxHeight: '59rem' // 96vh
					}
				}}
			/> -->

			<CodeMirror
				class="flex-auto"
				lang={markdown()}
				{value}
				styles={{
					'&': {
						height: '59rem', // perhaps calculate this for responsive
						width: '107rem'
					}
				}}
			/>
		</div>
		<div class="bg-slate-100">Footer</div>
	</div>
	<div class="flex-none py-8 px-2 w-52 h-screen overflow-y-auto overflow-auto">
		<section class="flex flex-col items-end px-6">
			<button><DocumentAdd /></button>
		</section>
		<hr class="border-slate-300 my-4 mx-4" />
		<ul class="mx-8 flex flex-col gap-2 list-decimal">
			<li><button class="hover:underline">File 1</button></li>
			<li><button class="hover:underline">File 2</button></li>
		</ul>
	</div>
</div>
