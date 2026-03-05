<script lang="ts">
	import { page } from "$app/state";
	import type { Question } from "$lib/server/services/question.service";
	import type { Speaker } from "$lib/server/services/speaker.service";
	import EntityItem from "./EntityItem.svelte";
	import EntityForm from "./EntityForm.svelte";
	import { Separator } from "@/ui/separator/";
	import { useSSE } from "$lib/hooks/useSSE.svelte";

	const { data } = $props();

	let questions: Question[] = $derived(data.session.questions);
	let speakers: Speaker[] = $derived(data.session.speakers);

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
		}
	});

	let selectedQuestionId = $state<string | null>(null);
	let selectedSpeakerId = $state<string | null>(null);
</script>

<main
	class="flex w-full flex-col justify-between gap-8 px-8 pt-3 md:h-[calc(100vh-4rem)] md:flex-row md:overflow-hidden"
>
	<div class="flex flex-1 flex-col gap-3 md:overflow-y-auto">
		<h2 class="text-center text-2xl font-bold">Actions and Info</h2>
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
