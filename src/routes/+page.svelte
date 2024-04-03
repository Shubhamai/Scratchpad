<script>
	import { pocketbase } from '$lib';
</script>

<div class="p-4 justify-center items-center mx-auto my-auto">
	This is a temporary notepad, all the data will be stored encrypted in a database with end-to-end
	encryption. The data will be automatically deleted if left inactive for 60 days.

	<!-- <br /><br />
	To save your data permanently, consider setting up username and password in the settings. -->

	<br /><br />
	The project is currently being developed day by day, so expect bugs and missing features.
	<br /><br />

	Roadmap <br />
	- Folder support<br />
	- Drag and drop files in sidebar<br />
	- Split window and drag and drop notes in split windows<br />
	- Versoning<br />
	- End to end encryption<br />
	- Sharing & Export Data <br />
	- Saving data permanently with accounts.<br />
	<div class="flex flex-row gap-2 items-center">
		- Send us your ideas & feedback here : <form
			on:submit={async (e) => {
				await pocketbase.collection('feedback').create({
					feedback: e.target[0].value
				});
			}}
		>
			<input class="border-2 border-slate-100 rounded-sm" />
		</form>
	</div>
</div>
