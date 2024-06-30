<script lang="ts">
	import { APP_NAME } from '$lib/config/constants';
	// Import any icons you need, e.g., from Lucide
	import { Github, Twitter, Facebook } from 'lucide-svelte';
</script>

<footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
	<div class="container mx-auto px-4 py-12 md:py-16">
		<div class="flex flex-col md:flex-row justify-between items-center">
			<div class="mb-8 md:mb-0">
				<a href="/" class="text-2xl font-bold text-blue-600 dark:text-blue-400">
					{APP_NAME}
				</a>
				<p class="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md">
					Empowering citizens with transparent information about their elected officials. Track,
					understand, and engage with your leaders.
				</p>
			</div>
			<div class="flex space-x-6">
				<a
					href="https://github.com/yourusername"
					class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
				>
					<span class="sr-only">GitHub</span>
					<Github class="h-6 w-6" />
				</a>
				<a
					href="https://twitter.com/yourusername"
					class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
				>
					<span class="sr-only">Twitter</span>
					<Twitter class="h-6 w-6" />
				</a>
				<a
					href="https://facebook.com/yourusername"
					class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
				>
					<span class="sr-only">Facebook</span>
					<Facebook class="h-6 w-6" />
				</a>
			</div>
		</div>
		<div
			class="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center"
		>
			<nav class="flex flex-wrap justify-center mb-4 md:mb-0">
				<a
					href="/about"
					class="text-sm text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 mr-4 mb-2"
				>
					About
				</a>
				<a
					href="/privacy"
					class="text-sm text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 mr-4 mb-2"
				>
					Privacy
				</a>
				<a
					href="/terms"
					class="text-sm text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 mr-4 mb-2"
				>
					Terms
				</a>
				<a
					href="/contact"
					class="text-sm text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 mb-2"
				>
					Contact
				</a>
			</nav>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				© {new Date().getFullYear()}
				{APP_NAME}. All rights reserved.
			</p>
		</div>
	</div>
</footer>
