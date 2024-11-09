import { error } from '@sveltejs/kit';
import { abr } from '$lib/state-abbreviations';

import { CONGRESS_API_KEY } from '$env/static/private';

export async function load({ params }) {
	const { state, number } = params;
	const stateAbbr = abr[state];

	try {
		// Fetch current member info
		const memberResponse = await fetch(
			`https://api.congress.gov/v3/member/${stateAbbr}?format=json&api_key=${CONGRESS_API_KEY}&currentMember=true`
		);

		if (!memberResponse.ok) {
			throw error(404, 'Representative not found');
		}

		const memberData = await memberResponse.json();
		const representative = memberData.members.find((m: any) => m.district?.toString() === number);

		if (!representative) {
			throw error(404, 'Representative not found');
		}

		// Fetch sponsored legislation
		const sponsoredResponse = await fetch(
			`https://api.congress.gov/v3/member/${representative.bioguideId}/sponsored-legislation?format=json&api_key=${CONGRESS_API_KEY}&limit=50`
		);
		const sponsoredData = await sponsoredResponse.json();

		// Fetch cosponsored legislation
		const cosponsoredResponse = await fetch(
			`https://api.congress.gov/v3/member/${representative.bioguideId}/cosponsored-legislation?format=json&api_key=${CONGRESS_API_KEY}&limit=50`
		);
		const cosponsoredData = await cosponsoredResponse.json();

		return {
			representative,
			sponsoredBills: sponsoredData.sponsoredLegislation || [],
			cosponsoredBills: cosponsoredData.cosponsoredLegislation || []
		};
	} catch (err) {
		console.error('Error:', err);
		throw error(500, 'Failed to load representative data');
	}
}
