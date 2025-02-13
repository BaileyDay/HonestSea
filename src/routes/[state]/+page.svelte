<script lang="ts">
	import InteractiveStateMap from '$lib/components/state/InteractiveStateMap.svelte';
	import OfficialCard from '$lib/components/OfficialCard.svelte';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	export let data;
	const { stateData } = data;
	console.log(stateData);

	// Get user location from URL parameters
	$: userLocation = {
		lat: parseFloat($page.url.searchParams.get('lat') || '0'),
		lon: parseFloat($page.url.searchParams.get('lon') || '0')
	};

	// Find user's district representative
	$: userDistrict = stateData.districts.find(
		(d) =>
			d.representative &&
			userLocation.lat !== 0 &&
			d.district_number ===
				stateData.districts.find((district) =>
					isPointInDistrict(userLocation.lat, userLocation.lon, district.data)
				)?.district_number
	);

	let isMapVisible = false;

	onMount(() => {
		setTimeout(() => {
			isMapVisible = true;
		}, 500);
	});

	// Helper function to check if a point is in a district
	function isPointInDistrict(lat: number, lon: number, geometry: any): boolean {
		if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) {
			return false;
		}

		const point: [number, number] = [lon, lat];
		const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

		return polygons.some((polygon) => {
			return polygon.some((ring) => {
				return isPointInPolygon(point, ring);
			});
		});
	}

	function isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
		const [x, y] = point;
		let inside = false;

		for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			const [xi, yi] = polygon[i];
			const [xj, yj] = polygon[j];
			const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
			if (intersect) inside = !inside;
		}

		return inside;
	}
</script>

<section
	class="relative overflow-hidden bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-blue-900"
>
	<div class="absolute inset-0 bg-slate-900 opacity-10 dark:opacity-40" />

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
					Explore your state's congressional districts
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
				/>
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
	/>
</section>

<!-- Your District Representative Section -->
{#if userDistrict?.representative}
	<section class="container mx-auto px-4 py-8">
		<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
			Your Representative
		</h2>
		<div class="max-w-2xl mx-auto">
			<OfficialCard official={userDistrict.representative} />
		</div>
	</section>
{/if}

<!-- State Leadership Section -->
<section class="container mx-auto px-4 py-16">
	<!-- Governor -->
	{#if stateData.governor}
		<h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Governor</h2>
		<div class="max-w-2xl mx-auto mb-16">
			<OfficialCard official={stateData.governor} />
		</div>
	{/if}

	<!-- Senators -->
	<h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">U.S. Senators</h2>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
		{#each stateData.senators as senator}
			<OfficialCard official={senator} />
		{/each}
	</div>

	<!-- Representatives -->
	<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
		U.S. Representatives
	</h2>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
		{#each stateData.districts.filter((d) => d.representative) as district}
			<OfficialCard official={district.representative} />
		{/each}
	</div>

	<!-- State Leadership -->
	{#if stateData.stateLeadership?.length > 0}
		<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
			State Leadership
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
			{#each stateData.stateLeadership as official}
				<OfficialCard {official} />
			{/each}
		</div>
	{/if}

	<!-- Supreme Court Justices -->
	{#if stateData.justices?.length > 0}
		<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
			Supreme Court Justices
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each stateData.justices as official}
				<OfficialCard {official} />
			{/each}
		</div>
	{/if}
</section>
