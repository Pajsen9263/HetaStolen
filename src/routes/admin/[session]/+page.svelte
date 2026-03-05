<script lang="ts">
	import { page } from "$app/state";
	import type { Question } from "$lib/server/services/question.service";
	import type { Speaker } from "$lib/server/services/speaker.service";
	import EntityItem from "./EntityItem.svelte";
	import EntityForm from "./EntityForm.svelte";
	import { Separator } from "@/ui/separator/";
	import { Button } from "@/ui/button/";
	import { useSSE } from "$lib/hooks/useSSE.svelte";
	import CircleTimer from "$lib/components/CircleTimer.svelte";
	import { enhance } from "$app/forms";

	const { data } = $props();

	// svelte-ignore state_referenced_locally -- intentional: seed mutable state from static load data
	let questions: Question[] = $state(data.session.questions);
	// svelte-ignore state_referenced_locally
	let speakers: Speaker[] = $state(data.session.speakers);

	// Set up SSE with event handlers
	useSSE(`/admin/${page.params.session}`, {
		questionCreated: (newQuestion: Question) => {
			questions.push(newQuestion);
		},
		questionDeleted: (deletedQuestion: Question) => {
			questions = questions.filter((q) => q.id !== deletedQuestion.id);
		},
		speakerCreated: (newSpeaker: Speaker) => {
			speakers.push(newSpeaker);
		},
		speakerDeleted: (deletedSpeaker: Speaker) => {
			speakers = speakers.filter((s) => s.id !== deletedSpeaker.id);
		},
		timerUpdate: (payload: { timerEndTimestamp: number | null }) => {
			timerEndTimestamp = payload.timerEndTimestamp;
		},
		themeChanged: (payload: { theme: "light" | "dark" | "system" }) => {
			projectorTheme = payload.theme;
		},
		qrToggled: (payload: { qrVisible: boolean }) => {
			qrVisible = payload.qrVisible;
		}
	});

	let selectedQuestionId = $state<string | null>(null);
	let selectedSpeakerId = $state<string | null>(null);
	let timerEndTimestamp = $state<number | null>(null);
	let projectorTheme = $state<"light" | "dark" | "system">("system");
	let qrVisible = $state<boolean>(true);

	// Derived values for selected entities
	let selectedSpeaker = $derived(speakers.find((s) => s.id === selectedSpeakerId) ?? null);
	let selectedQuestion = $derived(questions.find((q) => q.id === selectedQuestionId) ?? null);

	// Track last selected for random exclusion
	let lastRandomSpeakerId = $state<string | null>(null);
	let lastRandomQuestionId = $state<string | null>(null);

	function selectRandomSpeaker() {
		if (speakers.length === 0) return;

		// Filter out last selected if we have more than 1 speaker
		const available =
			speakers.length > 1 ? speakers.filter((s) => s.id !== lastRandomSpeakerId) : speakers;

		const randomIndex = Math.floor(Math.random() * available.length);
		const selected = available[randomIndex];
		selectedSpeakerId = selected.id;
		lastRandomSpeakerId = selected.id;
	}

	function selectNextSpeaker() {
		if (speakers.length === 0) return;

		if (!selectedSpeakerId) {
			selectedSpeakerId = speakers[0].id;
			return;
		}

		const currentIndex = speakers.findIndex((s) => s.id === selectedSpeakerId);
		const nextIndex = (currentIndex + 1) % speakers.length;
		selectedSpeakerId = speakers[nextIndex].id;
	}

	function selectRandomQuestion() {
		if (questions.length === 0) return;

		// Filter out last selected if we have more than 1 question
		const available =
			questions.length > 1 ? questions.filter((q) => q.id !== lastRandomQuestionId) : questions;

		const randomIndex = Math.floor(Math.random() * available.length);
		const selected = available[randomIndex];
		selectedQuestionId = selected.id;
		lastRandomQuestionId = selected.id;
	}

	function selectNextQuestion() {
		if (questions.length === 0) return;

		if (!selectedQuestionId) {
			selectedQuestionId = questions[0].id;
			return;
		}

		const currentIndex = questions.findIndex((q) => q.id === selectedQuestionId);
		const nextIndex = (currentIndex + 1) % questions.length;
		selectedQuestionId = questions[nextIndex].id;
	}

	let canStartRound = $derived(selectedSpeakerId !== null && selectedQuestionId !== null);
	let isRoundActive = $derived(timerEndTimestamp !== null);
</script>

<main
	class="flex w-full flex-col justify-between gap-8 px-8 pt-3 md:h-[calc(100vh-4rem)] md:flex-row md:overflow-hidden"
>
	<div class="flex flex-1 flex-col gap-3 md:overflow-y-auto">
		<h2 class="text-center text-2xl font-bold">Actions and Info</h2>

		<!-- Timer -->
		<div class="flex justify-center py-4">
			<CircleTimer endTimestamp={timerEndTimestamp} duration={30} />
		</div>

		<Separator class="my-2" />

		<!-- Speaker Selection -->
		<div class="flex flex-col gap-2">
			<span class="text-sm font-medium text-muted-foreground">Speaker</span>
			<p class="min-h-6 truncate text-lg font-semibold">
				{selectedSpeaker?.name ?? "None selected"}
			</p>
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					onclick={selectRandomSpeaker}
					disabled={speakers.length === 0}
				>
					Random
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={selectNextSpeaker}
					disabled={speakers.length === 0}
				>
					Next
				</Button>
			</div>
		</div>

		<Separator class="my-2" />

		<!-- Question Selection -->
		<div class="flex flex-col gap-2">
			<span class="text-sm font-medium text-muted-foreground">Question</span>
			<p class="line-clamp-2 min-h-12 text-lg font-semibold">
				{selectedQuestion?.content ?? "None selected"}
			</p>
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					onclick={selectRandomQuestion}
					disabled={questions.length === 0}
				>
					Random
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={selectNextQuestion}
					disabled={questions.length === 0}
				>
					Next
				</Button>
			</div>
		</div>

		<Separator class="my-2" />

		<!-- Round Controls -->
		<div class="flex flex-col gap-2">
			<form method="POST" action="?/startRound" use:enhance>
				<input type="hidden" name="speakerId" value={selectedSpeakerId ?? ""} />
				<input type="hidden" name="questionId" value={selectedQuestionId ?? ""} />
				<Button type="submit" disabled={!canStartRound || isRoundActive} class="w-full">
					Start Round
				</Button>
			</form>
			<form method="POST" action="?/cancelRound" use:enhance>
				<Button type="submit" variant="outline" disabled={!isRoundActive} class="w-full">
					Cancel Round
				</Button>
			</form>
		</div>

		<Separator class="my-2" />

		<!-- Projector Theme -->
		<div class="flex flex-col gap-2">
			<span class="text-sm font-medium text-muted-foreground">Projector Theme</span>
			<div class="flex gap-2">
				{#each ["light", "dark", "system"] as const as theme}
					<form method="POST" action="?/setTheme" use:enhance class="flex-1">
						<input type="hidden" name="theme" value={theme} />
						<Button
							type="submit"
							variant={projectorTheme === theme ? "default" : "outline"}
							size="sm"
							class="w-full capitalize"
						>
							{theme}
						</Button>
					</form>
				{/each}
			</div>
		</div>

		<Separator class="my-2" />

		<!-- QR Code Toggle -->
		<div class="flex flex-col gap-2">
			<span class="text-sm font-medium text-muted-foreground">QR Code</span>
			<form method="POST" action="?/toggleQR" use:enhance>
				<input type="hidden" name="visible" value={String(!qrVisible)} />
				<Button type="submit" variant="outline" class="w-full">
					{qrVisible ? "Hide QR Code" : "Show QR Code"}
				</Button>
			</form>
		</div>
	</div>

	<!-- Speakers Section -->
	<div class="flex flex-1 flex-col gap-3">
		<h2 class="text-center text-2xl font-bold">Speakers</h2>

		<EntityForm
			action="?/newSpeaker"
			label="Speaker Name"
			placeholder="Speaker Name"
			buttonText="Add Speaker"
		/>

		<Separator class="my-4" />

		<div class="flex flex-1 flex-col gap-2 md:overflow-y-scroll md:pr-2">
			{#each speakers as speaker (speaker.id)}
				<EntityItem
					item={speaker}
					isSelected={speaker.id === selectedSpeakerId}
					onSelect={(id) => (selectedSpeakerId = id)}
					deleteAction="?/deleteSpeaker"
					getItemDisplay={(s) => s.name}
				/>
			{:else}
				<div class="flex h-full items-center justify-center">
					<span class="text-lg font-semibold text-muted-foreground">No Speakers For Session</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Questions Section -->
	<div class="flex flex-1 flex-col gap-3">
		<h2 class="text-center text-2xl font-bold">Questions</h2>

		<EntityForm
			maxLength={128}
			action="?/newQuestion"
			label="Question"
			placeholder="What is the airspeed of a laden swallow?"
			buttonText="Add Question"
		/>

		<Separator class="my-4" />

		<div class="flex flex-1 flex-col gap-2 md:overflow-y-scroll md:pr-2">
			{#each questions as question (question.id)}
				<EntityItem
					item={question}
					isSelected={question.id === selectedQuestionId}
					onSelect={(id) => (selectedQuestionId = id)}
					deleteAction="?/deleteQuestion"
					getItemDisplay={(q) => q.content}
				/>
			{:else}
				<div class="flex h-full items-center justify-center">
					<span class="text-lg font-semibold text-muted-foreground">No Questions For Session</span>
				</div>
			{/each}
		</div>
	</div>
</main>

<style>
	::-webkit-scrollbar {
		width: 0.5rem;
		height: 0.5rem;
		background: transparent;
	}

	::-webkit-scrollbar-track {
		background: transparent;
	}

	::-webkit-scrollbar-thumb {
		background-color: hsl(var(--border));
		border-radius: calc(infinity * 1px);
	}

	::-webkit-scrollbar-thumb:hover {
		background-color: hsl(var(--muted-foreground) / 0.5);
	}

	* {
		scrollbar-width: thin;
		scrollbar-color: hsl(var(--border)) transparent;
	}
</style>
