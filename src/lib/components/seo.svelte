<script lang="ts">
	import { PUBLIC_SITE_URL } from '$env/static/public';

	import { CONFIG } from '$lib/config.js';
	import { DEFAULT_DESCRIPTION, pageTitle } from '$lib/seo.js';

	// Replaces the Next app's `metadata` exports.
	let { title, description = DEFAULT_DESCRIPTION }: { title?: string; description?: string } =
		$props();

	const resolved = $derived(pageTitle(title));
	const ogImage = $derived(`${PUBLIC_SITE_URL}/opengraph-image.png`);
</script>

<svelte:head>
	<title>{resolved}</title>
	<meta name="description" content={description} />
	<meta name="robots" content="index, follow" />

	<meta property="og:title" content={CONFIG.name} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={PUBLIC_SITE_URL} />
	<meta property="og:site_name" content={CONFIG.name} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={ogImage} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={CONFIG.name} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>
