<script lang="ts">
	import InteractiveStateMap from '$lib/components/state/InteractiveStateMap.svelte';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import OfficialCard from '$lib/components/OfficialCard.svelte';

	export let data;
	const { stateData } = data;

	// Get user location from URL parameters
	$: userLocation = {
		lat: parseFloat($page.url.searchParams.get('lat') || '0'),
		lon: parseFloat($page.url.searchParams.get('lon') || '0')
	};

	let isMapVisible = false;

	onMount(() => {
		setTimeout(() => {
			isMapVisible = true;
		}, 500);
	});
</script>

<section
	class="relative overflow-hidden bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-blue-900"
>
	<div class="absolute inset-0 bg-slate-900 opacity-10 dark:opacity-40"></div>

	<div class="container mx-auto px-4 py-16 md:py-24 relative z-10">
		<div class="flex flex-col md:flex-row items-center justify-between">
			<div class="w-full md:w-1/2 mb-8 md:mb-0">
				<h1
					in:fly={{ y: 50, duration: 1000 }}
					class="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4"
				>
					{stateData.name.charAt(0).toUpperCase() + stateData.name.slice(1)}
				</h1>
				<p
					in:fly={{ y: 50, duration: 1000, delay: 200 }}
					class="text-xl text-gray-700 dark:text-gray-300 mb-8"
				>
					Explore your state's political landscape
				</p>
				<div in:fly={{ y: 50, duration: 1000, delay: 400 }} class="flex space-x-4">
					<button
						class="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors duration-200"
					>
						Find Representatives
					</button>
					<button
						class="px-6 py-3 bg-white dark:bg-gray-800 text-sky-500 font-semibold rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
					>
						View Districts
					</button>
				</div>
			</div>

			<div class="w-full md:w-1/2 relative">
				<div
					class="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-500 opacity-20 rounded-lg"
				></div>
				{#if isMapVisible}
					<div in:fade={{ duration: 1000 }}>
						<InteractiveStateMap {stateData} {userLocation} height="500px" />
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div
		class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"
	></div>
</section>
<section class="container mx-auto px-4 py-16">
	<h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">State Officials</h2>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
		{#if stateData.governor}
			<OfficialCard official={stateData.governor} />
		{/if}
		{#each stateData.officials.filter((o) => o.title !== stateData.governor?.title) as official}
			<OfficialCard {official} />
		{/each}
	</div>
</section>
