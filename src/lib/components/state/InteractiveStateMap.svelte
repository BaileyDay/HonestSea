<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import type { Geometry, FeatureCollection } from 'geojson';

	export let stateName: string;
	export let geoData: { type: string; coordinates: any[] };

	let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
	let path: d3.GeoPath<any, d3.GeoPermissibleObjects>;

	onMount(() => {
		console.log('geoData:', geoData); // Log the geoData to ensure it is correctly passed

		// Wrap the MultiPolygon in a FeatureCollection
		const featureCollection: FeatureCollection<Geometry> = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: geoData,
					properties: {}
				}
			]
		};

		const width = 400;
		const height = 400;

		// Initialize SVG
		svg = d3
			.select('#state-map')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', `0 0 ${width} ${height}`)
			.attr('class', 'bg-white dark:bg-gray-800 rounded-lg shadow-lg');

		// Create projection and path
		const projection = d3.geoMercator().fitSize([width, height], featureCollection);
		path = d3.geoPath().projection(projection);

		// Draw the map
		svg
			.selectAll('path')
			.data(featureCollection.features)
			.enter()
			.append('path')
			.attr('d', path)
			.attr(
				'class',
				'fill-sky-200 hover:fill-sky-300 stroke-sky-600 cursor-pointer transition-colors duration-200'
			)
			.on('click', (event, d) => {
				// Handle district click
				console.log('District clicked:', (d as Feature).properties?.name);
			});
	});
</script>

<div id="state-map" class="w-full h-auto"></div>
