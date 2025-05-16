<script lang="ts">
	import { debounce } from '$lib/utilities/debounce';
	import { ChevronDown } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	// ========== TYPES ==========

	/**
	 * Represents a selectable option in the dropdown
	 */
	export interface SelectOption {
		/** Unique identifier for the option */
		value: string;
		/** Display text for the option */
		label: string;
		/** Whether the option is disabled/unselectable */
		disabled?: boolean;
	}

	/**
	 * Props for the Select component
	 */
	interface SelectProps {
		/** Options to display in the dropdown */
		options?: SelectOption[];
		/** Current selected value */
		value?: string;
		/** Placeholder text when no option is selected */
		placeholder?: string;
		/** Additional class for the container */
		containerClass?: string;
		/** Additional class for the trigger button */
		buttonClass?: string;
		/** Additional class for the dropdown menu */
		menuClass?: string;
		/** Additional class for each option */
		optionClass?: string;
		/** Unique identifier for the component */
		id?: string;
		/** Whether the dropdown is disabled */
		disabled?: boolean;
		/** Input name for form submissions */
		name?: string;
		/** Required status for form validation */
		required?: boolean;
		/** Maximum height of the dropdown menu */
		maxHeight?: string;
		/** Callback when selection changes */
		onChange?: (value: string) => void;
	}

	let {
		options = [] as SelectOption[],
		value = '',
		placeholder = 'Select an option',
		containerClass = '',
		buttonClass = '',
		menuClass = '',
		optionClass = '',
		id = 'select-' + Math.random().toString(36).substring(2, 9),
		disabled = false,
		name,
		required = false,
		maxHeight = '15rem',
		onChange
	}: SelectProps = $props();

	// Component state
	let isOpen = $state(false);
	let selectedValue = $state(value);
	let selectedLabel = $derived(
		options.find((option: SelectOption) => option.value === selectedValue)?.label || placeholder
	);
	let highlightedIndex = $state<number>(-1);

	// Element references
	let dropdownRef = $state<HTMLDivElement | null>(null);
	let menuRef = $state<HTMLDivElement | null>(null);
	let buttonRef = $state<HTMLButtonElement | null>(null);

	// ========== EVENT HANDLERS ==========

	/**
	 * Sets the selected value and calls the onChange callback
	 */
	function setValue(optionValue: string) {
		const option = options.find((o: SelectOption) => o.value === optionValue);
		if (option?.disabled) return;

		selectedValue = optionValue;
		isOpen = false;

		if (onChange) {
			onChange(optionValue);
		}
	}

	/**
	 * Toggles the dropdown open/closed state
	 */
	function toggleDropdown(event: MouseEvent) {
		event.stopPropagation();
		if (!disabled) {
			isOpen = !isOpen;

			if (isOpen) {
				debouncedFocusSelectedOrFirstOption();
			}
		}
	}

	/**
	 * Handles keyboard navigation and interaction
	 */
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

			case 'Tab':
				if (isOpen) {
					isOpen = false;
				}
				break;

			case 'Home':
				if (isOpen) {
					event.preventDefault();
					focusOptionAtIndex(0);
				}
				break;

			case 'End':
				if (isOpen) {
					event.preventDefault();
					focusLastOption();
				}
				break;
		}
	}

	/**
	 * Closes the dropdown when clicking outside
	 */
	function handleClickOutside(event: MouseEvent) {
		if (isOpen && dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	// ========== FOCUS MANAGEMENT ==========

	/**
	 * Focuses the option at the specified index
	 */
	function focusOptionAtIndex(index: number) {
		if (!menuRef) return;

		const optionElements = Array.from(
			menuRef.querySelectorAll('[role="option"]:not([aria-disabled="true"])')
		);
		if (optionElements.length === 0) return;

		// Handle negative index (focus last element)
		const targetIndex = index < 0 ? optionElements.length - 1 : index;
		// Ensure index is within bounds
		const boundedIndex = Math.max(0, Math.min(targetIndex, optionElements.length - 1));

		const option = optionElements[boundedIndex] as HTMLElement;
		if (option) {
			option.focus();
			highlightedIndex = boundedIndex;
			scrollOptionIntoView(option);
		}
	}

	/**
	 * Focuses the selected option or first option
	 */
	function focusSelectedOrFirstOption() {
		if (!menuRef) return;

		const selectedOption = menuRef.querySelector(
			'[aria-selected="true"]:not([aria-disabled="true"])'
		) as HTMLElement;
		if (selectedOption) {
			selectedOption.focus();
			scrollOptionIntoView(selectedOption);
		} else {
			focusOptionAtIndex(0);
		}
	}

	/**
	 * Focuses the next focusable option
	 */
	function focusNextOption() {
		if (!menuRef) return;

		const options = Array.from(
			menuRef.querySelectorAll('[role="option"]:not([aria-disabled="true"])')
		);
		const currentIndex = options.findIndex((item) => document.activeElement === item);
		focusOptionAtIndex(currentIndex + 1);
	}

	/**
	 * Focuses the previous focusable option
	 */
	function focusPreviousOption() {
		if (!menuRef) return;

		const options = Array.from(
			menuRef.querySelectorAll('[role="option"]:not([aria-disabled="true"])')
		);
		const currentIndex = options.findIndex((item) => document.activeElement === item);
		focusOptionAtIndex(currentIndex - 1);
	}

	/**
	 * Focuses the last option in the list
	 */
	function focusLastOption() {
		focusOptionAtIndex(-1);
	}

	/**
	 * Ensures the focused option is visible in the scrollable dropdown
	 */
	function scrollOptionIntoView(optionElement: HTMLElement) {
		if (!menuRef || !optionElement) return;

		const menuRect = menuRef.getBoundingClientRect();
		const optionRect = optionElement.getBoundingClientRect();

		if (optionRect.bottom > menuRect.bottom) {
			menuRef.scrollTop += optionRect.bottom - menuRect.bottom;
		} else if (optionRect.top < menuRect.top) {
			menuRef.scrollTop -= menuRect.top - optionRect.top;
		}
	}

	const debouncedFocusSelectedOrFirstOption = debounce(focusSelectedOrFirstOption);
	const debouncedFocusLastOption = debounce(focusLastOption);

	// ========== LIFECYCLE AND EFFECTS ==========

	// Set up event handlers
	onMount(() => {
		document.addEventListener('click', handleClickOutside);

		// Cleanup on component destruction
		return () => {
			document.removeEventListener('click', handleClickOutside);
			// Clean up references
			dropdownRef = null;
			menuRef = null;
			buttonRef = null;
		};
	});

	// Sync prop changes to internal state
	$effect(() => {
		if (value !== selectedValue) {
			selectedValue = value;
		}
	});

	// Notify parent of changes to internal state
	$effect(() => {
		if (selectedValue !== value && onChange && selectedValue !== '') {
			onChange(selectedValue);
		}
	});
</script>

<div
	class="relative inline-block w-full {containerClass}"
	{id}
	data-testid="select-component"
	bind:this={dropdownRef}
>
	<!-- Dropdown trigger button -->
	<button
		type="button"
		onclick={toggleDropdown}
		onkeydown={handleKeydown}
		class="bg-surface-600 hover:bg-surface-500 focus:ring-primary-500 flex w-full items-center justify-between gap-2 rounded-md
		       px-3 py-2
		       text-left transition-colors focus:ring-2
		       focus:outline-none
			   {buttonClass} 
			   {disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-controls="dropdown-menu-{id}"
		aria-label={`Select ${placeholder}`}
		aria-owns={isOpen ? `dropdown-menu-${id}` : undefined}
		{disabled}
		tabindex={disabled ? -1 : 0}
		bind:this={buttonRef}
	>
		<span class="truncate" class:text-gray-400={selectedValue === ''}>{selectedLabel}</span>
		<ChevronDown
			size={16}
			class="flex-shrink-0 transition-transform duration-200 {isOpen ? 'rotate-180 transform' : ''}"
			aria-hidden="true"
		/>
	</button>

	<!-- Hidden input for form submissions -->
	{#if name}
		<input type="hidden" {name} value={selectedValue} {required} />
	{/if}

	<!-- Dropdown menu -->
	{#if isOpen}
		<div
			id="dropdown-menu-{id}"
			class="bg-surface-700 border-surface-500 absolute top-full left-0 z-10
			       mt-1 w-full
			       origin-top-left overflow-y-auto
			       rounded-md border shadow-lg
			       {menuClass}"
			style="max-height: {maxHeight};"
			role="listbox"
			aria-labelledby={id}
			transition:fade={{ duration: 150 }}
			bind:this={menuRef}
		>
			{#each options as option, index (option.value)}
				<button
					type="button"
					role="option"
					id="{id}-option-{index}"
					data-value={option.value}
					aria-selected={option.value === selectedValue}
					aria-disabled={option.disabled || false}
					class="w-full px-4 py-2 text-left transition-colors
					       first:rounded-t-md last:rounded-b-md
					       {option.value === selectedValue ? 'bg-surface-500/50' : ''} 
						   {highlightedIndex === index ? 'bg-surface-500/30' : ''}
						   {option.disabled ? 'cursor-not-allowed opacity-50 hover:bg-transparent' : 'hover:bg-surface-500'}
					       {optionClass}"
					onclick={() => setValue(option.value)}
					onkeydown={handleKeydown}
					onmouseenter={() => (highlightedIndex = index)}
					onmouseleave={() => (highlightedIndex = -1)}
					tabindex={isOpen && !option.disabled ? 0 : -1}
					disabled={option.disabled || false}
				>
					{option.label}
				</button>
			{:else}
				<div class="px-4 py-2 italic text-gray-400">No options available</div>
			{/each}
		</div>
	{/if}
</div>
