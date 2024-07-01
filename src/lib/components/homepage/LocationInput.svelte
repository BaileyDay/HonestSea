<script lang="ts">
	import { goto } from '$app/navigation';
	import { MapPin, Loader2, Search } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { fly, fade } from 'svelte/transition';
	import { debounce } from 'lodash-es';

	let address = '';
	let suggestions: Array<{ place_name: string; id: string; type: string }> = [];
	let errorMessage = '';
	let isLoading = false;

	function sanitizeInput(input: string): string {
		return input.replace(/[^a-zA-Z0-9\s.,'-]/g, '').trim();
	}

	const fetchSuggestions = debounce(async (input: string) => {
		if (input.length < 3) {
			suggestions = [];
			return;
		}

		const sanitizedInput = sanitizeInput(input);

		try {
			const response = await fetch(`/api/geocode?input=${encodeURIComponent(sanitizedInput)}`);
			if (!response.ok) throw new Error('Failed to fetch suggestions');
			const data = await response.json();
			suggestions = data.suggestions;
		} catch (error) {
			console.error('Error fetching suggestions:', error);
			suggestions = [];
		}
	}, 300);

	$: {
		fetchSuggestions(address);
	}

	const selectSuggestion = (suggestion: { place_name: string; id: string; type: string }) => {
		address = suggestion.place_name;
		suggestions = [];
		if (suggestion.type === 'region') {
			goto(
				`/${suggestion.place_name.toLowerCase().replace(/\s+/g, '-')}?lat=${
					suggestion.center[1]
				}&lon=${suggestion.center[0]}`
			);
		} else {
			handleAddressSubmit();
		}
	};

	const handleAddressSubmit = async (selectedAddress?: string) => {
		const sanitizedAddress = sanitizeInput(selectedAddress || address);
		if (!sanitizedAddress) {
			errorMessage = 'Please enter a valid address.';
			return;
		}

		isLoading = true;
		errorMessage = '';
		try {
			const response = await fetch('/api/geocode', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ address: sanitizedAddress })
			});

			if (!response.ok) throw new Error('Failed to process address');

			const data = await response.json();
			if (data.state) {
				goto(`/${data.state.toLowerCase().replace(/\s+/g, '-')}?lat=${data.lat}&lon=${data.lng}`);
			} else {
				errorMessage = 'Unable to determine state from the given address.';
			}
		} catch (error) {
			console.error('Error processing address:', error);
			errorMessage = 'Unable to process your address. Please try again.';
		} finally {
			isLoading = false;
		}
	};
</script>

<section
	class="w-full py-16 bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-800 dark:to-gray-900"
>
	<div class="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
		<div
			in:fly={{ y: 50, duration: 1000 }}
			class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10"
		>
			<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
				Find Your Representatives
			</h2>
			<form on:submit|preventDefault={handleAddressSubmit} class="space-y-6">
				<div class="relative">
					<div
						class="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ease-in-out"
					>
						<MapPin class="h-5 w-5 text-sky-500" />
					</div>
					<Input
						bind:value={address}
						on:input={() => fetchSuggestions(address)}
						class="w-full pl-12 pr-4 py-4 text-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-800 rounded-lg transition-all duration-200 ease-in-out"
						placeholder="Enter your address or state"
						type="text"
						disabled={isLoading}
					/>
					{#if suggestions.length > 0}
						<ul class="absolute z-10 w-full bg-white dark:bg-gray-700 mt-1 rounded-lg shadow-lg">
							{#each suggestions as suggestion}
								<li
									class="px-4 py-2 hover:bg-sky-100 dark:hover:bg-sky-800 cursor-pointer"
									on:click={() => selectSuggestion(suggestion)}
								>
									{suggestion.place_name}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
				<Button
					type="submit"
					class="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-4 rounded-lg text-lg transition-colors duration-200 ease-in-out focus:ring-4 focus:ring-sky-300 dark:focus:ring-sky-900 flex items-center justify-center"
					disabled={isLoading}
				>
					{#if isLoading}
						<Loader2 class="animate-spin mr-2 h-5 w-5" />
						Searching...
					{:else}
						<Search class="mr-2 h-5 w-5" />
						Find My Representatives
					{/if}
				</Button>
				<p class="text-sm text-gray-600 dark:text-gray-400 mt-6 text-center">
					Click the map pin icon to use your current location, or enter your address manually.
				</p>
			</form>
			{#if errorMessage}
				<p in:fade class="text-red-500 mt-6 text-center">{errorMessage}</p>
			{/if}
		</div>
	</div>
</section>
