<script lang="ts">
	import * as InputGroup from "@/ui/input-group";
	import type { ComponentProps } from "svelte";

	let {
		max,
		value = $bindable(""),
		maxSizeExceeded = $bindable(false),
		class: className,
		...props
	}: {
		max: number;
		value?: string;
		maxSizeExceeded?: boolean;
	} & Omit<ComponentProps<typeof InputGroup.Input>, "type" | "files"> = $props();

	let valueLength = $derived(value.length);

	$effect(() => {
		maxSizeExceeded = valueLength > max;
	});
</script>

<InputGroup.Root>
	<InputGroup.Input
		type="text"
		{...props}
		class={[maxSizeExceeded && "text-destructive", className]}
		bind:value
		required
	/>
	<InputGroup.Addon align="inline-end">
		<span
			class={[
				"font-semibold",
				"text-sm",
				maxSizeExceeded ? "text-destructive" : "text-muted-foreground"
			]}
		>
			{valueLength} / {max}
		</span>
	</InputGroup.Addon>
</InputGroup.Root>
