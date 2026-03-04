<script lang="ts">
	import { enhance } from "$app/forms";
	import { Button } from "@/ui/button";
	import ThemePicker from "$lib/components/ThemePicker.svelte";
	import { page } from "$app/state";

	const isLoginPage = $derived(page.url.pathname === "/admin/login");

	const { children } = $props();
</script>

<nav class="flex h-fit w-full items-center justify-between border-b px-4 py-3">
	<h1 class="text-2xl font-bold">Admin Panel</h1>
	<div class="flex gap-2">
		{#if !isLoginPage}
			<form method="POST" action="?/logout" use:enhance>
				<Button type="submit" variant="ghost" class="cursor-pointer text-lg">Logout</Button>
			</form>
		{/if}
		<ThemePicker variant="ghost" size="icon" />
	</div>
</nav>

{@render children()}
