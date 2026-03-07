import { getSessionWithRelations, getSpeakerById, getQuestionById } from "$lib/server/db/queries";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import {
	createQuestionSchema,
	deleteSchema,
	startRoundSchema,
	setThemeSchema,
	toggleQRSchema
} from "./schemas";
import { parseForm } from "$lib/utils";

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await getSessionWithRelations(params.session);

	const projectorState = locals.projectorService.getState(params.session);

	if (!session) {
		throw error(404, "Session not found");
	}

	return {
		session,
		projector: projectorState
	};
};

export const actions = {
	newQuestion: async ({ request, params, locals }) => {
		const result = await parseForm(request, createQuestionSchema);

		if (!result.success) {
			throw error(400, "Invalid form data");
		}

		const { content } = result.output;

		const ok = await locals.questionService.createQuestion(params.session, content);

		if (!ok) {
			throw error(500, "Failed to create question");
		}
	},
	deleteQuestion: async ({ request, locals }) => {
		const result = await parseForm(request, deleteSchema);

		if (!result.success) {
			throw error(400, "Invalid form data");
		}

		const { id } = result.output;

		const ok = await locals.questionService.deleteQuestion(id);

		if (!ok) {
			throw error(500, "Failed to delete question");
		}
	},
	newSpeaker: async ({ request, params, locals }) => {
		const result = await parseForm(request, createQuestionSchema);

		if (!result.success) {
			throw error(400, "Invalid form data");
		}

		const { content } = result.output;

		const ok = await locals.speakerService.createSpeaker(params.session, content);

		if (!ok) {
			throw error(500, "Failed to create speaker");
		}
	},
	deleteSpeaker: async ({ request, locals }) => {
		const result = await parseForm(request, deleteSchema);

		if (!result.success) {
			console.log(result.issues);
			throw error(400, "Invalid form data");
		}

		const { id } = result.output;

		const ok = await locals.speakerService.deleteSpeaker(id);

		if (!ok) {
			throw error(500, "Failed to delete speaker");
		}
	},
	startRound: async ({ request, params, locals }) => {
		const result = await parseForm(request, startRoundSchema);

		if (!result.success) {
			throw error(400, "Invalid form data");
		}

		const { speakerId, questionId } = result.output;

		const [speaker, question] = await Promise.all([
			getSpeakerById(speakerId),
			getQuestionById(questionId)
		]);

		if (!speaker) {
			throw error(404, "Speaker not found");
		}

		if (!question) {
			throw error(404, "Question not found");
		}

		locals.projectorService.startRound(
			params.session,
			speaker.id,
			speaker.name,
			question.id,
			question.content
		);
	},
	cancelRound: async ({ params, locals }) => {
		locals.projectorService.cancelRound(params.session);
	},
	setTheme: async ({ request, params, locals }) => {
		const result = await parseForm(request, setThemeSchema);

		if (!result.success) {
			throw error(400, "Invalid form data");
		}

		locals.projectorService.setTheme(params.session, result.output.theme);
	},
	toggleQR: async ({ request, params, locals }) => {
		const result = await parseForm(request, toggleQRSchema);

		if (!result.success) {
			throw error(400, "Invalid form data");
		}

		locals.projectorService.toggleQR(params.session, result.output.visible);
	}
};
