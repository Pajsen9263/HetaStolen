<script lang="ts">
	import { Button } from "@/ui/button";
	import { enhance } from "$app/forms";
	import { Label } from "@/ui/label";
	import MaxSizeInput from "@/maxSize/Input.svelte";
	import Input from "@/ui/input/input.svelte";

	interface Props {
		action: string;
		label: string;
		placeholder: string;
		buttonText: string;
		maxLength?: number;
	}

	let { action, label, placeholder, buttonText, maxLength }: Props = $props();

	let cantSubmit = $state(false);
</script>

<form
	method="POST"
	{action}
	use:enhance={() => {
		return async ({ update }) => {
			await update({ reset: true });
		};
	}}
	class="flex flex-col gap-2"
>
	<Label for="content">{label}</Label>
	{#if maxLength === undefined}
		<Input id="content" name="content" {placeholder} required />
	{:else}
		<MaxSizeInput
			max={maxLength}
			bind:maxSizeExceeded={cantSubmit}
			id="content"
			name="content"
			{placeholder}
			required
		/>
	{/if}
	<Button type="submit" disabled={cantSubmit}>{buttonText}</Button>
</form>
