<script lang="ts">
	import { page } from "$app/state";
	import type { PageProps } from "./$types";
	import { onMount } from "svelte";

	const { data }: PageProps = $props();

	let QRCode = $state<typeof import("@castlenine/svelte-qrcode").default | null>(null);

	const qrUrl = $derived(`${page.url.origin}/session/${data.session.code}`);

	onMount(async () => {
		const mod = await import("@castlenine/svelte-qrcode");
		QRCode = mod.default;
	});
</script>

<div class="flex flex-col items-center gap-4 p-8">
	<h1 class="text-2xl font-bold">{data.session.name}</h1>
	<p class="text-muted-foreground">Skanna QR för att ställa frågor</p>

	{#if QRCode}
		<QRCode data={qrUrl} size={300} />
	{:else}
		<p class="text-muted-foreground">Loading QR Code...</p>
	{/if}

	<p class="text-sm text-muted-foreground">
		Eller skriv koden: <span class="font-mono font-bold">{data.session.code}</span>
	</p>
</div>
