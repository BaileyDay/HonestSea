<script lang="ts">
	import { goto } from '$app/navigation';
	import { MapPin, Loader2 } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { fly, fade } from 'svelte/transition';

	let address = '';
	let errorMessage = '';
	let isLoading = false;

	const getLocation = async () => {
		if (navigator.geolocation) {
			isLoading = true;
			errorMessage = '';
			navigator.geolocation.getCurrentPosition(showPosition, showError);
		} else {
			errorMessage = 'Geolocation is not supported by this browser.';
		}
	};

	function showPosition(position) {
		const latitude = position.coords.latitude;
		const longitude = position.coords.longitude;
		redirectToLocation(latitude, longitude);
	}

	const redirectToLocation = async (latitude: number, longitude: number) => {
		try {
			const response = await fetch('/api/location', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					latitude: latitude,
					longitude: longitude
				})
			});

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const data = await response.json();
			if (data.redirectUrl) {
				goto(data.redirectUrl);
			} else {
				errorMessage = 'Unable to find location information. Please try again.';
			}
		} catch (error) {
			console.error('Failed to send location:', error);
			errorMessage = 'An error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	};

	function showError(error: GeolocationPositionError) {
		isLoading = false;
		switch (error.code) {
			case error.PERMISSION_DENIED:
				errorMessage = 'Please enable location services or enter your address manually.';
				break;
			case error.POSITION_UNAVAILABLE:
				errorMessage =
					'Location information is unavailable. Please try again or enter your address manually.';
				break;
			case error.TIMEOUT:
				errorMessage =
					'The request to get your location timed out. Please try again or enter your address manually.';
				break;
			default:
				errorMessage =
					'An unknown error occurred. Please try again or enter your address manually.';
				break;
		}
	}

	const handleAddressSubmit = async () => {
		if (!address.trim()) {
			errorMessage = 'Please enter an address.';
			return;
		}

		isLoading = true;
		errorMessage = '';
		try {
			// Here you would typically call a geocoding service to convert the address to coordinates
			// For this example, we'll simulate it with a timeout
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Replace these with actual geocoding results
			const latitude = 40.7128;
			const longitude = -74.006;

			await redirectToLocation(latitude, longitude);
		} catch (error) {
			console.error('Error processing address:', error);
			errorMessage = 'Unable to process your address. Please try again.';
		} finally {
			isLoading = false;
		}
	};
</script>

<section
	class="w-full py-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900"
>
	<div class="container px-4 md:px-6 mx-auto max-w-xl">
		<div
			in:fly={{ y: 50, duration: 1000 }}
			class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8"
		>
			<h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
				Find Your Representatives
			</h2>
			<form on:submit|preventDefault={handleAddressSubmit} class="space-y-4">
				<div class="relative">
					<div
						on:click={getLocation}
						class="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors duration-200 ease-in-out"
					>
						<MapPin class="h-5 w-5 text-blue-500 hover:text-blue-600" />
					</div>
					<Input
						bind:value={address}
						class="w-full pl-12 pr-4 py-3 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded-lg transition-all duration-200 ease-in-out"
						placeholder="Enter your address"
						type="text"
						disabled={isLoading}
					/>
				</div>
				<Button
					type="submit"
					class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 ease-in-out focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
					disabled={isLoading}
				>
					{#if isLoading}
						<Loader2 class="animate-spin mr-2 h-5 w-5 inline" />
						Loading...
					{:else}
						Find My Representatives
					{/if}
				</Button>
			</form>
			{#if errorMessage}
				<p in:fade class="text-red-500 mt-4 text-center">{errorMessage}</p>
			{/if}
			<p class="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
				Click the map pin icon to use your current location, or enter your address manually.
			</p>
		</div>
	</div>
</section>
