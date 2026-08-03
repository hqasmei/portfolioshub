import { CONFIG } from './config.js';

export const DEFAULT_TITLE = `${CONFIG.name} | Find the best portfolios and showcase your work`;
export const DEFAULT_DESCRIPTION = CONFIG.description;

/** Mirrors the Next app's metadata title template: `%s | PortfoliosHub`. */
export function pageTitle(title?: string) {
	return title ? `${title} | ${CONFIG.name}` : DEFAULT_TITLE;
}
