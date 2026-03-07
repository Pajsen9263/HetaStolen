<script lang="ts">
	import { Button } from "@/ui/button";
	import { onDestroy, type ComponentProps, type Snippet } from "svelte";

	type Props = {
		toCopy: string;
		timeout?: number;
		copiedText?: string;
		copiedSnippet?: Snippet;
	} & ComponentProps<typeof Button>;

	const { toCopy, timeout = 1000, copiedText, copiedSnippet, children, ...props }: Props = $props();

	let copied = $state(false);
	let timeoutId: null | ReturnType<typeof setTimeout> = $state(null);

	onDestroy(() => {
		if (timeoutId) clearTimeout(timeoutId);
	});
</script>

<Button
	{...props}
	onclick={async () => {
		await navigator.clipboard.writeText(toCopy);
		copied = true;
		timeoutId = setTimeout(() => (copied = false), timeout);
	}}
>
	{#if copied}
		{#if copiedSnippet}
			{@render copiedSnippet()}
		{:else if copiedText}
			{copiedText}
		{:else}
			Copied!
		{/if}
	{:else}
		{@render children?.()}
	{/if}
</Button>
