<script lang="ts">
	import '../app.css';

	import Header from './header/Header.svelte';
	import Sidebar from './sidebar/Sidebar.svelte';
	import Footer from './footer/Footer.svelte';
	import { onMount } from 'svelte';
	import { pocketbase } from '$lib';

	onMount(async () => {
		await pocketbase.collection('users').authRefresh();
	});
</script>

<!-- TODO : Entiler frame should be editable, no [enterrr] in the main frame to create new line -->
<div class="flex flex-col">
	<div class="flex flex-row h-[60.7rem]">
		<div class="flex-auto flex flex-col">
			<Header />
			<slot />
		</div>
		<Sidebar />
	</div>
	<Footer />
</div>
