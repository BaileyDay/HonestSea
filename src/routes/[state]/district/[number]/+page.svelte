<script lang="ts">
	export let data;
	const { representative, sponsoredBills = [], cosponsoredBills = [] } = data;

	function formatDate(dateString: string): string {
		if (!dateString) return 'Date not available';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getBillUrl(bill: any): string {
		if (!bill?.congress || !bill?.type || !bill?.number) {
			return '#';
		}
		try {
			// Convert bill type to the format needed for the URL
			const billTypeMap: { [key: string]: string } = {
				'H.R.': 'house-bill',
				'S.': 'senate-bill',
				'H.J.Res.': 'house-joint-resolution',
				'S.J.Res.': 'senate-joint-resolution',
				'H.Con.Res.': 'house-concurrent-resolution',
				'S.Con.Res.': 'senate-concurrent-resolution',
				'H.Res.': 'house-resolution',
				'S.Res.': 'senate-resolution'
			};

			const urlBillType = billTypeMap[bill.type] || bill.type.toLowerCase();
			return `https://www.congress.gov/bill/${bill.congress}th-congress/${urlBillType}/${bill.number}`;
		} catch (error) {
			console.error('Error generating bill URL:', error);
			return '#';
		}
	}

	function getBillStatusColor(status: string | null): string {
		if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';

		const statusLower = status.toLowerCase();
		if (statusLower.includes('introduced'))
			return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
		if (statusLower.includes('passed'))
			return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
		if (statusLower.includes('failed'))
			return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
		return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
	}

	function getBillTitle(bill: any): string {
		return bill?.title || 'Title not available';
	}

	function getBillIdentifier(bill: any): string {
		if (!bill?.congress || !bill?.type || !bill?.number) {
			return 'Bill information not available';
		}
		return `${bill.congress}th Congress - ${bill.type} ${bill.number}`;
	}

	function getPartyColor(party: string): string {
		const partyLower = party?.toLowerCase() || '';
		if (partyLower.includes('democratic')) return 'bg-blue-500';
		if (partyLower.includes('republican')) return 'bg-red-500';
		return 'bg-gray-500';
	}

	// Filter out invalid bills and sort them
	$: validSponsoredBills = sponsoredBills.filter((bill) => bill && bill.congress);
	$: validCosponsoredBills = cosponsoredBills.filter((bill) => bill && bill.congress);
	$: allBills = [...validSponsoredBills, ...validCosponsoredBills]
		.filter((bill) => bill && bill.latestAction)
		.sort((a, b) => {
			const dateA = new Date(a.latestAction?.actionDate || 0).getTime();
			const dateB = new Date(b.latestAction?.actionDate || 0).getTime();
			return dateB - dateA;
		});
</script>

<!-- Hero Section remains the same -->

<div
	class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
>
	<!-- Hero Section -->
	<div class="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900">
		<div class="container mx-auto px-4 py-16">
			<div class="max-w-5xl mx-auto">
				<div class="flex flex-col md:flex-row items-center md:items-start gap-8">
					{#if representative?.depiction?.imageUrl}
						<div class="relative">
							<img
								src={representative.depiction.imageUrl}
								alt={representative.name}
								class="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
							/>
							<div
								class="absolute bottom-2 right-2 px-3 py-1 rounded-full bg-white text-sm font-semibold {getPartyColor(
									representative.partyName
								)} text-white"
							>
								{representative.partyName.charAt(0)}
							</div>
						</div>
					{/if}
					<div class="text-center md:text-left text-white">
						<h1 class="text-4xl md:text-5xl font-bold mb-2">
							{representative?.name || 'Representative'}
						</h1>
						<p class="text-xl md:text-2xl opacity-90 mb-4">
							Representative for {representative?.state} District {representative?.district}
						</p>
						<div class="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
							<div class="bg-white/10 backdrop-blur-md rounded-lg px-6 py-3">
								<div class="text-3xl font-bold">{validSponsoredBills.length}</div>
								<div class="text-sm opacity-90">Sponsored Bills</div>
							</div>
							<div class="bg-white/10 backdrop-blur-md rounded-lg px-6 py-3">
								<div class="text-3xl font-bold">{validCosponsoredBills.length}</div>
								<div class="text-sm opacity-90">Cosponsored Bills</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Legislative Activity -->
	<div class="container mx-auto px-4 py-12">
		<div class="max-w-6xl mx-auto">
			<!-- Recent Activity Grid -->
			<div class="grid md:grid-cols-2 gap-8 mb-16">
				<!-- Sponsored Bills -->
				<div>
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 mr-2 text-blue-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						Recently Sponsored Bills
					</h2>
					<div class="space-y-4">
						{#each validSponsoredBills.slice(0, 5) as bill}
							<a
								href={getBillUrl(bill)}
								target="_blank"
								rel="noopener noreferrer"
								class="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
							>
								<div class="flex justify-between items-start gap-4">
									<div>
										<h3 class="font-semibold text-gray-900 dark:text-white text-lg">
											{getBillTitle(bill)}
										</h3>
										<p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
											{getBillIdentifier(bill)}
										</p>
										{#if bill?.latestAction}
											<div class="mt-3 flex items-center">
												<span
													class="text-xs px-2 py-1 rounded-full {getBillStatusColor(
														bill.latestAction.text
													)}"
												>
													{bill.latestAction.text || 'Status not available'}
												</span>
												<span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
													{formatDate(bill.latestAction.actionDate)}
												</span>
											</div>
										{/if}
									</div>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5 text-gray-400 flex-shrink-0"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
							</a>
						{/each}
					</div>
				</div>

				<!-- Cosponsored Bills -->
				<div>
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 mr-2 text-green-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
						Recently Cosponsored Bills
					</h2>
					<div class="space-y-4">
						{#each validCosponsoredBills.slice(0, 5) as bill}
							<a
								href={getBillUrl(bill)}
								target="_blank"
								rel="noopener noreferrer"
								class="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
							>
								<div class="flex justify-between items-start gap-4">
									<div>
										<h3 class="font-semibold text-gray-900 dark:text-white text-lg">
											{getBillTitle(bill)}
										</h3>
										<p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
											{getBillIdentifier(bill)}
										</p>
										{#if bill?.latestAction}
											<div class="mt-3 flex items-center">
												<span
													class="text-xs px-2 py-1 rounded-full {getBillStatusColor(
														bill.latestAction.text
													)}"
												>
													{bill.latestAction.text || 'Status not available'}
												</span>
												<span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
													{formatDate(bill.latestAction.actionDate)}
												</span>
											</div>
										{/if}
									</div>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5 text-gray-400 flex-shrink-0"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
							</a>
						{/each}
					</div>
				</div>
			</div>

			<!-- Full Legislative Timeline -->
			<div class="mt-16">
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8 mr-3 text-indigo-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					Legislative Timeline
				</h2>
				<div class="space-y-6">
					{#each allBills as bill}
						<a
							href={getBillUrl(bill)}
							target="_blank"
							rel="noopener noreferrer"
							class="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
						>
							<div class="flex justify-between items-start gap-4">
								<div class="flex-grow">
									<h3 class="font-semibold text-gray-900 dark:text-white text-lg">
										{getBillTitle(bill)}
									</h3>
									<p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
										{getBillIdentifier(bill)}
									</p>
									{#if bill?.latestAction}
										<div class="mt-3 flex items-center flex-wrap gap-2">
											<span
												class="text-xs px-2 py-1 rounded-full {getBillStatusColor(
													bill.latestAction.text
												)}"
											>
												{bill.latestAction.text || 'Status not available'}
											</span>
											<span class="text-xs text-gray-500 dark:text-gray-400">
												{formatDate(bill.latestAction.actionDate)}
											</span>
										</div>
									{/if}
								</div>
								<div class="flex items-center gap-3">
									<span
										class="text-sm font-semibold px-3 py-1 rounded-full {bill.sponsored
											? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
											: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'}"
									>
										{bill.sponsored ? 'Sponsored' : 'Cosponsored'}
									</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5 text-gray-400 flex-shrink-0"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.leaflet-container) {
		height: 100%;
		width: 100%;
		background-color: rgba(30, 64, 175, 0.05);
	}
</style>
