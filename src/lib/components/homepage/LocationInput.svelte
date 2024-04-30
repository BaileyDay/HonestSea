<script>
	import { MapPin } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
</script>

<section class="w-full pb-12">
	<div class="container px-4 md:px-12 lg:w-1/2">
		<div class="relative">
			<MapPin class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
			<Input
				class="w-full rounded-md border border-gray-300 px-12 py-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
				placeholder="Enter your location"
				type="text"
			/>
		</div>
	</div>
</section>
