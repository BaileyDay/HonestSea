import { error } from '@sveltejs/kit';
import { abr } from '$lib/state-abbreviations';
import { getCongressionalDistricts, getStateBoundary } from '$lib/server/tiger-api';
import type { PageServerLoad } from './$types';

import { CONGRESS_API_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const stateName = params.state.toString().toLowerCase();
	const stateAbr = abr[stateName];

	if (!stateAbr) {
		throw error(404, 'State not found');
	}

	try {
		// Fetch congressional districts
		const districts = await getCongressionalDistricts(stateAbr);

		// Get state boundary
		const stateBoundary = getStateBoundary(districts);

		if (!districts.length) {
			throw error(404, `No congressional districts found for ${stateName}`);
		}

		// Fetch Congress members from Congress.gov API
		const congressUrl = `https://api.congress.gov/v3/member/${stateAbr}?format=json&api_key=${CONGRESS_API_KEY}&currentMember=true`;
		const congressResponse = await fetch(congressUrl);
		const congressData = await congressResponse.json();

		// Fetch state officials from your database
		const stateOfficialsResponse = await fetch(`/api/officials/${stateName}`);
		const stateOfficials = await stateOfficialsResponse.json();

		// Extract and format Congress members
		const congressMembers = congressData.members.map((member: any) => ({
			name: member.name,
			party: member.partyName,
			state: member.state,
			district: member.district?.toString() || 'AL',
			title: member.terms?.item[0]?.chamber || 'Representative',
			role: 'representative',
			photo: member.depiction?.imageUrl
		}));

		// Separate senators and representatives
		const senators = congressMembers.filter((member) => member.title === 'Senate');

		const representatives = congressMembers.filter(
			(member) => member.title === 'House of Representatives'
		);

		// Get state governor and other officials
		const governor = stateOfficials.find(
			(official: any) => official.title?.toLowerCase().includes('governor')
		);

		const stateLeadership = stateOfficials.filter(
			(official: any) =>
				official.level === 'administrativeArea1' &&
				!official.title?.toLowerCase().includes('supreme court')
		);

		const justices = stateOfficials.filter(
			(official: any) => official.title?.toLowerCase().includes('supreme court')
		);

		// Match representatives with districts
		const districtsWithReps = districts.map((district) => {
			const districtNum = district.district_number.replace(/^0+/, '');
			const representative = representatives.find(
				(rep) => rep.district.replace(/^0+/, '') === districtNum
			);

			return {
				...district,
				representative
			};
		});

		return {
			stateData: {
				name: stateName,
				stateJson: {
					data: stateBoundary
				},
				districts: districtsWithReps,
				senators,
				governor,
				stateLeadership,
				justices
			}
		};
	} catch (err) {
		console.error('Error loading state data:', err);
		throw error(500, {
			message: 'Failed to load state data',
			cause: err instanceof Error ? err.message : 'Unknown error'
		});
	}
};
