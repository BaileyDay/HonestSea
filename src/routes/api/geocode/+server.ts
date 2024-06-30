import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const MAPBOX_ACCESS_TOKEN = env.MAPBOX_TOKEN;

async function fetchFromMapbox(endpoint: string, params: Record<string, string>) {
	const url = new URL(`https://api.mapbox.com/geocoding/v5/${endpoint}`);
	url.search = new URLSearchParams({
		access_token: MAPBOX_ACCESS_TOKEN,
		...params
	}).toString();

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Mapbox API error: ${response.statusText}`);
	}
	return response.json();
}

export const GET: RequestHandler = async ({ url }) => {
	const input = url.searchParams.get('input');
	if (!input) {
		return json({ suggestions: [] });
	}

	try {
		const data = await fetchFromMapbox('mapbox.places/' + encodeURIComponent(input) + '.json', {
			country: 'US',
			types: 'address,place,region',
			autocomplete: 'true',
			limit: '5',
			language: 'en',
			fuzzyMatch: 'true'
		});

		const suggestions = data.features.map((feature) => ({
			place_name: feature.place_name,
			id: feature.id,
			type: feature.place_type[0]
		}));
		return json({ suggestions });
	} catch (error) {
		console.error('Geocoding error:', error);
		return json({ error: 'Failed to fetch suggestions' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const { address } = await request.json();

	try {
		const data = await fetchFromMapbox('mapbox.places/' + encodeURIComponent(address) + '.json', {
			country: 'US',
			types: 'address,place,region',
			limit: '1',
			language: 'en',
			fuzzyMatch: 'true'
		});

		if (data.features.length === 0) {
			return json({ error: 'Address not found' }, { status: 404 });
		}

		const result = data.features[0];
		const { place_name, center, context, place_type } = result;
		const state = context.find((item) => item.id.startsWith('region'))?.text;

		return json({
			address: place_name,
			state,
			lat: center[1],
			lng: center[0],
			type: place_type[0],
			bbox: result.bbox // Bounding box, if available
		});
	} catch (error) {
		console.error('Geocoding error:', error);
		return json({ error: 'Failed to geocode address' }, { status: 500 });
	}
};
