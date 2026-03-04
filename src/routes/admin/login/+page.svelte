<script lang="ts">
	import { enhance } from "$app/forms";
	import * as Card from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";

	let { form } = $props();
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-2xl">Admin Login</Card.Title>
			<Card.Description>Enter the admin password to continue</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="adminSecret">Password</Label>
					<Input
						type="password"
						id="adminSecret"
						name="adminSecret"
						placeholder="Enter admin password"
						required
					/>
				</div>

				{#if form?.error}
					<p class="text-sm text-red-500">{form.error}</p>
				{/if}

				<Button type="submit" class="mt-4 w-full">Login</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
