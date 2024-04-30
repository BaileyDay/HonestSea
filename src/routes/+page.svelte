<script lang="ts">
	import { goto } from '$app/navigation';
	import Globe from '$lib/components/globe/Globe.svelte';
	import HomeHero from '$lib/components/homepage/HomeHero.svelte';
	import LocationInput from '$lib/components/homepage/LocationInput.svelte';
	import { Button } from '$lib/components/ui/button';
	import { APP_NAME } from '$lib/config/constants';
</script>

<svelte:head>
	<title>{APP_NAME}</title>
	<meta
		name="description"
		content="Sveltekit Auth Starter - An open source auth starter project utilizing lucia-auth, skeleton ui, prisma and sveltekit."
	/>
</svelte:head>

<div>
	<HomeHero />
	<LocationInput />
	<Globe />
</div>
