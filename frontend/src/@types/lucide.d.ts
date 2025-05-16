declare module 'lucide-svelte/icons/*' {
	import { LucideProps } from 'lucide-svelte';

	const component: import('svelte').SvelteComponent<LucideProps>;

	export default component;
}
