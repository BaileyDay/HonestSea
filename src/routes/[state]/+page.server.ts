import type { PageServerLoad } from './$types';
import db from '$lib/server/database/drizzle';
import { geodata } from '$lib/server/database/drizzle-schemas';
import { eq, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

const abr = {
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

export const load: PageServerLoad = async ({ params, fetch }) => {
	const stateName = params.state.toString();
	const stateAbr = abr[stateName];

	try {
		// Fetch existing state data
		const stateData = await db
			.select()
			.from(geodata)
			.where(sql`state = ${stateAbr} and ${geodata.level} = 'state'`);

		const districtData = await db
			.select()
			.from(geodata)
			.where(sql`state = ${stateAbr} and ${geodata.level} = 'district'`);

		// Fetch officials data from our new API endpoint
		const officialsResponse = await fetch(`/api/officials/${stateName}`);
		if (!officialsResponse.ok) {
			throw new Error('Failed to fetch officials data');
		}
		const officials = await officialsResponse.json();

		// Find the governor from the officials
		const governor = officials.find((official: any) =>
			official.title.toLowerCase().includes('governor')
		);

		return {
			stateData: {
				name: stateName,
				stateJson: stateData[0],
				districts: districtData,
				officials: officials,
				governor: governor || null
			}
		};
	} catch (err) {
		console.error('Error loading state data:', err);
		throw error(500, 'Failed to load state data');
	}
};
