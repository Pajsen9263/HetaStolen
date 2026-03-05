<script lang="ts" generics="T extends { id: string }">
	import * as Item from "@/ui/item";
	import { Button } from "@/ui/button";
	import { Trash } from "@lucide/svelte";
	import { enhance } from "$app/forms";

	interface Props {
		item: T;
		isSelected: boolean;
		onSelect: (id: string) => void;
		deleteAction: string;
		getItemDisplay: (item: T) => string;
	}

	let { item, isSelected, onSelect, deleteAction, getItemDisplay }: Props = $props();
</script>

<Item.Root
	variant="outline"
	onclick={() => onSelect(item.id)}
	class={["cursor-pointer", isSelected && "border-ring bg-accent"]}
>
	<Item.Content>
		<span class="font-semibold">
			{getItemDisplay(item)}
		</span>
	</Item.Content>
	<Item.Actions>
		<form method="POST" action={deleteAction} use:enhance>
			<input type="hidden" name="id" value={item.id} />
			<Button class="text-destructive" type="submit" variant="ghost" size="icon">
				<Trash />
			</Button>
		</form>
	</Item.Actions>
</Item.Root>
