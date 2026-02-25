<script lang="ts">
	import favicon from '$lib/assets/onTrackCorpFav.png';
	import '../app.css';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		void import('bootstrap');
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
