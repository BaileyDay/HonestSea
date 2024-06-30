<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import Globe from '$lib/components/globe/Globe.svelte';

	let visible = false;

	onMount(() => {
		visible = true;
	});

	function scrollToLocationInput() {
		const locationInput = document.getElementById('location-input');
		if (locationInput) {
			locationInput.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<section
	class="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br"
>
	<Globe width="100%" height="100%" />
	<div class="container px-4 md:px-6 relative z-10">
		<div class="mx-auto max-w-4xl text-center">
			{#if visible}
				<h1
					in:fly={{ y: 50, duration: 1000, delay: 300 }}
					class="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6"
				>
					<span
						class="bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-sky-500 dark:from-blue-400 dark:to-sky-400"
					>
						Transparency
					</span> at Your Fingertips
				</h1>
				<p
					in:fly={{ y: 50, duration: 1000, delay: 600 }}
					class="mt-6 text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-medium leading-relaxed"
				>
					Access comprehensive, clear information about your elected officials. Empower your
					decisions and foster accountability in politics, right from your local area to the federal
					level.
				</p>
				<div
					in:fly={{ y: 50, duration: 1000, delay: 900 }}
					class="mt-12 flex flex-col sm:flex-row justify-center gap-4"
				>
					<Button
						size="lg"
						class="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white text-lg px-8 py-4"
						on:click={scrollToLocationInput}
					>
						Get Started
					</Button>
					<Button
						size="lg"
						variant="outline"
						class="w-full sm:w-auto text-blue-800 border-blue-800 hover:bg-sky-50 dark:text-sky-400 dark:border-sky-400 dark:hover:bg-gray-800 text-lg px-8 py-4"
					>
						Learn More
					</Button>
				</div>
			{/if}
		</div>
	</div>
</section>
