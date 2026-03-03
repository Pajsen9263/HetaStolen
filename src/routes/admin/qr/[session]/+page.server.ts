import type { PageServerLoad } from "./$types";
import { getSessionById } from "$lib/server/db/queries";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
	const session = await getSessionById(params.session);
	if (!session) {
		throw error(404, "Session not found");
	}

	return {
		session
	};
};
