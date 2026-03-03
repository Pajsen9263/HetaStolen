<script lang="ts" module>
	import * as v from "valibot";

	export const loginSchema = v.object({
		adminSecret: v.pipe(v.string(), v.minLength(1, "Password is required"))
	});
</script>

<script lang="ts">
	import { enhance } from "$app/forms";
	import * as Card from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";

	// I don't really like that this isn't as typesafe as my implementation in Blocketia, I will refactor this.
	let { form } = $props<{ form: { error: string } | null }>();

	let loading = $state(false);
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-2xl">Admin Login</Card.Title>
			<Card.Description>Enter the admin password to continue</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
				class="space-y-4"
			>
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

				<Button type="submit" class="mt-4 w-full" disabled={loading}>
					{#if loading}
						Loading...
					{:else}
						Login
					{/if}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
