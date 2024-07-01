import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://raw.githubusercontent.com/unitedstates/districts/gh-pages/states/';
const outputDir = path.join(__dirname, 'src', 'lib', 'data', 'states');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

// List of state abbreviations
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

function downloadFile(url, outputPath) {
	return new Promise((resolve, reject) => {
		https
			.get(url, (response) => {
				if (response.statusCode === 200) {
					const file = fs.createWriteStream(outputPath);
					response.pipe(file);
					file.on('finish', () => {
						file.close();
						resolve();
					});
				} else {
					reject(`Failed to download ${url}: ${response.statusCode}`);
				}
			})
			.on('error', (err) => {
				reject(`Error downloading ${url}: ${err.message}`);
			});
	});
}

async function fetchAllStateData() {
	for (const state of states) {
		const url = `${baseUrl}${state}/shape.geojson`;
		const outputPath = path.join(outputDir, `${state.toLowerCase()}.geojson`);

		try {
			await downloadFile(url, outputPath);
			console.log(`Downloaded ${state} shape data`);
		} catch (error) {
			console.error(error);
		}
	}
}

fetchAllStateData().then(() => {
	console.log('Finished downloading all state shape data');
});
