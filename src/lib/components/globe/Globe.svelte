<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let d3: any;
	let data: any;

	let svg: any;
	let projection: any;
	let path: any;
	let globe: any;
	const sensitivity = 80;
	let rotationTimer: any;

	export let width = '100%';
	export let height = '100%';

	function calculateScale(width: number): number {
		return Math.max(width / 2, 400); // Adjusted scale for hero background
	}

	function setupProjectionAndSVG(): void {
		if (!browser) return;

		const mapContainer = document.querySelector('#hero-background-globe') as HTMLElement;
		const containerWidth = mapContainer.getBoundingClientRect().width;
		const containerHeight = mapContainer.getBoundingClientRect().height;

		projection
			.scale(calculateScale(Math.min(containerWidth, containerHeight)))
			.translate([containerWidth / 2, containerHeight / 2])
			.rotate([-98, -39, 0]); // Centered on USA

		svg.attr('width', containerWidth).attr('height', containerHeight);

		globe
			.attr('cx', containerWidth / 2)
			.attr('cy', containerHeight / 2)
			.attr('r', projection.scale());

		svg.selectAll('path').attr('d', path);
	}

	function drawGlobe(): void {
		// Ocean
		svg
			.append('path')
			.datum({ type: 'Sphere' })
			.attr('class', 'ocean')
			.attr('d', path)
			.attr('fill', 'rgba(238, 238, 238, 0.1)') // Very light, transparent
			.attr('stroke', 'rgba(0, 0, 0, 0.5)')
			.attr('stroke-width', 0.3);

		// Countries
		svg
			.append('g')
			.attr('class', 'countries')
			.selectAll('path')
			.data(data.features)
			.enter()
			.append('path')
			.attr('class', 'country')
			.attr('d', path)
			.attr('fill', (d: any) =>
				d.properties.name === 'USA' ? 'rgba(125, 211, 252, 0.5)' : 'rgba(255, 255, 255, 0.5)'
			)
			.style('stroke', (d: any) =>
				d.properties.name === 'USA' ? 'rgba(14, 165, 233, 0.5)' : 'rgba(0, 0, 0, 0.3)'
			)
			.style('stroke-width', (d: any) => (d.properties.name === 'USA' ? 0.5 : 0.2))
			.style('opacity', 0.8);
	}

	onMount(async () => {
		if (browser) {
			d3 = await import('d3');
			data = await import('./world.json');

			svg = d3.select('#hero-background-globe').append('svg');
			projection = d3.geoOrthographic().center([0, 0]);
			path = d3.geoPath().projection(projection);
			globe = svg
				.append('circle')
				.attr('fill', 'none')
				.attr('stroke', 'rgba(0, 0, 0, 0.05)')
				.attr('stroke-width', '0.2');

			setupProjectionAndSVG();
			drawGlobe();

			window.addEventListener('resize', setupProjectionAndSVG);

			rotationTimer = d3.timer((elapsed: number) => {
				const rotate = projection.rotate();
				const k = sensitivity / projection.scale();
				projection.rotate([rotate[0] - 0.3 * k, rotate[1]]); // Slower rotation
				svg.selectAll('path').attr('d', path);
			}, 200);
		}
	});

	onDestroy(() => {
		if (browser && window) {
			window.removeEventListener('resize', setupProjectionAndSVG);
			if (rotationTimer) rotationTimer.stop();
		}
	});
</script>

<div
	id="hero-background-globe"
	style="width: {width}; height: {height}; position: absolute; top: 0; left: 0; z-index: -1;"
></div>
