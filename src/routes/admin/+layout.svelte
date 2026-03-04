<script lang="ts">
	import { enhance } from "$app/forms";
	import { Button } from "@/ui/button";
	import ThemePicker from "$lib/components/ThemePicker.svelte";

	const { children } = $props();
</script>

<nav class="flex h-fit w-full items-center justify-between border border-b px-4 py-4">
	<h1 class="text-2xl font-bold">Admin Panel</h1>
	<div class="flex gap-2">
		<ThemePicker variant="ghost" size="icon" />
		<form method="POST" action="?/logout" use:enhance>
			<Button type="submit" variant="ghost" class="text-lg font-semibold">Logout</Button>
		</form>
	</div>
</nav>

{@render children()}
