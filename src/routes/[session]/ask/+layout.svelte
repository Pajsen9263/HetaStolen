<script lang="ts">
	import ThemePicker from "$lib/components/ThemePicker.svelte";

	const { children } = $props();
</script>

{@render children()}

<div class="fixed right-4 bottom-4">
	<ThemePicker />
</div>
