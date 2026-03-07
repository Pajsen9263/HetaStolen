<script lang="ts">
	import { Button, buttonVariants } from "@/ui/button";
	import { Trash } from "@lucide/svelte";
	import * as Table from "@/ui/table";
	import * as Dialog from "@/ui/dialog";
	import { enhance } from "$app/forms";
	import * as AlertDialog from "@/ui/alert-dialog";
	import { Label } from "@/ui/label";
	import MaxSizeInput from "@/maxSize/Input.svelte";

	const { data } = $props();

	let createSessionFaulty = $state(false);

	let showCreateSessionForm = $state(false);

	type SelectedSession = {
		id: string;
		name: string;
	};

	let deleteDialogOpen = $state(false);
	let sessionToDelete: SelectedSession | null = $state(null);

	function confirmDeleteSession(id: string, name: string) {
		deleteDialogOpen = true;
		sessionToDelete = { id, name };
	}
</script>

<main class="flex w-screen flex-col items-center px-8">
	<div class="mt-3 flex min-w-3xl flex-col gap-3">
		<div class="flex justify-start">
			<Button onclick={() => (showCreateSessionForm = true)}>Create Session</Button>
		</div>

		<div class="overflow-hidden rounded border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>#</Table.Head>
						<Table.Head>Name</Table.Head>
						<Table.Head>Code</Table.Head>
						<Table.Head class="text-center">Question Count</Table.Head>
						<Table.Head class="text-center">Speaker Count</Table.Head>
						<Table.Head class="text-center">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.sessions as { session, questionCount, speakerCount }, i (session.id)}
						<Table.Row>
							<Table.Cell>
								<span class="text-bold text-lg">
									{i + 1}
								</span>
							</Table.Cell>
							<Table.Cell class="text-lg font-semibold">{session.name}</Table.Cell>
							<Table.Cell class="font-mono">{session.code}</Table.Cell>
							<Table.Cell class="text-center text-lg font-semibold">{questionCount}</Table.Cell>
							<Table.Cell class="text-center text-lg font-semibold">{speakerCount}</Table.Cell>
							<Table.Cell class="flex gap-2">
								<Button variant="outline" href={`/admin/${session.id}`} class="flex-1"
									>Moderate</Button
								>
								<Button
									variant="outline"
									class="flex-1 text-destructive"
									onclick={() => confirmDeleteSession(session.id, session.name)}
								>
									<Trash size={6} />
									Remove
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</div>
</main>

<Dialog.Root bind:open={showCreateSessionForm}>
	<Dialog.Content class="sm:max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Create Session</Dialog.Title>
		</Dialog.Header>
		<form
			method="POST"
			action="?/newSession"
			class="flex flex-col gap-4"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					showCreateSessionForm = false;
				};
			}}
		>
			<div class="space-y-2">
				<Label for="name">Session Name</Label>
				<MaxSizeInput
					bind:maxSizeExceeded={createSessionFaulty}
					max={32}
					id="name"
					name="name"
					placeholder="Please Input Session Name..."
					required
				/>
			</div>
			<Button type="submit" disabled={createSessionFaulty} class="flex-1">Create Session</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Session</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to delete session <span class="font-semibold"
					>{sessionToDelete?.name}</span
				>?
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form
				method="POST"
				action="?/deleteSession"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						deleteDialogOpen = false;
					};
				}}
			>
				<input type="hidden" name="id" value={sessionToDelete?.id} />
				<AlertDialog.Action class={buttonVariants({ variant: "destructive" })} type="submit"
					>Confirm</AlertDialog.Action
				>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
