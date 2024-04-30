<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import data from './world.json';

	let svg, projection, initialScale, path, globe;
	const sensitivity = 80;

	// Function to calculate scale based on the container width
	function calculateScale(width) {
		if (width < 640) {
			// Smaller devices
			return width / 3; // Smaller scale for small devices
		} else if (width < 1024) {
			// Medium devices
			return width / 3.5;
		} else {
			// Larger devices
			return 350; // Maximum scale for large devices
		}
	}

	function calculateHeight(width) {
		if (width < 768) {
			// Mobile breakpoint
			return width / 1.5;
		} else {
			// Desktop
			return width / 2.5;
		}
	}

	function setupProjectionAndSVG() {
		const mapContainer = document.querySelector('#map');
		const width = mapContainer.getBoundingClientRect().width;
		const height = calculateHeight(width); // Maintain a 2:1 width to height ratio

		// Update the projection
		projection
			.scale(calculateScale(width)) // Dynamically calculate scale
			.translate([width / 2, height / 2]); // Center the projection

		// Update the SVG dimensions
		svg.attr('width', width).attr('height', height);

		// Update the globe circle
		globe
			.attr('cx', width / 2)
			.attr('cy', height / 2)
			.attr('r', projection.scale());

		// Redraw the countries
		svg.selectAll('.country').attr('d', path);

		// Redraw the globe circle
		svg.select('circle').attr('r', projection.scale());
	}

	onMount(() => {
		svg = d3.select('#map').append('svg');
		projection = d3.geoOrthographic().center([0, 0]).rotate([0, -30]);
		path = d3.geoPath().projection(projection);
		globe = svg
			.append('circle')
			.attr('fill', '#EEE')
			.attr('stroke', '#000')
			.attr('stroke-width', '0.2');

		setupProjectionAndSVG();
		drawCountries();
		setupInteraction();

		// Setup resize event listener to adjust the view on viewport size changes
		window.addEventListener('resize', setupProjectionAndSVG);

		d3.timer(function (elapsed) {
			const rotate = projection.rotate();
			const k = sensitivity / projection.scale();
			projection.rotate([rotate[0] - 1 * k, rotate[1]]);
			path = d3.geoPath().projection(projection);
			svg.selectAll('path').attr('d', path);
		}, 200);
	});

	function setupInteraction() {
		svg.call(
			d3.drag().on('drag', (event) => {
				const rotate = projection.rotate();
				const k = sensitivity / projection.scale();
				projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
				svg.selectAll('.country').attr('d', path);
			})
		);
	}

	function drawCountries() {
		svg
			.append('g')
			.attr('class', 'countries')
			.selectAll('path')
			.data(data.features)
			.enter()
			.append('path')
			.attr('class', 'country')
			.attr('d', path)
			.attr('fill', (d) => (d.properties.name === 'USA' ? '#7dd3fc' : 'white'))
			.style('stroke', (d) => (d.properties.name === 'USA' ? '#0ea5e9' : 'black'))
			.style('stroke-width', (d) => (d.properties.name === 'USA' ? '1' : '0.3'))
			.style('opacity', 0.8);
	}
</script>

<div id="map" class="w-full"></div>
