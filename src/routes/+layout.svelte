<script lang="ts">
	import '../app.css';

	import Header from './header/Header.svelte';
	import Sidebar from './sidebar/+page.svelte';
	import Footer from './footer/Footer.svelte';
	import { onMount } from 'svelte';
	import { pocketbase } from '$lib';

	onMount(async () => {
		try {
			await pocketbase.collection('users').authRefresh();
		} catch {
			console.log('No User Found. Data is saved locally.');
		}
		// TODO : Don't want to ask the user on first visit
		await navigator.storage.persist();
	});
</script>

<div class="flex flex-col h-screen w-screen">
	<div class="flex flex-row h-full w-full">
		<div class="flex-auto flex flex-col">
			<Header />
			<slot />
		</div>
		<Sidebar />
	</div>
	<Footer />
</div>
