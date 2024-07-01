<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Sun, Moon, UserRound, LogOut } from 'lucide-svelte';
	import { setMode } from 'mode-watcher';
	import { APP_NAME } from '$lib/config/constants';
	import Logo from '$lib/components/logo/logo.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import convertNameToInitials from '$lib/_helpers/convertNameToInitials';

	export let user: any;
	$: currentPage = $page.url.pathname;

	function signOut() {
		var form = document.createElement('form');
		form.method = 'POST';
		form.action = '/auth/sign-out';
		document.body.appendChild(form);
		form.submit();
	}

	let initials: string = '';
	$: {
		if (user) {
			initials = convertNameToInitials(user.firstName, user.lastName);
		}
	}
</script>

<header
	class="bg-white dark:bg-gray-900 sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800"
>
	<div class="container mx-auto px-4">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center">
				<a href="/" class="flex items-center space-x-2">
					<Logo size="32" />
					<span class="text-xl font-bold text-sky-500 dark:text-sky-400">{APP_NAME}</span>
				</a>
				<nav class="hidden md:ml-10 md:flex md:space-x-8">
					<a
						href="/"
						class="text-gray-700 hover:text-blue-800 dark:text-gray-300 dark:hover:text-sky-400 px-3 py-2 text-sm font-medium"
						class:active={'/' === currentPage}
					>
						Home
					</a>
					<!-- Add more navigation items here -->
				</nav>
			</div>
			<div class="flex items-center">
				<!-- {#if !user}
					<Button
						on:click={() => goto('/auth/sign-in')}
						class="bg-sky-500 hover:bg-sky-600 text-white mr-4"
					>
						Sign in
					</Button>
				{/if} -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button
							builders={[builder]}
							variant="ghost"
							size="icon"
							class="text-gray-700 dark:text-gray-300"
						>
							<Sun class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<Moon
								class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
							/>
							<span class="sr-only">Toggle theme</span>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Item on:click={() => setMode('light')}>Light</DropdownMenu.Item>
						<DropdownMenu.Item on:click={() => setMode('dark')}>Dark</DropdownMenu.Item>
						<DropdownMenu.Item on:click={() => setMode('system')}>System</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
				{#if user}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button variant="ghost" builders={[builder]} class="ml-4 h-8 w-8 rounded-full">
								<Avatar.Root class="h-8 w-8 bg-sky-500 text-white">
									<Avatar.Fallback>{initials}</Avatar.Fallback>
								</Avatar.Root>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56" align="end">
							<DropdownMenu.Label class="font-normal">
								<div class="flex flex-col space-y-1">
									<p class="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
									<p class="text-xs leading-none text-gray-500 dark:text-gray-400">{user.email}</p>
								</div>
							</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Item on:click={() => goto('/profile')}>
								<UserRound class="mr-2 h-4 w-4" />
								Profile
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item on:click={signOut}>
								<LogOut class="mr-2 h-4 w-4" />
								Sign out
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{/if}
			</div>
		</div>
	</div>
</header>

<style>
	.active {
		@apply text-blue-800 dark:text-sky-400;
	}
</style>
