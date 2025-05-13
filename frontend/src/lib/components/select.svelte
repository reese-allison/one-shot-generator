<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronDown } from 'lucide-svelte';

	// ========== PROPS AND STATE ==========

	// Define option type for better type safety
	type SelectOption = {
		value: string;
		label: string;
	};

	// Props with proper typing
	let {
		options = [] as SelectOption[],
		value = '',
		placeholder = 'Select an option',
		containerClass = '',
		buttonClass = '',
		menuClass = '',
		optionClass = '',
		id = 'dropdown-' + Math.random().toString(36).substring(2, 9),
		disabled = false,
		onChange = undefined as ((value: string) => void) | undefined
	} = $props();

	// Component state
	let isOpen = $state(false);
	let selectedValue = $state(value);
	let selectedLabel = $derived(
		options.find((option) => option.value === selectedValue)?.label || placeholder
	);

	// Element references to reduce DOM queries
	let dropdownRef = $state<HTMLDivElement | null>(null);
	let menuRef = $state<HTMLDivElement | null>(null);
	let buttonRef = $state<HTMLButtonElement | null>(null);

	// ========== EVENT HANDLERS ==========

	// Set the selected value and call onChange callback
	function setValue(optionValue: string) {
		selectedValue = optionValue;
		isOpen = false; // Close dropdown after selection

		// Call the onChange callback if provided
		if (onChange) {
			onChange(optionValue);
		}
	}

	// Toggle dropdown with keyboard accessibility
	function toggleDropdown(event: Event) {
		event.stopPropagation();
		if (!disabled) {
			isOpen = !isOpen;

			// If opening, focus the selected option or first option
			if (isOpen) {
				setTimeout(() => {
					focusSelectedOrFirstOption();
				}, 10);
			}
		}
	}

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (disabled) return;

		switch (event.key) {
			case 'Escape':
				isOpen = false;
				buttonRef?.focus();
				break;
			case 'Enter':
				if (!isOpen) {
					isOpen = true;
					event.preventDefault();
					debouncedFocusSelectedOrFirstOption();
				} else if (document.activeElement?.getAttribute('role') === 'option') {
					// If an option is focused, select it
					const value = document.activeElement?.getAttribute('data-value');
					if (value) setValue(value);
					event.preventDefault();
				}
				break;
			case ' ': // Space key
				if (!isOpen) {
					isOpen = true;
					event.preventDefault();
					debouncedFocusSelectedOrFirstOption();
				} else if (document.activeElement?.getAttribute('role') === 'option') {
					// If an option is focused, select it
					const value = document.activeElement?.getAttribute('data-value');
					if (value) setValue(value);
					event.preventDefault();
				}
				break;
			case 'ArrowDown':
				event.preventDefault();
				if (!isOpen) {
					isOpen = true;
					debouncedFocusSelectedOrFirstOption();
				} else {
					focusNextOption();
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (!isOpen) {
					isOpen = true;
					debouncedFocusLastOption();
				} else {
					focusPreviousOption();
				}
				break;
		}
	}

	// Handle clicks outside the dropdown to close it
	function handleClickOutside(event: MouseEvent) {
		if (isOpen && dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	// ========== FOCUS MANAGEMENT ==========

	// Simplified focus management with a unified approach
	function focusOptionAtIndex(index: number) {
		if (!menuRef) return;

		const options = menuRef.querySelectorAll('[role="option"]');
		if (options.length === 0) return;

		// Handle negative index (focus last element)
		const targetIndex = index < 0 ? options.length - 1 : index;
		// Ensure index is within bounds
		const boundedIndex = Math.max(0, Math.min(targetIndex, options.length - 1));

		const option = options[boundedIndex] as HTMLElement;
		if (option) {
			option.focus();
		}
	}

	function focusSelectedOrFirstOption() {
		if (!menuRef) return;

		const selectedOption = menuRef.querySelector('[aria-selected="true"]') as HTMLElement;
		if (selectedOption) {
			selectedOption.focus();
		} else {
			focusOptionAtIndex(0);
		}
	}

	function focusNextOption() {
		if (!menuRef) return;

		const options = Array.from(menuRef.querySelectorAll('[role="option"]'));
		const currentIndex = options.findIndex((item) => document.activeElement === item);
		focusOptionAtIndex(currentIndex + 1);
	}

	function focusPreviousOption() {
		if (!menuRef) return;

		const options = Array.from(menuRef.querySelectorAll('[role="option"]'));
		const currentIndex = options.findIndex((item) => document.activeElement === item);
		focusOptionAtIndex(currentIndex - 1);
	}

	function focusLastOption() {
		focusOptionAtIndex(-1);
	}

	// Debounce function for performance optimization
	function debounce<T extends (...args: unknown[]) => void>(fn: T, ms = 10) {
		let timeoutId: ReturnType<typeof setTimeout>;
		return function (this: unknown, ...args: Parameters<T>) {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => fn.apply(this, args), ms);
		};
	}

	const debouncedFocusSelectedOrFirstOption = debounce(focusSelectedOrFirstOption);
	const debouncedFocusLastOption = debounce(focusLastOption);

	// ========== LIFECYCLE AND EFFECTS ==========

	// On mount, set up event handlers
	onMount(() => {
		document.addEventListener('click', handleClickOutside);

		// Cleanup on component destruction
		return () => {
			document.removeEventListener('click', handleClickOutside);
			dropdownRef = null;
			menuRef = null;
			buttonRef = null;
		};
	});

	// Bidirectional synchronization between prop and internal state
	$effect(() => {
		// When prop changes, update internal state
		if (value !== selectedValue) {
			selectedValue = value;
		}
	});

	// When internal state changes and it's different from prop value, notify parent
	$effect(() => {
		if (selectedValue !== value && onChange && selectedValue !== '') {
			onChange(selectedValue);
		}
	});
</script>

<div
	class="relative inline-block {containerClass}"
	{id}
	data-testid="select-component"
	bind:this={dropdownRef}
>
	<!-- Dropdown trigger button -->
	<button
		type="button"
		onclick={toggleDropdown}
		onkeydown={handleKeydown}
		class="bg-surface-600 hover:bg-surface-500 flex items-center justify-between gap-2 rounded-md px-3 py-2 {buttonClass} {disabled
			? 'cursor-not-allowed opacity-50'
			: 'cursor-pointer'}"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-controls="dropdown-menu-{id}"
		aria-label={`Select ${placeholder}`}
		aria-owns={isOpen ? `dropdown-menu-${id}` : undefined}
		{disabled}
		bind:this={buttonRef}
	>
		<span class="truncate">{selectedLabel}</span>
		<ChevronDown
			size={16}
			class="transition-transform duration-200 {isOpen ? 'rotate-180 transform' : ''}"
			aria-hidden="true"
		/>
	</button>

	<!-- Dropdown menu -->
	{#if isOpen}
		<div
			id="dropdown-menu-{id}"
			class="bg-surface-700 absolute top-full left-0 z-10 mt-1 max-h-60 w-full origin-top-left overflow-y-auto rounded-md shadow-lg {menuClass}"
			role="listbox"
			aria-labelledby={id}
			bind:this={menuRef}
		>
			{#each options as option, index (option.value)}
				<button
					type="button"
					role="option"
					id="{id}-option-{index}"
					data-value={option.value}
					aria-selected={option.value === selectedValue}
					class="hover:bg-surface-500 w-full px-4 py-2 text-left first:rounded-t-md last:rounded-b-md {optionClass} {option.value ===
					selectedValue
						? 'bg-surface-500/50'
						: ''}"
					onclick={() => setValue(option.value)}
					onkeydown={handleKeydown}
					tabindex={isOpen ? 0 : -1}
				>
					{option.label}
				</button>
			{/each}
			{#if options.length === 0}
				<div class="px-4 py-2 text-gray-400 italic">No options available</div>
			{/if}
		</div>
	{/if}
</div>
