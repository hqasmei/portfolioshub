<script lang="ts">
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { resetMode, setMode, userPrefersMode } from 'mode-watcher';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { cn } from '$lib/utils.js';

	let { isDropDown = false }: { isDropDown?: boolean } = $props();

	// mode-watcher renders the correct state on first paint, so the Next app's
	// `mounted` guard (which returned null until hydration) has no equivalent here.
	const theme = $derived(userPrefersMode.current);
</script>

{#if isDropDown}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="font-base inline-flex items-center justify-center rounded-md text-sm whitespace-nowrap transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
		>
			<SunIcon
				class={cn(
					'h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90'
				)}
			/>
			<MoonIcon
				class={cn(
					'absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0'
				)}
			/>
			<span class="sr-only">Toggle theme</span>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Item class="cursor-pointer" onSelect={() => setMode('light')}>
				Light
			</DropdownMenu.Item>
			<DropdownMenu.Item class="cursor-pointer" onSelect={() => setMode('dark')}>
				Dark
			</DropdownMenu.Item>
			<DropdownMenu.Item class="cursor-pointer" onSelect={() => resetMode()}>
				System
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	<div class="flex flex-row items-center space-x-2 rounded-full border p-1">
		<button
			class={cn(theme === 'light' ? 'rounded-full bg-muted' : 'bg-transparent', 'p-1')}
			onclick={() => setMode('light')}
			aria-label="Light theme"
		>
			<SunIcon size={18} class="stroke-1" />
		</button>

		<button
			class={cn(theme === 'system' ? 'rounded-full bg-muted' : 'bg-transparent', 'p-1')}
			onclick={() => resetMode()}
			aria-label="System theme"
		>
			<MonitorIcon size={18} class="stroke-1" />
		</button>

		<button
			class={cn(theme === 'dark' ? 'rounded-full bg-muted' : 'bg-transparent', 'p-1')}
			onclick={() => setMode('dark')}
			aria-label="Dark theme"
		>
			<MoonIcon size={18} class="stroke-1" />
		</button>
	</div>
{/if}
