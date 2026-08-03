import { env } from '$env/dynamic/public';

export const PROJECT_PLANNER_AI_ID = env.PUBLIC_PROJECT_PLANNER_AI_ID;

const eventsEndpoint = env.PUBLIC_IS_LOCAL
	? 'http://localhost:3000/api/events'
	: 'https://projectplannerai.com/api/events';

export async function trackEvent(key: string) {
	return fetch(eventsEndpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			key: key,
			projectId: PROJECT_PLANNER_AI_ID
		})
	});
}
