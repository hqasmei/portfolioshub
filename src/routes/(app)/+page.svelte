<script lang="ts">
	import Seo from '$lib/components/seo.svelte';
	import MaxWidthWrapper from '$lib/components/max-width-wrapper.svelte';
	import Content from '$lib/components/portfolio/content.svelte';
	import Hero from '$lib/components/portfolio/hero.svelte';
	import SendEventOnLoad from '$lib/components/send-event-on-load.svelte';
</script>

<Seo />

<div class="fixed top-0 left-0 -z-10 h-full w-full">
	<div
		class="absolute top-0 z-[-2] h-screen w-screen dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(0,0,0,0))]"
	></div>
</div>
<SendEventOnLoad eventKey="User hit home page" />
<MaxWidthWrapper>
	<div class="flex flex-col items-center justify-center pt-6 text-center sm:pt-0">
		<div class="mb-8 flex w-full flex-col gap-6">
			<div class="absolute inset-0 -z-10 h-full w-full bg-[size:6rem_4rem]">
				<div
					class="absolute top-0 right-0 bottom-0 left-0 dark:bg-[radial-gradient(ellipse_600px_500px_at_50%_200px,rgba(43,43,59,0.8),transparent)]"
				></div>
			</div>
			<Hero />
			<Content />
		</div>
	</div>
</MaxWidthWrapper>
