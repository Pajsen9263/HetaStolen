import type { PageServerLoad } from "./$types";
import * as v from "valibot";
import { error } from "@sveltejs/kit";
import { newSessionSchema, deleteSessionSchema } from "./schemas";

export const load: PageServerLoad = async ({ locals }) => {
	const sessions = await locals.sessionService.getAllSessionsWithCounts();

	return {
		sessions
	};
};

export const actions = {
	newSession: async ({ request, locals }) => {
		const formData = Object.fromEntries(await request.formData()) as v.InferInput<
			typeof newSessionSchema
		>;

		const result = v.safeParse(newSessionSchema, formData);

		if (!result.success) {
			throw error(400, `Invalid form data`);
		}

		const name = result.output.name;

		await locals.sessionService.createSession(name);
	},
	deleteSession: async ({ request, locals }) => {
		const formData = Object.fromEntries(await request.formData()) as v.InferInput<
			typeof deleteSessionSchema
		>;

		const result = v.safeParse(deleteSessionSchema, formData);

		if (!result.success) {
			throw error(400, `Invalid form data`);
		}

		const id = result.output.id;

		const success = await locals.sessionService.deleteSessionById(id);

		if (!success) {
			throw error(500, `Failed to delete session`);
		}
	}
};
