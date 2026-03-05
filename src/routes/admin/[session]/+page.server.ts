import { getSessionWithRelations } from "$lib/server/db/queries";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { createQuestionSchema, deleteSchema } from "./schemas";
import { parseForm } from "$lib/utils";

export const load: PageServerLoad = async ({ params }) => {
	const session = await getSessionWithRelations(params.session);

	if (!session) {
		throw error(404, "Session not found");
	}

	return {
		session
	};
};

// I should probably deal with the validation better, but I'm moving fast right now.
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
	}
};
