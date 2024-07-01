<script lang="ts">
	import { fade } from 'svelte/transition';

	export let official: {
		name: string;
		title: string;
		party: string;
		image_url: string;
		websites: string | string[];
		emails: string | string[];
		phones: string | string[];
	};

	function parseData(data: string | string[]): string[] {
		if (typeof data === 'string') {
			try {
				return JSON.parse(data);
			} catch {
				return data ? [data] : [];
			}
		}
		return data || [];
	}

	$: websitesList = parseData(official.websites);
	$: emailsList = parseData(official.emails);
	$: phonesList = parseData(official.phones);

	function getPartyColor(party: string): string {
		switch (party.toLowerCase()) {
			case 'democratic party':
				return 'bg-blue-500';
			case 'republican party':
				return 'bg-red-500';
			default:
				return 'bg-gray-500';
		}
	}

	function getPartyAbbreviation(party: string): string {
		switch (party.toLowerCase()) {
			case 'democratic party':
				return 'D';
			case 'republican party':
				return 'R';
			default:
				return 'I';
		}
	}
</script>

<div
	class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 border border-gray-200 dark:border-gray-700"
	style="backdrop-filter: blur(10px);"
	in:fade={{ duration: 300 }}
>
	<div class="relative p-4">
		<div class="flex items-center">
			<div class="relative">
				<img
					src={official.image_url || `https://ui-avatars.com/api/?name=${official.name}`}
					alt={official.name}
					class="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-700"
				/>
				<div
					class={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${getPartyColor(
						official.party
					)} flex items-center justify-center text-white font-bold text-xs`}
				>
					{getPartyAbbreviation(official.party)}
				</div>
			</div>
			<div class="ml-4 flex-grow">
				<h2 class="text-xl font-bold text-gray-900 dark:text-white">{official.name}</h2>
				<p class="text-sm text-gray-600 dark:text-gray-300 mb-2">{official.title}</p>
				<div class="flex space-x-2">
					<button
						class="px-3 py-1 bg-sky-500 text-white text-sm rounded-lg hover:bg-sky-600 transition-colors duration-200"
					>
						Contact
					</button>
					<button
						class="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
					>
						More Info
					</button>
				</div>
			</div>
		</div>

		<div class="mt-3 space-y-1 text-sm">
			{#if websitesList.length > 0}
				<a
					href={websitesList[0]}
					target="_blank"
					rel="noopener noreferrer"
					class="block text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300"
				>
					Official Website
				</a>
			{/if}
			{#if emailsList.length > 0}
				<p class="text-gray-600 dark:text-gray-400">
					<span class="font-semibold">Email:</span>
					{emailsList[0]}
				</p>
			{/if}
			{#if phonesList.length > 0}
				<p class="text-gray-600 dark:text-gray-400">
					<span class="font-semibold">Phone:</span>
					{phonesList[0]}
				</p>
			{/if}
		</div>
	</div>
</div>
