<script lang="ts">
	// mdsvex compiles the .svx at build time, so this replaces both
	// src/lib/posts.ts (which read the filesystem) and next-mdx-remote.
	import Content from '$lib/content/legal/privacy-policy.svx';
	import Seo from '$lib/components/seo.svelte';
</script>

<Seo
	title="Privacy Policy"
	description="Learn how we handle, store, and protect your personal information."
/>

<div class="flex justify-center pt-12">
	<article class="prose w-full max-w-2xl pb-10">
		<Content />
	</article>
</div>
