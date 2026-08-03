import { cubicOut } from 'svelte/easing';
import { crossfade } from 'svelte/transition';

/**
 * Svelte's analogue of framer-motion's shared `layoutId`. Created once at module
 * scope so every FilterButton shares one registry — that is what makes the pill
 * animate between tabs rather than fading in place.
 */
export const [sendTab, receiveTab] = crossfade({ duration: 250, easing: cubicOut });
