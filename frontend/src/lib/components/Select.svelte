<script lang="ts">
	import { debounce } from '$lib/utilities/debounce';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';

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

	// ========== PROPS ==========

	let {
		options = [] as SelectOption[],
		value: valueFromProp,
		placeholder = 'Select an option',
		containerClass = 'w-full',
		id: userProvidedId, // Capture user-provided ID
		disabled = false,
		name,
		required = false,
		maxHeight = '25rem',
		onChange = undefined
	}: SelectProps = $props();

	// Generate a base ID for the component instance
	const baseId = $derived(userProvidedId || 'select-' + Math.random().toString(36).substring(2, 9));
	const buttonId = $derived(`${baseId}-button`);
	const menuId = $derived(`${baseId}-menu`);

	// Component state - initialize simply
	const isControlled = $derived(onChange !== undefined);
	let selectedValue = $state(valueFromProp ?? '');
	let isOpen = $state(false);
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

		if (!isControlled) {
			// In uncontrolled mode, update internal state directly
			selectedValue = optionValue;
		}

		isOpen = false;
		buttonRef?.focus(); // Return focus to the button

		// Always call onChange if provided
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
			case ' ': // Space key
				if (!isOpen) {
					isOpen = true;
					event.preventDefault();
					debouncedFocusSelectedOrFirstOption();
				} else if (document.activeElement?.getAttribute('role') === 'option') {
					const val = document.activeElement?.getAttribute('data-value');
					if (val) setValue(val);
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
					focusOptionByPosition('first');
				}
				break;

			case 'End':
				if (isOpen) {
					event.preventDefault();
					focusOptionByPosition('last');
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
		if (!menuRef || index < 0 || index >= options.length) {
			return;
		}
		const optionData = options[index];
		if (optionData.disabled) {
			return;
		}

		const optionElement = menuRef.querySelector(
			`[role="option"][data-value="${optionData.value}"]`
		) as HTMLElement;
		if (optionElement) {
			optionElement.focus();
			highlightedIndex = index;
			scrollOptionIntoView(optionElement);
		}
	}

	/**
	 * Focuses the selected option or first option
	 */
	function focusSelectedOrFirstOption() {
		const currentSelectedIndex = options.findIndex(
			(opt) => opt.value === selectedValue && !opt.disabled
		);
		if (currentSelectedIndex !== -1) {
			focusOptionAtIndex(currentSelectedIndex);
		} else {
			focusOptionByPosition('first');
		}
	}

	/**
	 * Finds the next enabled option index
	 */
	function findNextEnabledOptionIndex(startIndex: number, direction: 1 | -1): number {
		let currentIndex = startIndex;
		const len = options.length;
		if (len === 0) return -1; // No options to search

		for (let i = 0; i < len; i++) {
			currentIndex += direction;
			if (currentIndex < 0) currentIndex = len - 1;
			if (currentIndex >= len) currentIndex = 0;

			if (!options[currentIndex].disabled) {
				return currentIndex;
			}
		}
		// If all options are disabled or no options
		const firstEnabled = options.findIndex((opt) => !opt.disabled);
		return firstEnabled; // Return first enabled or -1 if all disabled
	}

	/**
	 * Focuses the next or previous focusable option
	 */
	function focusAdjacentOption(direction: 1 | -1) {
		const allDisabled = options.every((opt) => opt.disabled);
		if (allDisabled) return;

		let startIndex = -1;
		if (highlightedIndex !== -1 && !options[highlightedIndex]?.disabled) {
			startIndex = highlightedIndex;
		} else {
			const currentSelectedIdx = options.findIndex(
				(opt) => opt.value === selectedValue && !opt.disabled
			);
			if (currentSelectedIdx !== -1) {
				startIndex = currentSelectedIdx;
			} else if (direction === -1) {
				startIndex = options.length;
			}
		}

		const adjacentIndex = findNextEnabledOptionIndex(startIndex, direction);
		if (adjacentIndex !== -1) {
			focusOptionAtIndex(adjacentIndex);
		}
	}

	/**
	 * Focuses the next focusable option
	 */
	function focusNextOption() {
		focusAdjacentOption(1);
	}

	/**
	 * Focuses the previous focusable option
	 */
	function focusPreviousOption() {
		focusAdjacentOption(-1);
	}

	/**
	 * Focuses the first or last option based on direction
	 */
	function focusOptionByPosition(direction: 'first' | 'last') {
		let targetIndex = -1;
		if (direction === 'first') {
			for (let i = 0; i < options.length; i++) {
				if (!options[i].disabled) {
					targetIndex = i;
					break;
				}
			}
		} else {
			for (let i = options.length - 1; i >= 0; i--) {
				if (!options[i].disabled) {
					targetIndex = i;
					break;
				}
			}
		}
		if (targetIndex !== -1) {
			focusOptionAtIndex(targetIndex);
		}
	}

	/**
	 * Focuses the last option in the list
	 */
	function focusLastOption() {
		focusOptionByPosition('last');
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

	$effect(() => {
		if (isControlled) {
			const newPropValue = valueFromProp ?? '';
			if (newPropValue !== selectedValue) {
				selectedValue = newPropValue;
			}
		}
	});
</script>

<div
	class="relative inline-block {containerClass}"
	id={baseId}
	data-testid={baseId}
	bind:this={dropdownRef}
>
	<!-- Dropdown trigger button -->
	<button
		type="button"
		id={buttonId}
		onclick={toggleDropdown}
		onkeydown={handleKeydown}
		class="bg-surface-600 hover:bg-surface-500 focus:ring-primary-500 flex w-full items-center justify-between gap-2 rounded-md
		       px-3 py-2
		       text-left transition-colors focus:ring-2
		       focus:outline-none
			   {disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-controls={menuId}
		aria-owns={isOpen ? menuId : undefined}
		{disabled}
		tabindex={disabled ? -1 : 0}
		bind:this={buttonRef}
		data-testid={`${baseId}-trigger`}
	>
		<span
			class="truncate"
			class:text-gray-400={selectedValue === ''}
			data-testid={`${baseId}-selected-value`}
		>
			{selectedLabel}
		</span>
		<ChevronDown
			size={16}
			class="flex-shrink-0 transition-transform duration-200 {isOpen ? 'rotate-180 transform' : ''}"
			aria-hidden="true"
		/>
	</button>

	<!-- Hidden input for form submissions -->
	{#if name}
		<input
			type="hidden"
			{name}
			value={selectedValue}
			{required}
			data-testid={`${baseId}-hidden-input`}
		/>
	{/if}

	<!-- Dropdown menu -->
	{#if isOpen}
		<div
			id={menuId}
			class="bg-surface-700 border-surface-500 absolute top-full left-0 z-10
			       mt-1 w-full
			       origin-top-left overflow-y-auto
			       rounded-md border shadow-lg"
			style="max-height: {maxHeight};"
			role="listbox"
			aria-labelledby={buttonId}
			transition:fade={{ duration: 150 }}
			bind:this={menuRef}
			data-testid={`${baseId}-menu`}
		>
			{#each options as option, index (option.value)}
				<button
					type="button"
					role="option"
					id={`${baseId}-option-${option.value}`}
					data-value={option.value}
					aria-selected={option.value === selectedValue}
					aria-disabled={option.disabled || false}
					class="w-full px-4 py-2 text-left transition-colors
					       first:rounded-t-md last:rounded-b-md
					       {option.value === selectedValue ? 'bg-surface-500/50' : ''} 
						   {highlightedIndex === index && !option.disabled ? 'bg-surface-500/30' : ''}
						   {option.disabled
						? 'cursor-not-allowed opacity-50 hover:bg-transparent'
						: 'hover:bg-surface-500'}"
					onclick={() => setValue(option.value)}
					onkeydown={handleKeydown}
					onmouseenter={() => {
						if (!option.disabled) highlightedIndex = index;
					}}
					onmouseleave={() => (highlightedIndex = -1)}
					tabindex={isOpen && !option.disabled ? 0 : -1}
					disabled={option.disabled || false}
					data-testid={`${baseId}-option-${option.value}`}
				>
					{option.label}
				</button>
			{:else}
				<div class="px-4 py-2 italic text-gray-400" data-testid={`${baseId}-no-options`}>
					No options available
				</div>
			{/each}
		</div>
	{/if}
</div>
