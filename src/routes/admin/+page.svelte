<script lang="ts" module>
	import * as v from "valibot";

	export const createSessionSchema = v.object({
		name: v.pipe(
			v.string(),
			v.minLength(2, "Name must be at least 2 characters long"),
			v.maxLength(20, "Name can't be longer than 20 characters"),
			v.trim()
		)
	});
</script>

<script lang="ts">
	import { Button } from "@/ui/button";
	import type { PageProps } from "./$types";
	import * as Table from "@/ui/table";
	import Separator from "@/ui/separator/separator.svelte";
	import { Input } from "@/ui/input";
	import { enhance } from "$app/forms";

	const { data }: PageProps = $props();
</script>

<div class="flex items-center justify-between">
	<h1 class="text-2xl font-bold">Sessions</h1>
	<form method="POST" action="?/logout" use:enhance>
		<Button type="submit" variant="outline" size="sm">Logout</Button>
	</form>
</div>

<form method="POST" action="?/create" class="flex items-center gap-2" use:enhance>
	<Input type="text" name="name" placeholder="Session Name" required class="flex-1" />
	<Button type="submit">Create Session</Button>
</form>

<Separator></Separator>

<div class="w-full overflow-hidden rounded border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>#</Table.Head>
				<Table.Head>Name</Table.Head>
				<Table.Head>Code</Table.Head>
				<Table.Head>Created At</Table.Head>
				<Table.Head class="text-center">Count</Table.Head>
				<Table.Head class="text-center">Edit</Table.Head>
				<Table.Head class="text-center">QR</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.sessions as { session, questionCount }, i (session.id)}
				<Table.Row>
					<Table.Cell>{i + 1}</Table.Cell>
					<Table.Cell class="text-lg font-semibold">{session.name}</Table.Cell>
					<Table.Cell>{session.code}</Table.Cell>
					<Table.Cell>{session.createdAt.toLocaleString()}</Table.Cell>
					<Table.Cell class="text-center font-semibold">{questionCount}</Table.Cell>
					<Table.Cell>
						<Button variant="outline" size="sm" class="w-full" href={`/admin/${session.id}`}
							>Edit
						</Button>
					</Table.Cell>
					<Table.Cell>
						<Button
							variant="outline"
							size="sm"
							class="w-full"
							href={`/admin/qr/${session.id}`}
							target="_blank"
							>View
						</Button>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
