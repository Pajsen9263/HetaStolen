import type { PageServerLoad, Actions } from "./$types";
import { createSessionSchema } from "./validation";
import * as v from "valibot";
import { getAllSessionsWithQuestionCount } from "$lib/server/db/queries";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
	const sessions = await getAllSessionsWithQuestionCount.execute();

	return {
		sessions
	};
};

type FormData = v.InferInput<typeof createSessionSchema>;

export const actions = {
	default: async ({ request, locals: { isAdmin } }) => {
		const formData = Object.fromEntries(await request.formData()) as FormData;
		// if (!isAdmin) {
		// 	throw error(403, "Unauthorized");
		// }
		console.log(formData.name);
	}
} satisfies Actions;
