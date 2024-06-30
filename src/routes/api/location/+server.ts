import { env } from '$env/dynamic/private';
export async function POST(request) {
	console.log(request.body);
	// const { latitude, longitude } = JSON.parse(request.body);

	// const apiKey = env.GOOGLE_API_KEY;
	// const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

	// const response = await fetch(url);
	// const data = await response.json();

	// console.log(data);

	return new Response(request);
}
