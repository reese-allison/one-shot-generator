<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Select from '../lib/components/Select.svelte';
	import { fn } from '@storybook/test';

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
			buttonClass: { control: 'text' },
			menuClass: { control: 'text' },
			optionClass: { control: 'text' },
			maxHeight: { control: 'text' },
			onChange: { action: 'changed' }
		},
		args: {
			id: 'select-component',
			options: [
				{ value: 'dnd-5e', label: 'D&D 5E' },
				{ value: 'mork-borg', label: 'Mork Borg' },
				{ value: 'tiny-d6', label: 'Tiny D6' }
			],
			value: '',
			placeholder: 'Select theme',
			onChange: fn()
		}
	});
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default" args={{}} />

<Story name="With Value" args={{ value: 'mork-borg' }} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Custom Width" args={{ containerClass: 'w-36' }} />

<Story
	name="With Custom Button Style"
	args={{
		buttonClass: 'flex items-center gap-2 py-1 px-2',
		value: 'mork-borg'
	}}
/>

<Story
	name="Theme Switcher Example"
	args={{
		id: 'theme-switcher',
		containerClass: 'w-36',
		buttonClass: 'flex items-center gap-2 py-1 px-2',
		value: 'mork-borg'
	}}
/>

<Story
	name="With Disabled Options"
	args={{
		options: [
			{ value: 'dnd-5e', label: 'D&D 5E' },
			{ value: 'mork-borg', label: 'Mork Borg', disabled: true },
			{ value: 'tiny-d6', label: 'Tiny D6' }
		]
	}}
/>

<Story
	name="Mixed Disabled Options"
	args={{
		options: [
			{ value: 'dnd-5e', label: 'D&D 5E' },
			{ value: 'mork-borg', label: 'Mork Borg', disabled: true },
			{ value: 'tiny-d6', label: 'Tiny D6' },
			{ value: 'pathfinder', label: 'Pathfinder' },
			{ value: 'call-of-cthulhu', label: 'Call of Cthulhu', disabled: true }
		],
		maxHeight: '150px'
	}}
/>

<Story
	name="Required Field"
	args={{
		required: true,
		name: 'theme-selection'
	}}
/>
