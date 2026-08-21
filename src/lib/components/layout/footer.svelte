<script lang="ts">
	import MainNav from '$lib/components/main-nav.svelte';
	import MaxWidthWrapper from '$lib/components/max-width-wrapper.svelte';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import { CONFIG } from '$lib/config.js';

	// The Next app's Footer did its own `pathname === '/'` check internally and
	// rendered nothing elsewhere. That check now lives in the shell layout, so
	// this component only ever renders when it should be visible.
	const linkSections = [
		{
			title: 'Product',
			links: [
				{ href: 'https://portfolioshub.com/changelog', label: 'Changelog' },
				{ href: 'https://portfolioshub.com/roadmap', label: 'Roadmap' }
			]
		},
		{
			title: 'Legal',
			links: [
				{ href: '/terms-of-service', label: 'Terms of Service' },
				{ href: '/privacy-policy', label: 'Privacy Policy' }
			]
		},
		{
			title: 'Resources',
			links: [
				{ href: 'https://projectplannerai.com/', label: 'ProjectPlannerAI' },
				{ href: 'https://techstackfinder.com/', label: 'TechStackFinder' },
				{ href: 'https://icongeneratorai.com/', label: 'IconGeneratorAI' }
			]
		}
	];
</script>

<footer
	class="relative z-10 flex w-full flex-1 flex-col border-t border-border bg-raised/50 py-8 backdrop-blur-lg"
>
	<MaxWidthWrapper>
		<div class="mx-auto w-full">
			<div class="xl:grid xl:grid-cols-5 xl:gap-8">
				<div class="space-y-8 xl:col-span-2">
					<div class="flex">
						<MainNav />
					</div>

					<p class="max-w-xs text-sm text-muted-foreground">
						{CONFIG.description}
					</p>
				</div>
				<div class="mt-16 grid grid-cols-2 gap-8 md:grid-cols-3 xl:col-span-3 xl:mt-0">
					{#each linkSections as section (section.title)}
						<div>
							<h3 class="text-sm font-semibold text-foreground">
								{section.title}
							</h3>
							<div class="mt-4 flex flex-col space-y-4">
								{#each section.links as link (link.href)}
									<a
										class="text-sm text-muted-foreground duration-200 hover:text-foreground"
										href={link.href}
									>
										{link.label}
									</a>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
			<div
				class="mt-16 flex flex-col-reverse items-center border-t border-border pt-4 sm:mt-20 md:flex-row md:justify-between md:pt-8 lg:mt-24"
			>
				<p class="mt-4 w-full text-left text-sm leading-5 text-muted-foreground md:mt-0">
					Copyright @ 2026 {CONFIG.name}. All Rights Reserved.
				</p>
				<div class="flex w-full justify-start md:justify-end">
					<ThemeToggle />
				</div>
			</div>
		</div>
	</MaxWidthWrapper>
</footer>
