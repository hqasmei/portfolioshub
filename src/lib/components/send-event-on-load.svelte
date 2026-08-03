<script lang="ts">
	import { trackEvent } from '$lib/tracking.js';

	let { eventKey }: { eventKey: string } = $props();

	// Fires once on mount, matching the Next app's ref-guarded useEffect.
	$effect(() => {
		trackEvent(eventKey);
	});
</script>
