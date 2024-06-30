<script lang="ts">
	import { page } from '$app/stores';

	$: stateName = $page.params.state
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
</script>

<svelte:head>
	<title>{stateName} | HonestSea</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-4xl font-bold mb-6">{stateName}</h1>
	<p>Information about elected officials in {stateName} will be displayed here.</p>
</div>
