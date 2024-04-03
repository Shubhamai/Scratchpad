<script lang="ts">
	import '../app.css';

	import Header from './header/Header.svelte';
	import Sidebar from './sidebar/+page.svelte';
	import Footer from './footer/Footer.svelte';
	import { onMount } from 'svelte';
	import { pocketbase } from '$lib';

	// export let data;

	onMount(async () => {
		await pocketbase.collection('users').authRefresh();

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
