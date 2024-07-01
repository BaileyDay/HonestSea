// File: src/routes/api/officials/[state]/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GOOGLE_API_KEY } from '$env/static/private';
import axios from 'axios';
import db from '$lib/server/database/drizzle';
import { officialsTable } from '$lib/server/database/drizzle-schemas';
import { eq, and, gt, mapColumnsInSQLToAlias } from 'drizzle-orm';

const CIVIC_INFO_API_URL = 'https://civicinfo.googleapis.com/civicinfo/v2/representatives';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function getStateAbbreviation(stateName: string): string {
	const stateMap: { [key: string]: string } = {
		alabama: 'AL',
		alaska: 'AK',
		arizona: 'AZ',
		arkansas: 'AR',
		california: 'CA',
		colorado: 'CO',
		connecticut: 'CT',
		delaware: 'DE',
		florida: 'FL',
		georgia: 'GA',
		hawaii: 'HI',
		idaho: 'ID',
		illinois: 'IL',
		indiana: 'IN',
		iowa: 'IA',
		kansas: 'KS',
		kentucky: 'KY',
		louisiana: 'LA',
		maine: 'ME',
		maryland: 'MD',
		massachusetts: 'MA',
		michigan: 'MI',
		minnesota: 'MN',
		mississippi: 'MS',
		missouri: 'MO',
		montana: 'MT',
		nebraska: 'NE',
		nevada: 'NV',
		'new hampshire': 'NH',
		'new jersey': 'NJ',
		'new mexico': 'NM',
		'new york': 'NY',
		'north carolina': 'NC',
		'north dakota': 'ND',
		ohio: 'OH',
		oklahoma: 'OK',
		oregon: 'OR',
		pennsylvania: 'PA',
		'rhode island': 'RI',
		'south carolina': 'SC',
		'south dakota': 'SD',
		tennessee: 'TN',
		texas: 'TX',
		utah: 'UT',
		vermont: 'VT',
		virginia: 'VA',
		washington: 'WA',
		'west virginia': 'WV',
		wisconsin: 'WI',
		wyoming: 'WY'
	};
	return stateMap[stateName.toLowerCase()] || stateName;
}

async function fetchOfficialImage(name: string): Promise<string | null> {
	const encodedName = encodeURIComponent(name);
	const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodedName}&prop=pageimages&format=json&pithumbsize=300&origin=*`;

	try {
		const response = await axios.get(apiUrl);
		const pages = response.data.query.pages;
		const pageId = Object.keys(pages)[0];

		if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
			return pages[pageId].thumbnail.source;
		}
	} catch (error) {
		console.error(`Error fetching image for ${name}:`, error);
	}

	return null;
}

async function fetchOfficialsFromAPI(state: string) {
	const stateAbbr = getStateAbbreviation(state);
	const ocdId = encodeURIComponent(`ocd-division/country:us/state:${stateAbbr.toLowerCase()}`);

	try {
		const response = await axios.get(`${CIVIC_INFO_API_URL}/${ocdId}`, {
			params: {
				key: GOOGLE_API_KEY
			}
		});

		const { offices, officials } = response.data;
		console.log(`Fetched ${officials.length} officials and ${offices.length} offices for ${state}`);

		const processedOfficials = await Promise.all(
			offices.flatMap(async (office: any, officeIndex: number) => {
				return Promise.all(
					office.officialIndices.map(async (index: number) => {
						const official = officials[index];
						if (!official) {
							console.error(`Official at index ${index} is undefined for office ${office.name}`);
							return null;
						}

						const imageUrl = official.photoUrl || (await fetchOfficialImage(official.name));

						return {
							official_id: `${state}-${office.name}-${index}`,
							name: official.name,
							party: official.party || null,
							title: office.name,
							state: state,
							role: office.roles[0],
							level: office.levels?.[0] || 'unknown',
							division_id: office.divisionId,
							image_url: imageUrl,
							websites: JSON.stringify(official.urls || []),
							emails: JSON.stringify(official.emails || []),
							phones: JSON.stringify(official.phones || []),
							address: JSON.stringify(official.address || []),
							social_media: JSON.stringify(official.channels || []),
							last_updated: new Date(),
							data_source: 'Google Civic Information API',
							is_active: true
						};
					})
				);
			})
		);

		const validOfficials = processedOfficials.flat().filter((official) => official !== null);
		console.log(`Processed ${validOfficials.length} valid officials for ${state}`);

		// Insert or update officials in the database
		for (const official of validOfficials) {
			try {
				await db.insert(officialsTable).values(official).onConflictDoUpdate({
					target: officialsTable.official_id,
					set: official
				});
				console.log(`Successfully inserted/updated official: ${official.name}`);
			} catch (error) {
				console.error(`Error inserting/updating official ${official.name}:`, error);
			}
		}

		return validOfficials;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(`Error fetching officials data for ${state}:`, {
				status: error.response?.status,
				statusText: error.response?.statusText,
				data: error.response?.data
			});
		} else {
			console.error(`Unexpected error fetching officials data for ${state}:`, error);
		}
		throw error;
	}
}

export const GET: RequestHandler = async ({ params }) => {
	const { state } = params;

	try {
		// Check if we have recent data in the database
		const cachedOfficials = await db
			.select()
			.from(officialsTable)
			.where(eq(officialsTable.state, state));

		if (cachedOfficials.length > 0) {
			console.log(`Returning ${cachedOfficials.length} cached officials for ${state}`);
			return json(cachedOfficials);
		}

		// If no recent data, fetch from API
		const officials = await fetchOfficialsFromAPI(state);
		console.log(`Returning ${officials.length} newly fetched officials for ${state}`);
		return json(officials);
	} catch (error) {
		console.error(`Error processing request for ${state}:`, error);
		return json({ error: 'Failed to fetch officials data' }, { status: 500 });
	}
};
