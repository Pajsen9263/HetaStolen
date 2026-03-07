<script lang="ts" module>
	export type BaseProps = {
		max: number;
		value?: string;
		maxSizeExceeded?: boolean;
	};
</script>

<script lang="ts">
	import * as InputGroup from "@/ui/input-group";
	import type { ComponentProps, Snippet } from "svelte";

	type Props = BaseProps & {
		align?: ComponentProps<typeof InputGroup.Addon>["align"];
		children: Snippet;
	};

	let {
		max,
		value = $bindable(""),
		maxSizeExceeded = $bindable(false),
		align,
		children
	}: Props = $props();

	let valueLength = $derived(value.length);

	$effect(() => {
		maxSizeExceeded = valueLength > max;
	});
</script>

<InputGroup.Root>
	{@render children()}
	<InputGroup.Addon {align}>
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
