<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Select from '../lib/components/Select.svelte';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Components/Select',
		component: Select,
		tags: ['autodocs'],
		argTypes: {
			id: { control: 'text' },
			options: { control: 'object' },
			value: { control: 'text' },
			placeholder: { control: 'text' },
			disabled: { control: 'boolean' },
			required: { control: 'boolean' },
			containerClass: { control: 'text' },
			maxHeight: { control: 'text' },
			onChange: { action: 'changed' }
		},
		args: {
			id: 'select-component',
			options: [
				{ value: 'option1', label: 'Option 1' },
				{ value: 'option2', label: 'Option 2' },
				{ value: 'option3', label: 'Option 3' }
			],
			placeholder: 'Select option',
			onChange: undefined
		}
	});
</script>

<!-- Default state -->
<Story name="Default" args={{}} />

<!-- Set initial value -->
<Story name="With Initial Value" args={{ value: 'option2' }} />

<!-- Disabled state -->
<Story name="Disabled" args={{ disabled: true }} />

<!-- Custom width -->
<Story name="Custom Width" args={{ containerClass: 'w-64' }} />

<!-- With disabled options -->
<Story
	name="With Disabled Options"
	args={{
		options: [
			{ value: 'option1', label: 'Option 1' },
			{ value: 'option2', label: 'Option 2', disabled: true },
			{ value: 'option3', label: 'Option 3' }
		],
		value: 'option1'
	}}
/>

<!-- Custom placeholder -->
<Story
	name="Custom Placeholder"
	args={{
		placeholder: 'Choose from the list...',
		value: ''
	}}
/>

<!-- Long labels with truncation -->
<Story
	name="Long Option Lables"
	args={{
		containerClass: 'w-64',
		options: [
			{ value: 'option1', label: 'This is a very long option label that should truncate' },
			{ value: 'option2', label: 'Another lengthy option that needs truncation' },
			{ value: 'option3', label: 'Short option' }
		],
		value: 'option1'
	}}
/>

<!-- Large number of options with scrolling -->
<Story
	name="Many Options"
	args={{
		options: Array.from({ length: 15 }, (_, i) => ({
			value: `option${i + 1}`,
			label: `Option ${i + 1}`
		})),
		value: 'option5',
		maxHeight: '200px'
	}}
/>

<!-- Custom max height for dropdown -->
<Story
	name="Custom Max Height"
	args={{
		options: Array.from({ length: 10 }, (_, i) => ({
			value: `option${i + 1}`,
			label: `Option ${i + 1}`
		})),
		value: 'option3',
		maxHeight: '100px'
	}}
/>

<!-- No options provided -->
<Story
	name="No Options"
	args={{
		options: [],
		placeholder: 'No options available'
	}}
/>
