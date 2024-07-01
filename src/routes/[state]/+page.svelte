<script lang="ts">
	import InteractiveStateMap from '$lib/components/state/InteractiveStateMap.svelte';

	export let data;
	const { stateData } = data;
	const geoData = stateData?.stateJson[0].data;
	console.log(geoData);
</script>

<main
	class="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-blue-900"
>
	<section class="bg-white dark:bg-gray-800 shadow-lg p-8 mb-8">
		<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
			{stateData.name.charAt(0).toUpperCase() + stateData.name.slice(1)}
		</h1>
		<p class="text-lg text-gray-600 dark:text-gray-300">Quick facts about the state</p>
	</section>

	<div class="container mx-auto px-4">
		<div class="grid md:grid-cols-2 gap-8 mb-8">
			<InteractiveStateMap stateName={stateData.name} {geoData} />
		</div>
	</div>
</main>
