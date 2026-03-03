<script lang="ts">
	const { children } = $props();
</script>

<main class="flex w-screen justify-center">
	<div class="flex w-1/3 flex-col items-center gap-3">
		{@render children()}
	</div>
</main>
