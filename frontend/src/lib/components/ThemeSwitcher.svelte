<script lang="ts">
	import { onMount } from 'svelte';
	import Select from './Select.svelte';

	// Define option type for better type safety
	type ThemeOption = {
		value: string;
		label: string;
	};

	// Available themes
	const themes: ThemeOption[] = [
		{ value: 'dnd-5e', label: 'D&D 5E' },
		{ value: 'mork-borg', label: 'Mork Borg' },
		{ value: 'tiny-d6', label: 'Tiny D6' }
	];

	// Component state
	let currentTheme = $state('');

	// Set the theme
	function setTheme(themeName: string) {
		if (!themeName) return;

		document.documentElement.setAttribute('data-theme', themeName);
		localStorage.setItem('theme', themeName);
		currentTheme = themeName;
	}

	// Handle theme selection change
	function handleThemeChange(newValue: string) {
		setTheme(newValue);
	}

	// On mount, load the theme from localStorage or use default
	onMount(() => {
		const storedTheme = localStorage.getItem('theme') || 'mork-borg';
		setTheme(storedTheme);
	});
</script>

<div class="inline-block" data-testid="theme-switcher-component">
	<Select
		id="theme-switcher"
		options={themes}
		value={currentTheme}
		placeholder="Select theme"
		containerClass="w-36"
		buttonClass="flex items-center gap-2 py-1 px-2"
		onChange={handleThemeChange}
	/>
</div>
