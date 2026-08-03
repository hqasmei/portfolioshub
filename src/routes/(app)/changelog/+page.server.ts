import { marked } from 'marked';
import type { PageServerLoad } from './$types';

type ChangeLog = {
	id: string;
	date: string;
	title: string;
	post: string;
};

const PROJECT_ID = 'j573djhyyk1jvsf7mxxfgqh1z96pm5hc';

// The Next app called unstable_noStore() here; setHeaders + cache: 'no-store'
// is the SvelteKit equivalent.
export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });

	// projectplannerai is a third party and does go down (it currently returns a
	// Cloudflare 530). The Next app let that throw and 500 the page; falling back
	// to an empty list means the "No changelog found" branch below actually renders.
	let changelogs: ChangeLog[] = [];
	try {
		const response = await fetch(
			`https://projectplannerai.com/api/changelog?projectId=${PROJECT_ID}`,
			{ cache: 'no-store' }
		);
		if (response.ok) changelogs = await response.json();
	} catch (error) {
		console.error('Failed to load changelog:', error);
	}

	return {
		changelogs: await Promise.all(
			changelogs.map(async (changelog) => ({
				...changelog,
				// react-markdown rendered this client-side; marked runs it here so the
				// page still ships zero markdown runtime to the browser.
				html: await marked.parse(changelog.post)
			}))
		)
	};
};
