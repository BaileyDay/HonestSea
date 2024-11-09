<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { Map, GeoJSON } from 'leaflet';
	import 'leaflet/dist/leaflet.css';

	interface Representative {
		name: string;
		party: string;
		photo?: string;
		district: string;
		role: string;
	}

	interface District {
		district_number: string;
		data: any; // GeoJSON geometry
		properties: {
			GEOID: string;
			STATE: string;
			NAME: string;
			CDFIPS: string;
			INTPTLAT: string;
			INTPTLON: string;
			[key: string]: any;
		};
		representative?: Representative;
	}

	interface StateData {
		name: string;
		stateJson: {
			data: any; // GeoJSON geometry
		};
		districts: District[];
	}

	export let stateData: StateData;
	export let userLocation: { lat: number; lon: number } | null = null;
	export let width = '100%';
	export let height = '600px';

	let map: Map;
	let stateLayer: GeoJSON;
	let districtLayers: GeoJSON[] = [];
	let hoveredDistrict: District | null = null;
	let userDistrict: District | null = null;
	let mapContainer: HTMLElement;

	function isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
		let inside = false;
		const [x, y] = point;

		for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			const [xi, yi] = polygon[i];
			const [xj, yj] = polygon[j];

			// Ray-casting algorithm
			if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
				inside = !inside;
			}
		}

		return inside;
	}

	function isPointInDistrict(lat: number, lon: number, geometry: any): boolean {
		if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
			return false;
		}

		// Important: GeoJSON uses [lon, lat] order!
		const point: [number, number] = [lon, lat];

		if (geometry.type === 'Polygon') {
			// For a single polygon
			return isPointInPolygon(point, geometry.coordinates[0]);
		} else {
			// For multiple polygons (MultiPolygon)
			return geometry.coordinates.some((polygon: number[][][]) => {
				// Check each ring in the polygon
				return polygon.some((ring: number[][]) => {
					return isPointInPolygon(point, ring);
				});
			});
		}
	}

	const getDistrictNumber = (district: District): string => {
		if (district.properties?.CDFIPS) {
			return parseInt(district.properties.CDFIPS).toString();
		}
		return district.district_number || 'AL';
	};

	const getDistrictStyle = (district: District, isHovered: boolean = false) => {
		const isUserDistrict = userDistrict?.properties.CDFIPS === district.properties.CDFIPS;
		return {
			fillColor: '#0ea5e9',
			fillOpacity: isHovered ? 0.4 : isUserDistrict ? 0.3 : 0.1,
			color: isHovered ? '#0ea5e9' : '#0ea5e9',
			weight: isHovered ? 2 : 0.5,
			opacity: isHovered ? 1 : 0.5
		};
	};

	const findDistrictByPoint = (
		lat: number,
		lon: number,
		districts: District[]
	): District | null => {
		console.log('Finding district for location:', { lat, lon });

		// Log all districts for debugging
		districts.forEach((district) => {
			const result = isPointInDistrict(lat, lon, district.data);
		});

		return districts.find((district) => isPointInDistrict(lat, lon, district.data)) || null;
	};

	const setupMap = async (): Promise<void> => {
		if (!browser || !mapContainer) return;

		const L = await import('leaflet');

		map = L.map('state-map-container', {
			center: [39.8283, -98.5795],
			zoom: 4,
			zoomSnap: 0.1,
			zoomDelta: 0.5,
			minZoom: 4
		});

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors'
		}).addTo(map);

		try {
			stateLayer = L.geoJSON(stateData.stateJson.data, {
				style: {
					fill: false,
					color: '#1e40af',
					weight: 1.5,
					opacity: 0.8
				}
			}).addTo(map);

			if (userLocation && userLocation.lat !== 0 && userLocation.lon !== 0) {
				// Create a custom icon using tailwind classes
				const customIcon = L.divIcon({
					html: `
            <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
        `,
					className: 'custom-user-marker',
					iconSize: [12, 12],
					iconAnchor: [6, 6]
				});

				const userMarker = L.marker([userLocation.lat, userLocation.lon], {
					icon: customIcon,
					interactive: false
				}).addTo(map);
			}

			stateData.districts.forEach((district) => {
				try {
					const districtLayer = L.geoJSON(district.data, {
						style: () => getDistrictStyle(district),
						onEachFeature: (feature, layer) => {
							layer.on({
								mouseover: () => {
									hoveredDistrict = district;
									layer.setStyle(getDistrictStyle(district, true));
								},
								mouseout: () => {
									hoveredDistrict = null;
									layer.setStyle(getDistrictStyle(district));
								},
								click: () => {
									const bounds = layer.getBounds();
									map.fitBounds(bounds, {
										padding: [50, 50],
										maxZoom: 12
									});
								}
							});
						}
					}).addTo(map);

					districtLayers.push(districtLayer);
				} catch (error) {
					console.error('Error adding district:', getDistrictNumber(district), error);
				}
			});

			if (userLocation && userLocation.lat !== 0 && userLocation.lon !== 0) {
				const userMarker = L.circleMarker([userLocation.lat, userLocation.lon], {
					radius: 5,
					fillColor: '#ef4444',
					fillOpacity: 0.8,
					color: 'white',
					weight: 2
				}).addTo(map);
			}

			const bounds = stateLayer.getBounds();
			map.fitBounds(bounds, { padding: [20, 20] });
		} catch (error) {
			console.error('Error setting up map:', error);
		}
	};

	onMount(async () => {
		if (browser) {
			mapContainer = document.getElementById('state-map-container')!;
			await setupMap();
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="relative">
	<div
		id="state-map-container"
		style="width: {width}; height: {height};"
		class="rounded-lg overflow-hidden"
	/>

	{#if hoveredDistrict}
		<div
			class="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md z-[1000]"
		>
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
				District {getDistrictNumber(hoveredDistrict)}
			</h3>
			{#if hoveredDistrict.representative}
				<p class="text-sm text-gray-600 dark:text-gray-300">
					Represented by {hoveredDistrict.representative.name}
					<span class="text-xs ml-1">({hoveredDistrict.representative.party})</span>
				</p>
			{/if}
		</div>
	{/if}

	{#if userDistrict}
		<div class="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md z-[1000]">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Your District</h3>
			<p class="text-sm text-gray-600 dark:text-gray-300">
				District {getDistrictNumber(userDistrict)}
			</p>
			{#if userDistrict.representative}
				<p class="text-xs text-gray-500 dark:text-gray-400">
					Represented by {userDistrict.representative.name} ({userDistrict.representative.party})
				</p>
			{/if}
		</div>
	{/if}
</div>

<style lang="css">
	:global(.leaflet-container) {
		height: 100%;
		width: 100%;
		background-color: rgba(30, 64, 175, 0.05);
	}

	/* Ensure Leaflet UI controls are below our tooltips */
	:global(.leaflet-control-container) {
		z-index: 999 !important;
	}

	/* Ensure Leaflet base tile layer is at the bottom */
	:global(.leaflet-tile-pane) {
		z-index: 100 !important;
	}

	/* Ensure our overlay pane is above tiles but below UI */
	:global(.leaflet-overlay-pane) {
		z-index: 200 !important;
	}

	/* Custom marker styles */
	:global(.custom-user-marker) {
		background: transparent;
		border: none;
	}

	:global(.custom-user-marker .animate-ping) {
		animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
	}

	@keyframes ping {
		75%,
		100% {
			transform: scale(2);
			opacity: 0;
		}
	}
</style>
