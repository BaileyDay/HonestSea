// lib/utils/state-abbreviations.ts

interface StateAbbreviations {
	[key: string]: string;
}

export const abr: StateAbbreviations = {
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

// Reverse mapping from abbreviation to full name
export const reverseAbr: StateAbbreviations = Object.entries(abr).reduce(
	(acc, [name, abbr]) => ({
		...acc,
		[abbr.toLowerCase()]: name
	}),
	{}
);

// Utility function to get state name from abbreviation
export function getStateName(abbreviation: string): string | undefined {
	return reverseAbr[abbreviation.toLowerCase()];
}

// Utility function to get state abbreviation from name
export function getStateAbbreviation(name: string): string | undefined {
	return abr[name.toLowerCase()];
}

// Utility function to validate if a string is a valid state name or abbreviation
export function isValidState(input: string): boolean {
	const lowercased = input.toLowerCase();
	return Boolean(abr[lowercased] || reverseAbr[lowercased]);
}

// Get array of all state names
export function getAllStateNames(): string[] {
	return Object.keys(abr);
}

// Get array of all state abbreviations
export function getAllStateAbbreviations(): string[] {
	return Object.values(abr);
}
