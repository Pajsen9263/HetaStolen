<script lang="ts">
	import { page } from "$app/state";
	import type { PageProps } from "./$types";
	import QRCode from "@castlenine/svelte-qrcode";

	const { data }: PageProps = $props();

	const url = $derived(`${page.url.origin}/session/${data.session.code}`);
</script>

<div class="flex flex-col items-center gap-4 p-8">
	<h1 class="text-2xl font-bold">{data.session.name}</h1>
	<p class="text-muted-foreground">Skanna QR för att ställa frågor</p>

	<QRCode data={url} size={300} />

	<p class="text-sm text-muted-foreground">
		Eller skriv koden: <span class="font-mono font-bold">{data.session.code}</span>
	</p>
</div>
