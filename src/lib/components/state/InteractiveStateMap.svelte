<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let stateData: any;
	export let userLocation: { lat: number; lon: number } | null = null;
	export let width = '100%';
	export let height = '600px';

	let d3: any;
	let svg: any;
	let projection: any;
	let path: any;
	let mapContainer: HTMLElement;
	let hoveredDistrict: any = null;
	let userDistrict: any = null;
	let userLocationCoords: [number, number] | null = null;

	function setupProjectionAndSVG(): void {
		if (!browser || !mapContainer) return;

		const containerWidth = mapContainer.getBoundingClientRect().width;
		const containerHeight = mapContainer.getBoundingClientRect().height;

		svg.attr('width', containerWidth).attr('height', containerHeight);

		const stateFeature = {
			type: 'Feature',
			geometry: stateData.stateJson.data
		};

		projection = d3.geoAlbersUsa().fitSize([containerWidth, containerHeight], stateFeature);

		path = d3.geoPath().projection(projection);

		drawMap();
	}

	function drawMap(): void {
		svg.selectAll('*').remove();

		// Draw state
		svg
			.append('path')
			.datum(stateData.stateJson.data)
			.attr('class', 'state')
			.attr('d', path)
			.attr('fill', 'rgba(255, 255, 255, 0.8)')
			.attr('stroke', 'rgba(30, 64, 175, 0.5)')
			.attr('stroke-width', 1);

		// Draw districts
		svg
			.selectAll('.district')
			.data(stateData.districts)
			.enter()
			.append('path')
			.attr('class', 'district')
			.attr('d', (d: any) => path(d.data))
			.attr('fill', 'rgba(14, 165, 233, 0.1)')
			.attr('stroke', 'rgba(14, 165, 233, 0.3)')
			.attr('stroke-width', 0.5)
			.on('mouseover', (event, d) => {
				hoveredDistrict = d;
				d3.select(event.target)
					.attr('fill', 'rgba(14, 165, 233, 0.3)')
					.attr('stroke', 'rgba(14, 165, 233, 0.8)')
					.attr('stroke-width', 1.5);
			})
			.on('mouseout', (event) => {
				hoveredDistrict = null;
				d3.select(event.target)
					.attr('fill', 'rgba(14, 165, 233, 0.1)')
					.attr('stroke', 'rgba(14, 165, 233, 0.3)')
					.attr('stroke-width', 0.5);
			});

		// Plot user location if available
		if (userLocation) {
			userLocationCoords = projection([userLocation.lon, userLocation.lat]);

			// Find user's district
			userDistrict = stateData.districts.find((district: any) => {
				return d3.geoContains(district.data, [userLocation.lon, userLocation.lat]);
			});
		}
	}

	onMount(async () => {
		if (browser) {
			d3 = await import('d3');
			mapContainer = document.getElementById('state-map-container')!;
			svg = d3.select('#state-map-container').append('svg');

			setupProjectionAndSVG();
			window.addEventListener('resize', setupProjectionAndSVG);
		}
	});

	onDestroy(() => {
		if (browser && window) {
			window.removeEventListener('resize', setupProjectionAndSVG);
		}
	});
</script>

<div class="relative">
	<div
		id="state-map-container"
		style="width: {width}; height: {height};"
		class="rounded-lg overflow-hidden"
	></div>
	{#if userLocationCoords}
		<div
			class="absolute"
			style="left: {userLocationCoords[0]}px; top: {userLocationCoords[1]}px; transform: translate(-50%, -50%);"
		>
			<span class="relative flex h-3 w-3">
				<span
					class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"
				></span>
				<span class="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
			</span>
		</div>
	{/if}
	{#if hoveredDistrict}
		<div class="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
				District {hoveredDistrict.district_number || 'N/A'}
			</h3>
			<p class="text-sm text-gray-600 dark:text-gray-300">Hover for more info</p>
		</div>
	{/if}
	{#if userDistrict}
		<div class="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Your District</h3>
			<p class="text-sm text-gray-600 dark:text-gray-300">
				District {userDistrict.district_number || 'N/A'}
			</p>
		</div>
	{/if}
</div>

<style>
	#state-map-container {
		background-color: rgba(30, 64, 175, 0.05);
	}
</style>
