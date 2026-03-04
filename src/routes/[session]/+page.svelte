<script lang="ts">
	import { browser } from "$app/environment";

	const { data } = $props();

	if (browser) {
		console.log(data);
	}
</script>
