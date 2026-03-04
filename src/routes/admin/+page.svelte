<script lang="ts">
	import { Button, buttonVariants } from "@/ui/button";
	import { Ellipsis } from "@lucide/svelte";
	import type { PageProps } from "./$types";
	import * as Table from "@/ui/table";
	import * as Dropdown from "@/ui/dropdown-menu";
	import * as Dialog from "@/ui/dialog";
	import { Input } from "@/ui/input";
	import { enhance } from "$app/forms";
	import * as AlertDialog from "@/ui/alert-dialog";
	import { Label } from "@/ui/label";
	import { newSessionSchema } from "./schemas";
	import { safeParse } from "valibot";

	const { data }: PageProps = $props();

	let showCreateSessionForm = $state(false);

	let createSessionFormValue = $state("");
	let createSessionIssue = $derived.by(() => {
		if (createSessionFormValue == "") {
			return "";
		}

		const result = safeParse(newSessionSchema, { name: createSessionFormValue });

		if (result.success) {
			return "";
		} else {
			return result.issues[0].message;
		}
	});

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

<main class="flex w-screen flex-col items-center px-8 pt-8">
	<!-- <div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Sessions</h1>
		<form method="POST" action="?/logout" use:enhance>
			<Button type="submit" variant="outline" size="sm">Logout</Button>
		</form>
	</div> -->

	<div class="flex min-w-3xl flex-col gap-3">
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
						<Table.Head class="text-center">Count</Table.Head>
						<Table.Head class="text-center">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.sessions as { session, questionCount }, i (session.id)}
						<Table.Row>
							<Table.Cell>{i + 1}</Table.Cell>
							<Table.Cell class="text-lg font-semibold">{session.name}</Table.Cell>
							<Table.Cell>{session.code}</Table.Cell>
							<Table.Cell class="text-center font-semibold">{questionCount}</Table.Cell>
							<Table.Cell class="text-center">
								<Dropdown.Root>
									<Dropdown.Trigger class={buttonVariants({ variant: "ghost", size: "icon" })}>
										<Ellipsis />
									</Dropdown.Trigger>
									<Dropdown.Content>
										<Dropdown.Item>
											<a href={`/admin/${session.id}`}>Moderate</a>
										</Dropdown.Item>
										<Dropdown.Item
											onclick={() => confirmDeleteSession(session.id, session.name)}
											class="text-destructive">Delete</Dropdown.Item
										>
									</Dropdown.Content>
								</Dropdown.Root>
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
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					showCreateSessionForm = false;
				};
			}}
		>
			<Input
				type="text"
				id="name"
				name="name"
				placeholder="Session Name"
				bind:value={createSessionFormValue}
				required
			/>
			<span class="text-sm text-wrap text-destructive">{createSessionIssue}</span>
			<Button type="submit" class="flex-1">Create Session</Button>
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
