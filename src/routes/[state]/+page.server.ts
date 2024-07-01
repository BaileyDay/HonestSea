import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const stateName = params.state;

	try {
		return {
			stateData: { name: stateName }
		};
	} catch (error) {
		console.error('Error fetching state data:', error);
		return {
			status: 500,
			error: 'Failed to load state data'
		};
	}
};

function processStateData(data: any) {
	// Transform the API response into the format your frontend expects
	// This is a placeholder function - implement the actual logic based on the API response structure
	return {
		name: data.normalizedInput.state,
		officials: data.officials,
		offices: data.offices
		// Add more processed data as needed
	};
}
