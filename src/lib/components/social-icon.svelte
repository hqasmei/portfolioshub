<script lang="ts">
	import LinkIcon from '@lucide/svelte/icons/link';

	import GithubIcon from '$lib/components/icons/brand/github.svelte';
	import InstagramIcon from '$lib/components/icons/brand/instagram.svelte';
	import LinkedinIcon from '$lib/components/icons/brand/linkedin.svelte';
	import TwitchIcon from '$lib/components/icons/brand/twitch.svelte';
	import TwitterIcon from '$lib/components/icons/brand/twitter.svelte';
	import YoutubeIcon from '$lib/components/icons/brand/youtube.svelte';
	import { cn } from '$lib/utils.js';

	let { url, class: className }: { url: string; class?: string } = $props();

	const Icon = $derived.by(() => {
		if (url.includes('x.com') || url.includes('twitter.com')) return TwitterIcon;
		if (url.includes('github.com')) return GithubIcon;
		if (url.includes('instagram.com')) return InstagramIcon;
		if (url.includes('linkedin.com')) return LinkedinIcon;
		if (url.includes('twitch.tv')) return TwitchIcon;
		if (url.includes('youtube.com')) return YoutubeIcon;
		// Default to a generic link icon if no specific match is found
		return LinkIcon;
	});
</script>

{#if url}
	<a
		href={url}
		target="_blank"
		rel="noopener noreferrer"
		class={cn('stroke-muted-foreground', className)}
	>
		<Icon size={18} strokeWidth={2} />
	</a>
{/if}
