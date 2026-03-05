<script lang="ts">
	import { page } from "$app/state";
	import type { PageProps } from "./$types";
	import type { ProjectorState } from "$lib/server/services/projector.service";
	import CircleTimer from "$lib/components/CircleTimer.svelte";
	import QRCode from "@castlenine/svelte-qrcode";
	import { useSSE } from "$lib/hooks/useSSE.svelte";
	import { setMode } from "mode-watcher";
	import logo from "$lib/assets/android-chrome-512x512.png";
	import { onMount } from "svelte";

	const { data }: PageProps = $props();

	// Seeded from SSR, then kept in sync via SSE events — intentionally not reactive to data changes
	// svelte-ignore state_referenced_locally
	let projectorState = $state<ProjectorState>(data.projectorState);
	let isExpired = $state(false);

	function applyTheme(theme: ProjectorState["theme"]) {
		setMode(theme);
	}

	// Apply the initial theme from SSR state once on mount
	onMount(() => {
		applyTheme(projectorState.theme);
	});

	useSSE(`/${page.params.session}`, {
		roundStarted: (state: ProjectorState) => {
			projectorState = state;
			isExpired = false;
		},
		roundCancelled: (state: ProjectorState) => {
			projectorState = state;
			isExpired = false;
		},
		themeChanged: (state: ProjectorState) => {
			projectorState = state;
			applyTheme(state.theme);
		},
		qrToggled: (state: ProjectorState) => {
			projectorState = state;
		}
	});

	const isRoundActive = $derived(projectorState.speakerName !== null);

	const qrUrl = $derived(`${page.url.origin}/connect?code=${data.session.code}`);

	// Measure the timer column so the circle fills it
	let timerColumn = $state<HTMLDivElement | undefined>();
	let timerSize = $state(300);

	$effect(() => {
		if (!timerColumn) return;
		const ro = new ResizeObserver(([entry]) => {
			timerSize = Math.floor(entry.contentRect.width);
		});
		ro.observe(timerColumn);
		return () => ro.disconnect();
	});
</script>

<main class="relative flex min-h-screen overflow-hidden bg-background">
	{#if isRoundActive}
		<!-- Active round display: two equal columns filling the full screen -->
		<div class="flex w-full items-stretch">
			<!-- Left: timer column, fills its half -->
			<div
				bind:this={timerColumn}
				class="flex flex-1 items-center justify-center p-12"
				class:expired={isExpired}
			>
				<CircleTimer
					endTimestamp={projectorState.timerEndTimestamp}
					duration={30}
					size={timerSize}
					strokeWidth={Math.max(8, Math.round(timerSize * 0.045))}
					onEnd={() => {
						isExpired = true;
					}}
				/>
			</div>

			<!-- Right: speaker + question, fills its half -->
			<div class="flex flex-1 flex-col justify-center gap-10 p-12">
				<h1 class="text-[8vw] leading-none font-bold tracking-widest text-primary uppercase">
					{projectorState.speakerName}
				</h1>
				<p class="text-[4vw] leading-snug font-medium text-foreground">
					{projectorState.questionContent}
				</p>
			</div>
		</div>
	{:else}
		<!-- Idle state: logo centered -->
		<div class="flex w-full items-center justify-center">
			<img
				src={logo}
				alt="Logo"
				class="w-1/3 max-w-sm opacity-80 mix-blend-multiply dark:mix-blend-screen"
			/>
		</div>
	{/if}

	<!-- QR code: bottom-right corner -->
	{#if projectorState.qrVisible}
		<div
			class="absolute right-8 bottom-8 flex flex-col items-center gap-2 rounded-xl border bg-card p-4 shadow-xl"
		>
			<QRCode data={qrUrl} size={150} />
			<p class="font-mono text-sm font-semibold tracking-widest text-muted-foreground">
				{data.session.code}
			</p>
		</div>
	{/if}
</main>

<style>
	.expired :global(.stroke-primary) {
		stroke: hsl(var(--destructive));
	}

	.expired :global(span) {
		color: hsl(var(--destructive));
	}
</style>
