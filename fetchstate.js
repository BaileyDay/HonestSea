// fetchstate.js
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { geodata } from './geodata-schema.js';
import db from './src/lib/server/database/drizzle.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://theunitedstates.io/districts/';
const states = [
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

async function fetchData(url) {
	return new Promise((resolve, reject) => {
		https
			.get(url, (response) => {
				if (response.statusCode === 404) {
					resolve(null); // Return null for 404 errors
				} else {
					let data = '';
					response.on('data', (chunk) => {
						data += chunk;
					});
					response.on('end', () => resolve(data));
				}
			})
			.on('error', reject);
	});
}

async function upsertGeodata(state, level, districtNumber, data) {
	try {
		await db.insert(geodata).values({
			state,
			level,
			district_number: districtNumber,
			data
		});
		console.log(`Upserted data for ${state} ${level} ${districtNumber}`);
	} catch (error) {
		console.error(`Error upserting data for ${state} ${level} ${districtNumber}:`, error);
	}
}

async function processDistrictData(state, districtNumber) {
	const url = `${baseUrl}cds/2012/${state}-${districtNumber}/shape.geojson`;
	console.log(`Fetching Congressional district ${districtNumber} data for ${state}...`);
	try {
		const data = await fetchData(url);
		if (data === null) {
			console.log(`No data found for ${state} Congressional district ${districtNumber}`);
			return false;
		}
		const parsedData = JSON.parse(data);
		await upsertGeodata(state, 'district', districtNumber.toString(), parsedData);
		console.log(
			`Successfully processed Congressional district ${districtNumber} data for ${state}`
		);
		return true;
	} catch (error) {
		console.error(
			`Error processing Congressional district ${districtNumber} data for ${state}:`,
			error.message
		);
		if (error instanceof SyntaxError) {
			console.error(
				`Invalid JSON for ${state} Congressional district ${districtNumber} data. First 100 characters:`,
				data.slice(0, 100)
			);
		}
		return false;
	}
}

async function processStateData(state) {
	console.log(`Processing ${state}...`);

	// State shape
	const stateUrl = `${baseUrl}states/${state}/shape.geojson`;
	try {
		const stateData = await fetchData(stateUrl);
		if (stateData) {
			const parsedStateData = JSON.parse(stateData);
			await upsertGeodata(state, 'state', null, parsedStateData);
			console.log(`Successfully processed state shape for ${state}`);
		} else {
			console.log(`No state shape data found for ${state}`);
		}
	} catch (error) {
		console.error(`Error processing state shape for ${state}:`, error.message);
	}

	// Process Congressional districts
	let districtNumber = 1; // Start with 0 for "At Large" districts
	while (await processDistrictData(state, districtNumber)) {
		districtNumber++;
	}
}

async function fetchAndStoreGeodata() {
	for (const state of states) {
		await processStateData(state);
	}

	console.log('Finished fetching and storing all geodata');
}

// Run the script
fetchAndStoreGeodata()
	.then(() => {
		console.log('Script completed');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Script failed:', error);
		process.exit(1);
	});
