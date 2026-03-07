<script lang="ts">
	import { Textarea } from "@/ui/input-group";
	import Base, { type BaseProps } from "./Base.svelte";
	import type { ComponentProps } from "svelte";

	type Props = BaseProps & ComponentProps<typeof Textarea>;

	let {
		class: classes,
		value = $bindable(""),
		maxSizeExceeded = $bindable(false),
		...props
	}: Props = $props();
</script>

<Base bind:value bind:maxSizeExceeded {...props} align="inline-end">
	<Textarea
		{...props}
		class={[maxSizeExceeded && "text-destructive", classes]}
		bind:value
		required
	/>
</Base>
