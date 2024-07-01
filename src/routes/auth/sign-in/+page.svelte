<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import { userSchema } from '$lib/config/zod-schemas';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { Loader2, AlertCircle, Mail, Lock } from 'lucide-svelte';

	const signInSchema = userSchema.pick({
		email: true,
		password: true
	});

	type SignInSchema = typeof signInSchema;

	export let form: SuperValidated<SignInSchema>;
</script>

<div
	class="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8"
>
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
				Sign in to your account
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
				Or
				<a
					href="/auth/sign-up"
					class="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
				>
					create a new account
				</a>
			</p>
		</div>
		<Form.Root
			let:submitting
			let:errors
			method="POST"
			{form}
			schema={signInSchema}
			let:config
			class="mt-8 space-y-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg px-4 py-5 sm:p-6"
		>
			{#if errors?._errors?.length}
				<Alert.Root variant="destructive">
					<AlertCircle class="h-4 w-4" />
					<Alert.Title>Error</Alert.Title>
					<Alert.Description>
						{#each errors._errors as error}
							{error}
						{/each}
					</Alert.Description>
				</Alert.Root>
			{/if}
			<div class="rounded-md shadow-sm -space-y-px">
				<Form.Field {config} name="email">
					<Form.Item>
						<div class="relative">
							<Form.Label class="sr-only">Email address</Form.Label>
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Mail class="h-5 w-5 text-gray-400" />
							</div>
							<Form.Input
								class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm pl-10"
								placeholder="Email address"
							/>
						</div>
						<Form.Validation />
					</Form.Item>
				</Form.Field>
				<Form.Field {config} name="password">
					<Form.Item>
						<div class="relative">
							<Form.Label class="sr-only">Password</Form.Label>
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Lock class="h-5 w-5 text-gray-400" />
							</div>
							<Form.Input
								type="password"
								class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm pl-10"
								placeholder="Password"
							/>
						</div>
						<Form.Validation />
					</Form.Item>
				</Form.Field>
			</div>

			<div class="flex items-center justify-between">
				<div class="flex items-center">
					<input
						id="remember-me"
						name="remember-me"
						type="checkbox"
						class="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
					/>
					<label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
						Remember me
					</label>
				</div>

				<div class="text-sm">
					<a
						href="/auth/password/reset"
						class="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
					>
						Forgot your password?
					</a>
				</div>
			</div>

			<div>
				<Form.Button
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
					disabled={submitting}
				>
					{#if submitting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Please wait
					{:else}
						Sign In
					{/if}
				</Form.Button>
			</div>
		</Form.Root>
	</div>
</div>
