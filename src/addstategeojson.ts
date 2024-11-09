// src/scripts/addStateGeoJSON.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import db from '$lib/server/database/drizzle';
import axios from 'axios';
import { geodata } from '$lib/server/database/drizzle-schemas';
import { sql } from 'drizzle-orm';

const RAW_CONTENT_URL = 'https://raw.githubusercontent.com/unitedstates/districts/gh-pages/states';

async function fetchStateShapefile(state: string) {
	const url = `${RAW_CONTENT_URL}/${state}/shape.geojson`;
	try {
		const response = await axios.get(url);
		return response.data;
	} catch (error) {
		console.error(`Error fetching shapefile for ${state}:`, error);
		return null;
	}
}

async function addStateToDatabase(state: string, data: any) {
	try {
		await db.insert(geodata).values({
			state: state,
			level: 'state',
			district_number: null,
			data: data,
			year: new Date().getFullYear()
		});

		console.log(`${state} added/updated successfully.`);
	} catch (error) {
		console.error(`Error adding/updating ${state} to database:`, error);
	}
}

async function resetGeodataTable() {
	try {
		await db.execute(sql`
            TRUNCATE TABLE geodata;
        `);
		console.log('Geodata table reset.');
	} catch (error) {
		console.error('Error resetting geodata table:', error);
	}
}

async function main() {
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

	const shouldReset = process.argv.includes('--reset');
	if (shouldReset) {
		await resetGeodataTable();
	}

	for (const state of states) {
		console.log(`Fetching and adding shapefile for ${state}...`);
		const data = await fetchStateShapefile(state);
		if (data) {
			await addStateToDatabase(state, data);
		}
	}

	console.log('All states processed.');
}

main().catch(console.error);
