import type { PageServerLoad, Actions } from "./$types";
import { createSessionSchema } from "./+page.svelte";
import * as v from "valibot";
import { getAllSessionsWithQuestionCount } from "$lib/server/db/queries";
import { error, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals: { isAdmin } }) => {
	const sessions = await getAllSessionsWithQuestionCount.execute();

	// if (!isAdmin) {
	// 	throw redirect(302, "/admin/login");
	// }

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
