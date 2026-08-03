<script lang="ts">
	import '../app.css';
	import '@fontsource-variable/inter';

	import { dark } from '@clerk/themes';
	import { mode, ModeWatcher } from 'mode-watcher';
	import { ClerkProvider } from 'svelte-clerk';
	import { Toaster } from 'svelte-sonner';

	import ConvexClerkProvider from '$lib/components/providers/convex-clerk-provider.svelte';

	let { data, children } = $props();

	// `mode` is a module-level rune, so unlike the Next app's ContextProvider
	// (which called useTheme() above the ThemeProvider it rendered) there is no
	// ordering problem reading it here.
	const appearance = $derived({
		baseTheme: mode.current === 'dark' ? dark : undefined,
		signIn: { baseTheme: mode.current === 'dark' ? dark : undefined },
		elements: {
			formFieldInput: 'bg-transparent'
		},
		variables: {
			colorPrimary: 'hsl(221, 83%, 53%)'
		}
	});
</script>

<ModeWatcher />

<ClerkProvider {appearance}>
	<ConvexClerkProvider initialUserId={data.userId}>
		{@render children()}
	</ConvexClerkProvider>
</ClerkProvider>

<Toaster richColors position="top-center" />
