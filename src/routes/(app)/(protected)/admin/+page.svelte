<script lang="ts">
	import Seo from '$lib/components/seo.svelte';
	import { api } from '$convex/_generated/api';
	import { useQuery } from 'convex-svelte';

	import PortfoliosTable from '$lib/components/admin/portfolios-table.svelte';
	import SubmissionsTable from '$lib/components/admin/submissions-table.svelte';
	import MaxWidthWrapper from '$lib/components/max-width-wrapper.svelte';
	import { useSession } from '$lib/hooks/session.svelte.js';

	const session = useSession();

	// Gated on the Convex token so the denial block doesn't flash for admins.
	const gate = $derived(session.isConvexAuthed ? {} : ('skip' as const));

	const user = useQuery(api.users.getMyUser, () => gate);

	// getSubmissions is admin-guarded on the server, so only subscribe once
	// admin status is positively known — otherwise every non-admin would get a
	// ConvexError back instead of an empty result.
	const adminGate = $derived(user.data?.isAdmin === true ? {} : ('skip' as const));
	const submissions = useQuery(api.submissions.getSubmissions, () => adminGate, {
		keepPreviousData: true
	});

	// Deliberately ungated: getAllPortfolios is public and also backs the hero on
	// the marketing page.
	const portfolios = useQuery(api.portfolios.getAllPortfolios, {}, { keepPreviousData: true });

	/**
	 * `useQuery` reports isLoading as `false` while a query is skipped, so a
	 * skipped query is indistinguishable from "loaded and empty". That is why
	 * the gate conditions are checked before isLoading here.
	 */
	const access = $derived.by(() => {
		if (!session.isLoaded || !session.isConvexAuthed || user.isLoading) return 'loading';
		if (user.error) return 'error';
		return user.data?.isAdmin === true ? 'ready' : 'denied';
	});
</script>

<Seo title="Admin" />

{#if access === 'denied'}
	<div class="flex flex-col items-center justify-center py-16 text-muted-foreground">
		<span>Sorry, you can not access this page.</span>
		<span>You need to be an admin.</span>
	</div>
{:else if access === 'error'}
	<div class="flex flex-col items-center justify-center py-16 text-muted-foreground">
		<span>Could not verify your account.</span>
		<span>Please refresh and try again.</span>
	</div>
{:else}
	<MaxWidthWrapper class="gap-8 pt-4">
		<section>
			<h1 class="text-3xl font-bold md:text-4xl">Submissions</h1>
			<div class="mt-4">
				<SubmissionsTable
					submissions={submissions.data}
					isLoading={access === 'loading' || submissions.isLoading}
					errorMessage={submissions.error ? 'Could not load submissions.' : null}
				/>
			</div>
		</section>

		<section>
			<h2 class="text-3xl font-bold md:text-4xl">Portfolios</h2>
			<div class="mt-4">
				<PortfoliosTable
					portfolios={portfolios.data}
					isLoading={portfolios.isLoading}
					errorMessage={portfolios.error ? 'Could not load portfolios.' : null}
				/>
			</div>
		</section>
	</MaxWidthWrapper>
{/if}
