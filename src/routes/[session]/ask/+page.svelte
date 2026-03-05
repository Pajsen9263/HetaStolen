<script lang="ts">
	import { enhance } from "$app/forms";
	import { cn } from "$lib/utils";
	import type { PageData, ActionData } from "./$types";
	import { Button } from "@/ui/button";

	const MAX_LENGTH = 128;

	const { data, form }: { data: PageData; form: ActionData } = $props();

	let content = $state("");
	let charsLeft = $derived(MAX_LENGTH - content.length);
</script>

<svelte:head>
	<title>Ask a Question — {data.session.name}</title>
</svelte:head>

<main class="flex min-h-svh flex-col items-center justify-center gap-8 p-6">
	<div class="flex w-full max-w-lg flex-col gap-6">
		<div class="flex items-start justify-between gap-4">
			<div class="flex flex-col gap-1">
				<h1 class="text-2xl font-bold tracking-tight">{data.session.name}</h1>
				<p class="text-sm text-muted-foreground">Submit a question for the speaker</p>
			</div>
			<form
				method="POST"
				action="?/logout"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						content = "";
					};
				}}
			>
				<Button variant="outline" size="sm" type="submit">Leave session</Button>
			</form>
		</div>

		{#if form?.success}
			<div class="rounded-lg border border-primary/20 bg-primary/10 p-4">
				<p class="font-medium text-primary">Question submitted!</p>
			</div>
		{/if}

		<form method="POST" action="?/newQuestion" class="flex flex-col gap-4" use:enhance>
			<div class="flex flex-col gap-2">
				<label for="content" class="sr-only">Your question</label>
				<textarea
					id="content"
					name="content"
					placeholder="What's your question?"
					maxlength={MAX_LENGTH}
					rows="4"
					bind:value={content}
					class="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				></textarea>

				<div class="flex items-center justify-between">
					<div>
						{#if form?.error}
							<p class="text-sm text-destructive">{form.error}</p>
						{/if}
					</div>
					<span
						class={cn(
							"text-xs tabular-nums",
							charsLeft < 10 ? "text-destructive" : "text-muted-foreground"
						)}
					>
						{charsLeft}
					</span>
				</div>
			</div>

			<button
				type="submit"
				disabled={content.trim().length < 2}
				class="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
			>
				Submit Question
			</button>
		</form>
	</div>
</main>
