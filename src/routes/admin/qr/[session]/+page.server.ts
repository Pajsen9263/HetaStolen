import type { PageServerLoad } from "./$types";
import { getSessionWithQuestionCount } from "$lib/server/db/queries";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
	const results = await getSessionWithQuestionCount.execute({ sessionId: params.session });

	if (results.length === 0) {
		throw error(404, "Session not found");
	}

	const { session } = results[0];

	return {
		session
	};
};
