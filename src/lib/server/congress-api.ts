// lib/server/congress-api.ts
import { CONGRESS_API_KEY } from '$env/static/private';
interface CongressMember {
	name: string;
	party: string;
	state: string;
	district: string;
	title: string;
	role: string;
	photo?: string;
}

export async function getCongressMembers(state: string): Promise<CongressMember[]> {
	try {
		const url = `https://api.congress.gov/v3/member/${state}?format=json&api_key=${CONGRESS_API_KEY}&currentMember=true`;

		console.log('Fetching Congress members from:', url.replace(CONGRESS_API_KEY!, '[REDACTED]'));

		const response = await fetch(url);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Failed to fetch Congress members: ${response.status} ${response.statusText}\n${errorText}`
			);
		}

		const data = await response.json();

		// Transform the data to match your existing officials structure
		return data.members.map((member: any) => ({
			name: member.name, // Already in "Last, First" format
			party: member.partyName,
			state: member.state,
			district: member.district?.toString() || 'AL',
			title: member.terms?.item[0]?.chamber || 'Representative',
			role: 'representative',
			photo: member.depiction?.imageUrl
		}));
	} catch (error) {
		console.error('Error fetching Congress members:', error);
		return [];
	}
}
