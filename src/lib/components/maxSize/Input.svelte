<script lang="ts">
	import { Input } from "@/ui/input-group";
	import Base, { type BaseProps } from "./Base.svelte";
	import type { ComponentProps } from "svelte";

	type Props = BaseProps & Omit<ComponentProps<typeof Input>, "type" | "files">;

	let {
		class: classes,
		value = $bindable(""),
		maxSizeExceeded = $bindable(false),
		...props
	}: Props = $props();
</script>

<Base bind:value bind:maxSizeExceeded {...props} align="inline-end">
	<Input
		type="text"
		{...props}
		class={[maxSizeExceeded && "text-destructive", classes]}
		bind:value
		required
	/>
</Base>
