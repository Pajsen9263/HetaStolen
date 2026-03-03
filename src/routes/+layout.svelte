<script lang="ts">
	import ThemePicker from "$lib/components/ThemePicker.svelte";
	import "./layout.css";
	import { ModeWatcher } from "mode-watcher";

	let { children } = $props();
</script>

<ModeWatcher defaultMode="system" />

{@render children()}

<div class="fixed right-4 bottom-4">
	<ThemePicker />
</div>
