<script lang="ts">
	import { Lightbulb, Scale, Users } from 'lucide-svelte';
</script>

<section class="py-16 bg-white dark:bg-gray-900">
	<div class="container mx-auto px-4 md:px-6">
		<h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
			Empowering Informed Citizenship
		</h2>
		<div class="grid md:grid-cols-3 gap-8">
			<div class="flex flex-col items-center text-center">
				<div class="bg-sky-100 dark:bg-sky-900 p-3 rounded-full mb-4">
					<Lightbulb class="w-8 h-8 text-sky-600 dark:text-sky-400" />
				</div>
				<h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
					Comprehensive Information
				</h3>
				<p class="text-gray-600 dark:text-gray-300">
					Access detailed profiles of your elected officials, including their voting records,
					sponsored bills, and campaign finance data.
				</p>
			</div>
			<div class="flex flex-col items-center text-center">
				<div class="bg-sky-100 dark:bg-sky-900 p-3 rounded-full mb-4">
					<Scale class="w-8 h-8 text-sky-600 dark:text-sky-400" />
				</div>
				<h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
					Unbiased Transparency
				</h3>
				<p class="text-gray-600 dark:text-gray-300">
					Get objective, fact-based information without partisan spin, enabling you to make informed
					decisions about your representatives.
				</p>
			</div>
			<div class="flex flex-col items-center text-center">
				<div class="bg-sky-100 dark:bg-sky-900 p-3 rounded-full mb-4">
					<Users class="w-8 h-8 text-sky-600 dark:text-sky-400" />
				</div>
				<h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
					Civic Engagement Tools
				</h3>
				<p class="text-gray-600 dark:text-gray-300">
					Easily connect with your representatives, track important legislation, and stay informed
					about local political events.
				</p>
			</div>
		</div>
	</div>
</section>
