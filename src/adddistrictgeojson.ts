// src/scripts/addDistrictGeoJSON.ts
import db from '$lib/server/database/drizzle';
import axios from 'axios';
import { geodata } from '$lib/server/database/drizzle-schemas';
import { sql } from 'drizzle-orm';
import { setTimeout } from 'timers/promises';

const BASE_URL = 'https://api.github.com/repos/unitedstates/districts/contents';
const RAW_CONTENT_URL = 'https://raw.githubusercontent.com/unitedstates/districts/gh-pages';

// Rate limiting helper
async function rateLimitedRequest(url: string, retries = 3) {
	for (let i = 0; i < retries; i++) {
		try {
			const response = await axios.get(url, {
				headers: process.env.GITHUB_TOKEN
					? {
							Authorization: `token ${process.env.GITHUB_TOKEN}`
						}
					: {}
			});
			return response.data;
		} catch (error: any) {
			if (error.response?.status === 403) {
				console.log('Rate limit hit, waiting 60 seconds...');
				await setTimeout(60000);
				continue;
			}
			if (i === retries - 1) throw error;
			await setTimeout(1000 * (i + 1));
		}
	}
}

// Fetch most recent year's data for districts
async function getMostRecentYear() {
	const response = await rateLimitedRequest(`${BASE_URL}/cds`);
	return response
		.filter((item: any) => item.type === 'dir')
		.map((item: any) => item.name)
		.sort((a: string, b: string) => parseInt(b) - parseInt(a))[0];
}

async function getDistrictsForYear(year: string) {
	const response = await rateLimitedRequest(`${BASE_URL}/cds/${year}`);
	return response.filter((item: any) => item.type === 'dir').map((item: any) => item.name);
}

async function fetchStateShapefile(stateCode: string) {
	const url = `${RAW_CONTENT_URL}/states/${stateCode}/shape.geojson`;
	try {
		const response = await axios.get(url);
		return response.data;
	} catch (error) {
		console.error(`Error fetching state shapefile for ${stateCode}:`, error);
		return null;
	}
}

async function fetchDistrictShapefile(year: string, districtCode: string) {
	const url = `${RAW_CONTENT_URL}/cds/${year}/${districtCode}/shape.geojson`;
	try {
		const response = await axios.get(url);
		return response.data;
	} catch (error) {
		console.error(`Error fetching district shapefile for ${districtCode} (${year}):`, error);
		return null;
	}
}

async function addStateToDatabase(stateCode: string, data: any, year: number) {
	try {
		// Check if state entry exists
		const existingEntry = await db
			.select()
			.from(geodata)
			.where(sql`${geodata.state} = ${stateCode} AND ${geodata.level} = 'state'`);

		if (existingEntry.length > 0) {
			// Update existing state entry if year is more recent
			if (year > (existingEntry[0].year || 0)) {
				await db
					.update(geodata)
					.set({
						data: data,
						year: year,
						district_number: '0' // Ensure district number is set for states
					})
					.where(sql`${geodata.state} = ${stateCode} AND ${geodata.level} = 'state'`);
				console.log(`Updated state boundary for ${stateCode}`);
			}
		} else {
			// Insert new state entry
			await db.insert(geodata).values({
				state: stateCode,
				level: 'state',
				district_number: '0',
				data: data,
				year: year
			});
			console.log(`Inserted new state boundary for ${stateCode}`);
		}
	} catch (error) {
		console.error(`Error processing state ${stateCode}:`, error);
	}
}

async function addDistrictToDatabase(year: string, districtCode: string, data: any) {
	const [state, districtNumber] = districtCode.split('-');
	const yearInt = parseInt(year);

	try {
		// Check if an entry exists for this congressional district
		const existingEntry = await db
			.select()
			.from(geodata)
			.where(
				sql`${geodata.state} = ${state} AND 
                    ${geodata.level} = 'congressional' AND 
                    ${geodata.district_number} = ${districtNumber}`
			);

		if (existingEntry.length > 0) {
			// Update if year is more recent
			if (yearInt > (existingEntry[0].year || 0)) {
				await db
					.update(geodata)
					.set({
						data: data,
						year: yearInt
					})
					.where(
						sql`${geodata.state} = ${state} AND 
                            ${geodata.level} = 'congressional' AND 
                            ${geodata.district_number} = ${districtNumber}`
					);
				console.log(`Updated congressional district ${districtCode} (${year})`);
			}
		} else {
			// Insert new entry
			await db.insert(geodata).values({
				state: state,
				level: 'congressional',
				district_number: districtNumber,
				data: data,
				year: yearInt
			});
			console.log(`Inserted new congressional district ${districtCode} (${year})`);
		}
	} catch (error) {
		console.error(`Error processing congressional district ${districtCode} (${year}):`, error);
	}
}

async function main() {
	try {
		// Get the most recent year
		const mostRecentYear = await getMostRecentYear();
		const yearInt = parseInt(mostRecentYear);
		console.log(`Using most recent year: ${mostRecentYear}`);

		// Process state boundaries first
		console.log('Processing state boundaries...');
		const stateList = [
			'AL',
			'AK',
			'AZ',
			'AR',
			'CA',
			'CO',
			'CT',
			'DE',
			'FL',
			'GA',
			'HI',
			'ID',
			'IL',
			'IN',
			'IA',
			'KS',
			'KY',
			'LA',
			'ME',
			'MD',
			'MA',
			'MI',
			'MN',
			'MS',
			'MO',
			'MT',
			'NE',
			'NV',
			'NH',
			'NJ',
			'NM',
			'NY',
			'NC',
			'ND',
			'OH',
			'OK',
			'OR',
			'PA',
			'RI',
			'SC',
			'SD',
			'TN',
			'TX',
			'UT',
			'VT',
			'VA',
			'WA',
			'WV',
			'WI',
			'WY'
		];

		for (const state of stateList) {
			console.log(`Processing state boundary for ${state}...`);
			const stateData = await fetchStateShapefile(state);
			if (stateData) {
				await addStateToDatabase(state, stateData, yearInt);
			}
			await setTimeout(1000); // Rate limiting
		}

		// Process congressional districts
		console.log(`Processing congressional districts for year ${mostRecentYear}...`);
		const districts = await getDistrictsForYear(mostRecentYear);

		for (const districtCode of districts) {
			console.log(`Processing congressional district ${districtCode}...`);
			const data = await fetchDistrictShapefile(mostRecentYear, districtCode);
			if (data) {
				await addDistrictToDatabase(mostRecentYear, districtCode, data);
			}
			await setTimeout(1000); // Rate limiting
		}

		console.log('All districts and states processed successfully.');
	} catch (error) {
		console.error('Error in main process:', error);
		throw error;
	}
}

// Add CLI options
if (require.main === module) {
	const args = process.argv.slice(2);
	const options = {
		forceUpdate: args.includes('--force'),
		statesOnly: args.includes('--states-only'),
		districtsOnly: args.includes('--districts-only')
	};

	main().catch(console.error);
}

export { main };
