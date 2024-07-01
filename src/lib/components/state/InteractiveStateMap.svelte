<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import type { Feature, Geometry } from 'geojson';
	import db from '$lib/server/database/drizzle';
	import { eq } from 'drizzle-orm';

	export let stateName: string;
	export let districts: Feature<Geometry>[];

	let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
	let path: d3.GeoPath<any, d3.GeoPermissibleObjects>;

	const abr = {
		Alabama: 'AL',
		Alaska: 'AK',
		Arizona: 'AZ',
		Arkansas: 'AR',
		California: 'CA',
		Colorado: 'CO',
		Connecticut: 'CT',
		Delaware: 'DE',
		Florida: 'FL',
		Georgia: 'GA',
		Hawaii: 'HI',
		Idaho: 'ID',
		Illinois: 'IL',
		Indiana: 'IN',
		Iowa: 'IA',
		Kansas: 'KS',
		Kentucky: 'KY',
		Louisiana: 'LA',
		Maine: 'ME',
		Maryland: 'MD',
		Massachusetts: 'MA',
		Michigan: 'MI',
		Minnesota: 'MN',
		Mississippi: 'MS',
		Missouri: 'MO',
		Montana: 'MT',
		Nebraska: 'NE',
		Nevada: 'NV',
		'New Hampshire': 'NH',
		'New Jersey': 'NJ',
		'New Mexico': 'NM',
		'New York': 'NY',
		'North Carolina': 'NC',
		'North Dakota': 'ND',
		Ohio: 'OH',
		Oklahoma: 'OK',
		Oregon: 'OR',
		Pennsylvania: 'PA',
		'Rhode Island': 'RI',
		'South Carolina': 'SC',
		'South Dakota': 'SD',
		Tennessee: 'TN',
		Texas: 'TX',
		Utah: 'UT',
		Vermont: 'VT',
		Virginia: 'VA',
		Washington: 'WA',
		'West Virginia': 'WV',
		Wisconsin: 'WI',
		Wyoming: 'WY'
	};

	onMount(async () => {
		console.log(stateName);
		const stateAbbreviation = abr[stateName];
		const stateData = await db.select().from(geodata).where(eq(geodata.state, stateAbbreviation));
		console.log(stateData);
		const width = 400;
		const height = 400;

		svg = d3
			.select('#state-map')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height].join(' '))
			.attr('class', 'bg-white dark:bg-gray-800 rounded-lg shadow-lg');

		const projection = d3.geoMercator().fitSize([width, height], stateData);
		path = d3.geoPath().projection(projection);

		svg
			.selectAll('path')
			.data(districts)
			.enter()
			.append('path')
			.attr('d', path)
			.attr(
				'class',
				'fill-sky-200 hover:fill-sky-300 stroke-sky-600 cursor-pointer transition-colors duration-200'
			)
			.on('click', (event, d) => {
				// Handle district click
				console.log('District clicked:', d.properties.name);
			});
	});
</script>

<div id="state-map" class="w-full h-auto"></div>
