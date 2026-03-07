import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.sessionService.getSessionById(params.session);

	if (!session) {
		error(404, "Session not found");
	}

	const projectorState = locals.projectorService.getState(params.session);

	return {
		session,
		projectorState
	};
};
