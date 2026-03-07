<script lang="ts">
	import { page } from "$app/state";
	import type { PageProps } from "./$types";
	import type { ProjectorState } from "$lib/server/services/projector.service";
	import CircleTimer from "$lib/components/CircleTimer.svelte";
	import QRCode from "@castlenine/svelte-qrcode";
	import { useSSE } from "$lib/sse/useSSE.svelte";
	import logo from "$lib/assets/android-chrome-512x512.png";
	import { onMount } from "svelte";

	const { data }: PageProps = $props();

	let projectorState = $derived<ProjectorState>(data.projectorState);

	function applyTheme(theme: ProjectorState["theme"]) {
		const html = document.documentElement;
		const light = theme === "light";
		// toggle classes (replace with your actual classnames, e.g. "dark")
		if (light) {
			html.classList.remove("dark");
		} else {
			html.classList.add("dark");
		}
	}

	// Apply the initial theme from SSR state once on mount
	onMount(() => {
		applyTheme(projectorState.theme);
	});

	useSSE(`/${page.params.session}`, {
		roundStarted: (state: ProjectorState) => {
			projectorState = state;
		},
		roundCancelled: (state: ProjectorState) => {
			projectorState = state;
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
</script>

<main class="relative flex min-h-screen overflow-hidden bg-background">
	{#if isRoundActive}
		<!-- Active round display: two equal columns filling the full screen -->
		<div class="flex w-full items-stretch">
			<!-- Left: timer column, fills its half -->
			<div class="flex flex-1 items-center justify-center p-12">
				<CircleTimer
					class="aspect-square w-full"
					endTimestamp={projectorState.timerEndTimestamp}
					duration={30}
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
			<QRCode data={qrUrl} size={250} />
			<p class="font-mono text-6xl font-semibold tracking-widest text-muted-foreground">
				{data.session.code}
			</p>
		</div>
	{/if}
</main>
