<script lang="ts">
	interface OneshotResult {
		idea: string;
		details: string;
		characters_involved: string[];
	}

	let prompt = '';
	let result: OneshotResult | null = null;
	let isLoading = false;
	let error: string | null = null;

	async function generateOneshot() {
		if (!prompt.trim()) return;

		isLoading = true;
		error = null;

		try {
			// Connect to your backend API
			const response = await fetch('http://localhost:8000/api/generate-oneshot', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ prompt })
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}

			result = await response.json();
		} catch (err: unknown) {
			console.error('Failed to generate oneshot:', err);
			error = err instanceof Error ? err.message : 'Failed to connect to the API';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container mx-auto h-full max-w-3xl p-8">
	<div class="space-y-8">
		<header class="space-y-2 text-center">
			<h1 class="h1 text-4xl font-bold md:text-5xl">Oneshot RPG Generator</h1>
		</header>

		<!-- Input Form -->
		<div class="card bg-surface-800 border-surface-700 rounded-xl border p-6 shadow-xl">
			<form on:submit|preventDefault={generateOneshot} class="space-y-6">
				<label class="label">
					<span class="text-lg font-semibold text-white">Enter your adventure prompt</span>
					<textarea
						bind:value={prompt}
						class="input bg-surface-900 border-surface-700 h-32 w-full rounded-lg p-4 text-white shadow-inner"
						placeholder="e.g., A haunted lighthouse with a time travel mystery, a dwarven kingdom facing a geological disaster, a cyberpunk heist in a corporate arcology..."
					></textarea>
					<span class="text-surface-300-600-token mt-2 block text-sm"
						>Be as descriptive or vague as you like - our AI will craft a unique adventure!</span
					>
				</label>

				<!-- Improved Button Styling -->
				<button
					type="submit"
					class="btn bg-primary-500 hover:bg-primary-600 w-full rounded-lg py-3 text-lg font-bold text-black shadow-lg transition-all hover:shadow-xl"
					disabled={isLoading || !prompt.trim()}
				>
					{#if isLoading}
						<span class="loading loading-spinner mr-2"></span>
						<span>Crafting your adventure...</span>
					{:else}
						<span>Generate Oneshot</span>
					{/if}
				</button>
			</form>
		</div>

		<!-- Error Alert -->
		{#if error}
			<div class="bg-error-500 rounded-lg p-4 text-white shadow-lg">
				<div class="flex items-start gap-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
						class="h-8 flex-shrink-0"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" x2="12" y1="8" y2="12"></line>
						<line x1="12" x2="12.01" y1="16" y2="16"></line>
					</svg>
					<div>
						<h3 class="h3 mb-2">Connection Error</h3>
						<p>
							Unable to reach the adventure generator service. Please ensure the backend is running
							and try again.
						</p>
						<p class="mt-2 text-sm opacity-75">Technical details: {error}</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Results Card -->
		{#if result}
			<div
				class="card bg-surface-800 border-surface-700 overflow-hidden rounded-xl border shadow-xl"
			>
				<header class="border-surface-600/20 bg-surface-700 border-b p-5 text-center">
					<h2 class="h2 font-bold text-white">Your Adventure Awaits</h2>
				</header>
				<div class="space-y-6 p-6">
					<div class="card bg-surface-700/50 border-surface-600/20 rounded-lg border p-5 shadow">
						<h3 class="h3 text-primary-400 mb-3 font-semibold">Adventure Concept</h3>
						<p class="text-xl font-bold text-white">{result.idea}</p>
					</div>

					<div class="card bg-surface-700/50 border-surface-600/20 rounded-lg border p-5 shadow">
						<h3 class="h3 text-primary-400 mb-3 font-semibold">Adventure Details</h3>
						<p class="text-lg text-white">{result.details}</p>
					</div>

					<div class="space-y-4">
						<h3 class="h3 text-primary-400 font-semibold">Notable Characters</h3>
						<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
							{#each result.characters_involved as character, i (i)}
								<div
									class="card bg-primary-900/40 border-primary-500/30 rounded-lg border p-4 text-center shadow"
								>
									<span
										class="badge bg-primary-500 mb-2 inline-flex justify-center rounded-full px-2 py-1 text-xs text-black"
										>Character {i + 1}</span
									>
									<p class="text-white">{character}</p>
								</div>
							{/each}
						</div>
					</div>
				</div>
				<footer
					class="border-surface-600/20 bg-surface-700/50 flex items-center justify-between border-t p-4"
				>
					<span class="text-surface-300-600-token text-sm"
						>Ready to play? Download or share this adventure!</span
					>
					<div class="flex gap-3">
						<button
							class="btn bg-surface-600 hover:bg-surface-500 rounded-lg px-4 py-2 text-black shadow transition-all"
						>
							Share
						</button>
						<button
							class="btn bg-secondary-600 hover:bg-secondary-500 rounded-lg px-4 py-2 text-black shadow-md transition-all hover:shadow-lg"
							on:click={() => (result = null)}
						>
							Create New
						</button>
					</div>
				</footer>
			</div>
		{/if}
	</div>
</div>
