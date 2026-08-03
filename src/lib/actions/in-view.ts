import type { Action } from 'svelte/action';

type InViewParams = {
	onEnter: () => void;
	options?: IntersectionObserverInit;
};

/**
 * Replaces react-intersection-observer's useInView. Takes a callback rather than
 * dispatching a DOM event so the call site stays type-checked.
 */
export const inView: Action<HTMLElement, InViewParams> = (node, params) => {
	let onEnter = params.onEnter;

	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) onEnter();
		}
	}, params.options);

	observer.observe(node);

	return {
		update(next: InViewParams) {
			onEnter = next.onEnter;
		},
		destroy() {
			observer.disconnect();
		}
	};
};
