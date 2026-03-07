import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createQuestionSchema } from "$lib/schemas";
import { parseForm } from "$lib/utils";
export const load: PageServerLoad = async ({ params, locals, cookies }) => {
	const session = await locals.sessionService.getSessionById(params.session);

	if (!session) {
		error(404, "Session not found.");
	}

	if (!locals.crowdAuthService.isAuthenticated(session.id, cookies)) {
		redirect(303, `/join?code=${session.code}`);
	}

	return {
		session: {
			id: session.id,
			name: session.name,
			code: session.code
		}
	};
};

export const actions: Actions = {
	logout: async ({ locals, cookies }) => {
		locals.crowdAuthService.logout(cookies);
		redirect(303, `/join`);
	},
	newQuestion: async ({ request, params, locals, cookies }) => {
		const session = await locals.sessionService.getSessionById(params.session);

		if (!session) {
			error(404, "Session not found.");
		}

		if (!locals.crowdAuthService.isAuthenticated(session.id, cookies)) {
			error(403, "Not authenticated. Please join the session first.");
		}

		const result = await parseForm(request, createQuestionSchema);

		if (!result.success) {
			const message = result.issues[0]?.message ?? "Invalid question.";
			return { error: message, success: false };
		}

		const ok = await locals.questionService.createQuestion(session.id, result.output.content);

		if (!ok) {
			return { error: "Failed to submit question. Please try again.", success: false };
		}

		return { success: true };
	}
};
