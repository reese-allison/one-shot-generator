<script lang="ts">
	import '../app.css';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

	let { children } = $props();
</script>

<!-- Page Layout Structure -->
<div class="flex min-h-screen flex-col">
	<!-- Top-level AppBar (toolbar) -->
	<AppBar background="bg-surface-800" padding="p-2" shadow="shadow-sm">
		<div class="flex w-full justify-end">
			<ThemeSwitcher />
		</div>
	</AppBar>

	<!-- Main content area -->
	<main class="container mx-auto flex-1 p-4">
		{@render children()}
	</main>
</div>
