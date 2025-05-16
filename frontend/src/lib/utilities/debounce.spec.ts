import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should call the function after the specified delay', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn();
		expect(mockFn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(50);
		expect(mockFn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(50);
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it('should only call the function once if called multiple times within the delay', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn();
		debouncedFn();
		debouncedFn();
		expect(mockFn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(100);
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it('should reset the timer when called again within the delay', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn();
		vi.advanceTimersByTime(50);

		debouncedFn(); // Reset the timer
		vi.advanceTimersByTime(50);
		expect(mockFn).not.toHaveBeenCalled(); // Still not called after 100ms total

		vi.advanceTimersByTime(50);
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it('should pass arguments to the original function', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn('test', 123);
		vi.advanceTimersByTime(100);

		expect(mockFn).toHaveBeenCalledWith('test', 123);
	});

	it('should use the default delay if not specified', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn); // Default 10ms

		debouncedFn();
		vi.advanceTimersByTime(5);
		expect(mockFn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(5);
		expect(mockFn).toHaveBeenCalledTimes(1);
	});
});
