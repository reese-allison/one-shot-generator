<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { SwatchBook } from 'lucide-svelte';

	// Store the current theme
	const currentTheme = writable('');

	// Dropdown state
	let isOpen = false;

	// Available themes
	const themes = [
		{ name: 'dnd-5e', label: 'D&D 5E' },
		{ name: 'mork-borg', label: 'Mork Borg' },
		{ name: 'tiny-d6', label: 'Tiny D6' }
	];

	// Set the theme
	function setTheme(themeName: string) {
		document.documentElement.setAttribute('data-theme', themeName);
		localStorage.setItem('theme', themeName);
		currentTheme.set(themeName);
		isOpen = false; // Close dropdown after selection
	}

	// Toggle dropdown
	function toggleDropdown() {
		isOpen = !isOpen;
	}

	// Handle clicks outside the dropdown to close it
	function handleClickOutside(event: MouseEvent) {
		const dropdownContainer = document.getElementById('theme-dropdown-container');
		if (isOpen && dropdownContainer && !dropdownContainer.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	// On mount, load the theme from localStorage or use default
	onMount(() => {
		const storedTheme = localStorage.getItem('theme') || 'mork-borg';
		setTheme(storedTheme);

		document.addEventListener('click', handleClickOutside);

		// Cleanup on component destruction
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div id="theme-dropdown-container" class="relative inline-block">
	<!-- Dropdown trigger button -->
	<button
		on:click|stopPropagation={toggleDropdown}
		class="bg-surface-600 hover:bg-surface-500 flex items-center gap-2 rounded-md px-2 py-1"
		aria-haspopup="true"
		aria-expanded={isOpen}
		aria-controls="theme-menu"
	>
		<SwatchBook aria-hidden="true" />
		<span class="sr-only">Open theme switcher</span>
	</button>

	<!-- Dropdown menu -->
	{#if isOpen}
		<div
			id="theme-menu"
			class="bg-surface-700 absolute top-full right-0 z-10 mt-1 w-36 origin-top-right rounded-md shadow-lg"
			role="menu"
		>
			{#each themes as theme (theme.name)}
				<button
					role="menuitem"
					class="hover:bg-surface-500 w-full px-4 py-2 text-left first:rounded-t-md last:rounded-b-md"
					on:click={() => setTheme(theme.name)}
				>
					{theme.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
