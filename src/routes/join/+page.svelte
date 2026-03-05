<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageData, ActionData } from "./$types";

	const { data, form }: { data: PageData; form: ActionData } = $props();

	// prefillCode is static server-loaded data — intentionally read once at init
	// svelte-ignore state_referenced_locally
	const prefillCode = data.prefillCode;

	let code = $state((prefillCode ?? "").toUpperCase());

	function handleInput(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		code = input.value
			.toUpperCase()
			.replace(/[^A-Z0-9]/g, "")
			.slice(0, 6);
	}

	// Action that auto-submits the form if a prefill code was provided (QR flow)
	function autosubmit(node: HTMLFormElement) {
		if (prefillCode) {
			node.requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>Join Session</title>
</svelte:head>

<main class="flex min-h-svh flex-col items-center justify-center gap-8 p-6">
	<div class="flex flex-col items-center gap-2 text-center">
		<h1 class="text-3xl font-bold tracking-tight">Join a Session</h1>
		<p class="text-sm text-muted-foreground">Enter the 6-character code shown on the screen</p>
	</div>

	<form method="POST" class="flex w-full max-w-sm flex-col gap-4" use:enhance use:autosubmit>
		<div class="flex flex-col gap-2">
			<label for="code" class="sr-only">Session code</label>
			<input
				id="code"
				name="code"
				type="text"
				inputmode="text"
				autocomplete="off"
				autocorrect="off"
				autocapitalize="characters"
				spellcheck="false"
				maxlength="6"
				placeholder="ABCDEF"
				value={code}
				oninput={handleInput}
				class="w-full rounded-lg border border-input bg-background px-4 py-4 text-center font-mono text-3xl tracking-[0.5em] uppercase ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			/>
			{#if form?.error}
				<p class="text-sm text-destructive">{form.error}</p>
			{/if}
		</div>

		<button
			type="submit"
			disabled={code.length !== 6}
			class="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
		>
			{prefillCode ? "Joining…" : "Join Session"}
		</button>
	</form>
</main>
