<script lang="ts">
	import { goto } from '$app/navigation';
	import HomeHero from '$lib/components/homepage/HomeHero.svelte';
	import KeyFeatures from '$lib/components/homepage/KeyFeatures.svelte';
	import LocationInput from '$lib/components/homepage/LocationInput.svelte';
	import { Button } from '$lib/components/ui/button';
	import { APP_NAME } from '$lib/config/constants';
</script>

<svelte:head>
	<title>{APP_NAME} - Find Your Elected Officials</title>
	<meta
		name="description"
		content="HonestSea empowers citizens with transparent information about their elected officials. Enter your address to discover your representatives, their voting records, and more."
	/>
</svelte:head>

<div class="flex flex-col min-h-screen">
	<HomeHero />

	<section class="py-16 bg-white dark:bg-gray-900">
		<div class="max-w-3xl mx-auto text-center px-4">
			<h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
				Discover Your Elected Officials
			</h2>
			<p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12">
				Enter your address to find comprehensive, unbiased information about your representatives,
				their voting records, and their donors.
			</p>
		</div>
		<div id="location-input">
			<LocationInput />
		</div>
	</section>
	<KeyFeatures />
</div>
