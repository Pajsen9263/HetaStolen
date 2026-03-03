<script lang="ts">
	import { goto } from "$app/navigation";

	let sessionId = "";
	let error = "";

	async function submit() {
		error = "";

		const res = await fetch("/api/session", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ sessionId })
		});

		if (res.status === 200) {
			goto(`/session/${sessionId}`);
		} else if (res.status === 404) {
			error = "Session not found";
		} else {
			error = "Something went wrong";
		}
	}
</script>

<form on:submit|preventDefault={submit}>
	<input type="text" bind:value={sessionId} placeholder="Enter session ID" required />
	<button type="submit">Join</button>
</form>

{#if error}
	<p style="color: red">{error}</p>
{/if}
