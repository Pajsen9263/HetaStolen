<script lang="ts">
	import { enhance } from "$app/forms";
	import { Button } from "@/ui/button";
	import ThemePicker from "$lib/components/theme-picker.svelte";
	import { page } from "$app/state";

	const isLoginPage = $derived(page.url.pathname === "/admin/login");

	const { children } = $props();
</script>

<nav class="flex h-fit w-full items-center justify-between border-b px-4 py-3">
	<h1 class="text-2xl font-bold">Admin Panel</h1>
	<div class="flex gap-2">
		{#if !isLoginPage}
			<Button
				type="submit"
				variant="ghost"
				href="/admin/logout"
				data-sveltekit-preload-data="off"
				class="cursor-pointer text-lg">Logout</Button
			>
		{/if}
		<ThemePicker variant="ghost" size="icon" />
	</div>
</nav>

{@render children()}
