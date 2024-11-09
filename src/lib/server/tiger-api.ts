// lib/server/tiger-api.ts
import type { Feature, FeatureCollection, Geometry } from 'geojson';

interface CongressionalDistrict {
	district_number: string;
	data: Geometry;
	properties: {
		GEOID: string;
		STATE: string;
		NAME: string;
		CD118FP?: string; // Updated to 118th Congress
		INTPTLAT: string;
		INTPTLON: string;
		[key: string]: any;
	};
}

export async function getCongressionalDistricts(
	stateAbbr: string
): Promise<CongressionalDistrict[]> {
	// Updated to 118th Congressional Districts endpoint
	const baseUrl =
		'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_118th_Congressional_Districts/FeatureServer/0/query';

	const params = new URLSearchParams({
		where: `STUSPS='${stateAbbr}'`,
		outFields: '*',
		returnGeometry: 'true',
		f: 'geojson',
		geometryPrecision: '4',
		spatialRel: 'esriSpatialRelIntersects'
	});

	try {
		console.log(`Fetching districts for ${stateAbbr} from:`, `${baseUrl}?${params}`);

		const response = await fetch(`${baseUrl}?${params}`, {
			headers: {
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch districts: ${response.statusText}`);
		}

		const data: FeatureCollection = await response.json();

		if (!data.features || data.features.length === 0) {
			// Try alternative field name
			params.set('where', `STATE_ABBR='${stateAbbr}'`);
			const retryResponse = await fetch(`${baseUrl}?${params}`);
			if (!retryResponse.ok) {
				throw new Error(`No districts found for state: ${stateAbbr}`);
			}
			const retryData: FeatureCollection = await retryResponse.json();
			if (!retryData.features || retryData.features.length === 0) {
				throw new Error(`No districts found for state: ${stateAbbr}`);
			}
			data.features = retryData.features;
		}

		return data.features.map((feature) => {
			// Get district number from various possible property names
			const districtNumber =
				feature.properties.CD118FP ||
				feature.properties.CD118 ||
				feature.properties.DISTRICT ||
				feature.properties.District ||
				feature.properties.CDFIPS ||
				'AL';

			return {
				district_number: districtNumber,
				data: feature.geometry,
				properties: {
					...feature.properties,
					GEOID: feature.properties.GEOID || feature.properties.DISTRICTID || '',
					STATE: stateAbbr,
					NAME: feature.properties.NAME || feature.properties.NAMELSAD || '',
					INTPTLAT: feature.properties.INTPTLAT || '0',
					INTPTLON: feature.properties.INTPTLON || '0'
				}
			};
		});
	} catch (error) {
		console.error('Error fetching congressional districts:', error);
		throw error;
	}
}

export function getStateBoundary(districts: CongressionalDistrict[]): Geometry | null {
	if (!districts.length) return null;

	if (districts.length === 1) {
		return districts[0].data;
	}

	return {
		type: 'MultiPolygon',
		coordinates: districts
			.filter((d) => d.data.type === 'Polygon' || d.data.type === 'MultiPolygon')
			.flatMap((d) => {
				if (d.data.type === 'Polygon') return [d.data.coordinates];
				return d.data.coordinates;
			})
	};
}

export function isPointInDistrict(lat: number, lon: number, geometry: Geometry): boolean {
	if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
		return false;
	}

	const point = [lon, lat];

	const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

	return polygons.some((polygon) => {
		return polygon.some((ring) => {
			return isPointInPolygon(point, ring);
		});
	});
}

function isPointInPolygon(point: number[], polygon: number[][]): boolean {
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

export function findDistrictByPoint(
	lat: number,
	lon: number,
	districts: CongressionalDistrict[]
): CongressionalDistrict | null {
	return districts.find((district) => isPointInDistrict(lat, lon, district.data)) || null;
}
