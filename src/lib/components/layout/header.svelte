<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { api } from '$convex/_generated/api';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import MessageSquareMoreIcon from '@lucide/svelte/icons/message-square-more';
	import SendIcon from '@lucide/svelte/icons/send';
	import { useQuery } from 'convex-svelte';
	import { SignInButton, SignOutButton, UserButton } from 'svelte-clerk';

	import DialogNavMenu from '$lib/components/dialog-nav-menu.svelte';
	import FeedbackForm from '$lib/components/forms/feedback-form.svelte';
	import SubmissionForm from '$lib/components/forms/submission-form.svelte';
	import MainNav from '$lib/components/main-nav.svelte';
	import ResponsiveDialog from '$lib/components/responsive-dialog.svelte';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { useSession } from '$lib/hooks/session.svelte.js';
	import { cn } from '$lib/utils.js';

	const session = useSession();

	let scrollY = $state(0);
	const scrolled = $derived(scrollY > 70);

	let isSubmitOpen = $state(false);
	let isFeedbackOpen = $state(false);
	let isOpen = $state(false);

	// Gated until Convex holds a token, so the /admin link never flashes in.
	const isAdmin = useQuery(api.users.isAdmin, () => (session.isConvexAuthed ? {} : 'skip'));

	const pathname = $derived(page.url.pathname);
	const isHome = $derived(pathname === '/');

	function handleClick(path: string) {
		isOpen = false;
		goto(path);
	}
</script>

<svelte:window bind:scrollY />

<header
	class={cn('sticky inset-x-0 top-0 z-30 w-full transition-all duration-300', {
		'sticky border-b border-border bg-raised/80 backdrop-blur-lg': scrolled
	})}
>
	<nav class="mx-auto flex h-16 w-full items-center px-4 sm:px-8 lg:px-24">
		<div class="flex w-full flex-row items-center justify-between">
			<div class="flex flex-row items-center gap-8">
				<MainNav />
				<div class="hidden items-center gap-4 md:flex">
					{#if session.isLoggedIn && pathname !== '/'}
						<div class="hidden flex-row gap-4 text-sm md:flex">
							<a
								href="/dashboard"
								class={cn(
									'text-muted-foreground hover:text-foreground hover:duration-200',
									pathname === '/dashboard' && 'font-semibold text-foreground'
								)}
							>
								Dashboard
							</a>
							<a
								href="/favorites"
								class={cn(
									'text-muted-foreground hover:text-foreground hover:duration-200',
									pathname === '/favorites' && 'font-semibold text-foreground'
								)}
							>
								Favorites
							</a>
							{#if isAdmin.data}
								<a
									href="/admin"
									class={cn(
										'text-muted-foreground hover:text-foreground hover:duration-200',
										pathname === '/admin' && 'font-semibold text-foreground'
									)}
								>
									Admin
								</a>
							{/if}
						</div>
					{/if}

					<button
						onclick={() => handleClick('/templates')}
						class={cn(
							'text-sm text-muted-foreground hover:text-foreground hover:duration-200',
							pathname === '/templates' && 'font-semibold text-foreground'
						)}
					>
						Templates
					</button>
				</div>
			</div>
			<div class="flex flex-row items-center gap-2">
				<Button
					size="sm"
					variant="outline"
					onclick={() => (isFeedbackOpen = true)}
					class="hidden gap-2 md:flex"
				>
					<MessageSquareMoreIcon size={16} />
					<span>Feedback</span>
				</Button>
				<Button
					size="sm"
					variant="outline"
					onclick={() => (isSubmitOpen = true)}
					class="hidden gap-2 md:flex"
				>
					<SendIcon size={16} />
					<span>Submit</span>
				</Button>

				{#if session.isLoggedIn}
					{#if isHome}
						<Button size="sm" onclick={() => handleClick('/dashboard')}>Dashboard</Button>
					{:else}
						<div class="ml-2 flex">
							<UserButton />
						</div>
					{/if}
				{:else}
					<SignInButton mode="modal">
						<Button size="sm">Login</Button>
					</SignInButton>
				{/if}
				<button onclick={() => (isOpen = true)} class="md:hidden" aria-label="Open menu">
					<EllipsisVerticalIcon
						size={20}
						class="text-muted-foreground hover:text-foreground hover:duration-200"
					/>
				</button>
			</div>
		</div>
	</nav>
</header>

<ResponsiveDialog bind:open={isFeedbackOpen} header="Feedback">
	<FeedbackForm bind:open={isFeedbackOpen} />
</ResponsiveDialog>

<ResponsiveDialog
	bind:open={isSubmitOpen}
	header="Submit a portfolio"
	description="Allow up to 24 hours for review and addition to our curated collection."
>
	<SubmissionForm bind:open={isSubmitOpen} />
</ResponsiveDialog>

<DialogNavMenu bind:open={isOpen}>
	<div class="flex flex-col items-start gap-4">
		{#if session.isLoggedIn}
			<button
				onclick={() => handleClick('/dashboard')}
				class="text-muted-foreground hover:text-foreground hover:duration-200"
			>
				Dashboard
			</button>
			<button
				onclick={() => handleClick('/favorites')}
				class="text-muted-foreground hover:text-foreground hover:duration-200"
			>
				Favorites
			</button>
			{#if isAdmin.data}
				<button
					onclick={() => handleClick('/admin')}
					class="text-muted-foreground hover:text-foreground hover:duration-200"
				>
					Admin
				</button>
			{/if}
		{/if}

		<button
			onclick={() => handleClick('/templates')}
			class="text-muted-foreground hover:text-foreground hover:duration-200"
		>
			Templates
		</button>
	</div>

	<Separator class="my-4" />

	<div class="flex w-full flex-col items-start gap-4">
		{#if session.isLoggedIn}
			<SignOutButton>
				<span class="cursor-pointer text-muted-foreground hover:text-foreground hover:duration-200">
					Logout
				</span>
			</SignOutButton>
		{:else}
			<SignInButton mode="modal">
				<button
					onclick={() => (isOpen = false)}
					class="text-muted-foreground hover:text-foreground hover:duration-200"
				>
					Login
				</button>
			</SignInButton>
		{/if}
		<button
			onclick={() => {
				isOpen = false;
				isFeedbackOpen = true;
			}}
			class="flex w-full flex-row items-center justify-between"
		>
			<span class="text-muted-foreground">Feedback</span>
		</button>

		<button
			onclick={() => {
				isOpen = false;
				isSubmitOpen = true;
			}}
			class="flex w-full flex-row items-center justify-between"
		>
			<span class="text-muted-foreground">Submit</span>
		</button>

		<div class="flex w-full flex-row items-center justify-between">
			<span class="text-muted-foreground">Theme</span>
			<ThemeToggle />
		</div>
	</div>
</DialogNavMenu>
