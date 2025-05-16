/**
 * Creates a debounced version of a function
 */
export function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms = 10) {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function (this: unknown, ...args: Parameters<T>) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
}
