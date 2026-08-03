<script lang="ts">
	import Seo from '$lib/components/seo.svelte';
	import { api } from '$convex/_generated/api';
	import { useMutation, useQuery } from 'convex-svelte';

	import DeleteConfirmForm from '$lib/components/admin/delete-confirm-form.svelte';
	import PortfolioForm from '$lib/components/admin/portfolio-form.svelte';
	import MaxWidthWrapper from '$lib/components/max-width-wrapper.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { useSession } from '$lib/hooks/session.svelte.js';
	import { cn } from '$lib/utils.js';

	const session = useSession();

	// Gated on the Convex token so the denial block doesn't flash for admins.
	const gate = $derived(session.isConvexAuthed ? {} : ('skip' as const));

	const user = useQuery(api.users.getMyUser, () => gate);
	const submissions = useQuery(api.submissions.getSubmissions, () => gate);
	const portfolios = useQuery(api.portfolios.getAllPortfolios, {});

	const deletePortfolio = useMutation(api.portfolios.delelePortfolio);
	const deleteSubmission = useMutation(api.submissions.deleteSubmission);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let item = $state<any>(null);
	let isAddPortfolio = $state(false);
	let isEditOpen = $state(false);
	let isDeleteSubmissionOpen = $state(false);
	let isDeletePortfolioOpen = $state(false);
</script>

<Seo title="Admin" />

{#if user.data?.isAdmin !== true}
	<div class="flex flex-col items-center justify-center py-16 text-muted-foreground">
		<span>Sorry, you can not access this page.</span>
		<span>You need to be an admin.</span>
	</div>
{:else}
	<MaxWidthWrapper class="gap-4 pt-4">
		<div>
			<span class="text-3xl font-bold md:text-4xl">Submissions</span>
			{#if submissions.data?.length === 0}
				<div class="mt-4 flex items-center justify-center rounded-md border py-16">
					<span class="text-muted-foreground">No submissions to review</span>
				</div>
			{:else}
				<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each submissions.data ?? [] as submission (submission._id)}
						<Card.Root class="w-full rounded-md border border-border p-6 shadow-xs">
							<div class="relative flex flex-col gap-2">
								<a
									href={submission.link}
									target="_blank"
									rel="noopener noreferrer"
									class="flex flex-col gap-2"
								>
									<div>
										<Badge
											class={cn(
												'text-foreground capitalize',
												submission.status === 'pending' && 'bg-yellow-700 hover:bg-yellow-800',
												submission.status === 'completed' && 'bg-green-700 hover:bg-green-800'
											)}
										>
											{submission.status}
										</Badge>
									</div>
									<span class="text-xl font-bold">{submission.name}</span>
								</a>

								<div class="flex items-center justify-start gap-2">
									{#if submission.status === 'pending'}
										<Button
											size="sm"
											onclick={() => {
												item = submission;
												isAddPortfolio = true;
											}}
										>
											Submit
										</Button>
									{:else}
										<Button
											size="sm"
											variant="destructive"
											onclick={() => {
												item = submission;
												isDeleteSubmissionOpen = true;
											}}
										>
											Delete
										</Button>
									{/if}
								</div>
							</div>
						</Card.Root>
					{/each}
				</div>
			{/if}
		</div>
		<div>
			<span class="text-3xl font-bold md:text-4xl">Portfolios</span>
			{#if portfolios.data?.length === 0}
				<div class="mt-4 flex items-center justify-center rounded-md border py-16">
					<span class="text-muted-foreground">No portfolios</span>
				</div>
			{:else}
				<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each portfolios.data ?? [] as portfolio (portfolio._id)}
						<Card.Root class="w-full rounded-md border border-border p-6 shadow-xs">
							<div class="relative flex flex-col gap-2">
								<a
									href={portfolio.link}
									target="_blank"
									rel="noopener noreferrer"
									class="flex flex-col gap-2"
								>
									<div>
										{#if !portfolio.socials}
											<Badge class="bg-orange-500 text-white">Need to update socials</Badge>
										{/if}
									</div>
									<span class="text-xl font-bold">{portfolio.name}</span>
								</a>

								<div class="flex items-center justify-start gap-2">
									<Button
										size="sm"
										onclick={() => {
											item = portfolio;
											isEditOpen = true;
										}}
									>
										Update
									</Button>
									<Button
										size="sm"
										variant="destructive"
										onclick={() => {
											item = portfolio;
											isDeletePortfolioOpen = true;
										}}
									>
										Delete
									</Button>
								</div>
							</div>
						</Card.Root>
					{/each}
				</div>
			{/if}
		</div>
	</MaxWidthWrapper>

	<!-- Add Portfolio Form -->
	<Dialog.Root bind:open={isAddPortfolio}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Add portfolio</Dialog.Title>
			</Dialog.Header>
			{#key item?._id}
				<PortfolioForm bind:open={isAddPortfolio} mode="add" {item} />
			{/key}
		</Dialog.Content>
	</Dialog.Root>

	<!-- Delete Submission Form -->
	<Dialog.Root bind:open={isDeleteSubmissionOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Delete submission</Dialog.Title>
			</Dialog.Header>
			<DeleteConfirmForm
				bind:open={isDeleteSubmissionOpen}
				onConfirm={() => deleteSubmission({ submissionId: item._id })}
			/>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Delete Portfolio Form -->
	<Dialog.Root bind:open={isDeletePortfolioOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Delete portfolio</Dialog.Title>
			</Dialog.Header>
			<DeleteConfirmForm
				bind:open={isDeletePortfolioOpen}
				onConfirm={() => deletePortfolio({ portfolioId: item._id, portfolioImageId: item.image })}
			/>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Edit Portfolio Form -->
	<Dialog.Root bind:open={isEditOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Edit portfolio</Dialog.Title>
			</Dialog.Header>
			{#key item?._id}
				<PortfolioForm bind:open={isEditOpen} mode="edit" {item} />
			{/key}
		</Dialog.Content>
	</Dialog.Root>
{/if}
