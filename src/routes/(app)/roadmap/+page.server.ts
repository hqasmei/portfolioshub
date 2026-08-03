import { marked } from 'marked';
import type { PageServerLoad } from './$types';

type Roadmap = {
	id: string;
	title: string;
	description: string;
	releaseDate: string;
	version?: string;
};

const PROJECT_ID = 'j573djhyyk1jvsf7mxxfgqh1z96pm5hc';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });

	// projectplannerai is a third party and does go down (it currently returns a
	// Cloudflare 530). The Next app let that throw and 500 the page; falling back
	// to an empty list means the "No roadmap found" branch below actually renders.
	let roadmapItems: Roadmap[] = [];
	try {
		const response = await fetch(
			`https://projectplannerai.com/api/roadmap?projectId=${PROJECT_ID}`,
			{ cache: 'no-store' }
		);
		if (response.ok) roadmapItems = await response.json();
	} catch (error) {
		console.error('Failed to load roadmap:', error);
	}

	return {
		roadmapItems: await Promise.all(
			roadmapItems.map(async (roadmapItem) => ({
				...roadmapItem,
				html: await marked.parse(roadmapItem.description)
			}))
		)
	};
};
