<script>
	import { pocketbase } from '$lib';

	let feedbackSentMessage = '';
</script>

<div class="p-4 justify-center items-center mx-auto my-auto text-sm sm:text-sm md:text-base">
	This is a temporary notepad, all the data will be stored encrypted in a database with end-to-end
	encryption. The data will be automatically deleted if left inactive for 60 days.

	<!-- <br /><br />
	To save your data permanently, consider setting up username and password in the settings. -->

	<br /><br />
	The project is currently being developed day by day, so expect bugs and missing features.
	<br /><br />

	Roadmap <br />
	- End to end encryption<br />
	- Split windows. Drag and drop notes in split windows.<br />
	- Saving data permanently with accounts.<br />
	- Drag and drop files in sidebar<br />
	- Versoning<br />
	- Sharing & Export Data<br />
	<div class="flex flex-row gap-2 items-center">
		- Send us your ideas & feedback here : <form
			on:submit|preventDefault={async (e) => {
				await pocketbase.collection('feedback').create({
					feedback: e.target[0].value
				});

				feedbackSentMessage = 'Feedback sent, thank you :)';
			}}
		>
			<input class="border-2 border-slate-100 rounded-sm" />
		</form>
		<h6 class="text-sm font-light italic text-slate-500">
			{feedbackSentMessage}
		</h6>
	</div>
</div>
