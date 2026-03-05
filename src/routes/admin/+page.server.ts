import type { PageServerLoad } from "./$types";
import * as v from "valibot";
import { createSession, deleteSessionById, getAllSessionsWithCounts } from "$lib/server/db/queries";
import { error } from "@sveltejs/kit";
import { newSessionSchema, deleteSessionSchema } from "./schemas";

export const load: PageServerLoad = async () => {
	const sessions = await getAllSessionsWithCounts();

	return {
		sessions
	};
};

export const actions = {
	newSession: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData()) as v.InferInput<
			typeof newSessionSchema
		>;

		const result = v.safeParse(newSessionSchema, formData);

		if (!result.success) {
			throw error(400, `Invalid form data`);
		}

		const name = result.output.name;

		await createSession(name);
	},
	deleteSession: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData()) as v.InferInput<
			typeof deleteSessionSchema
		>;

		const result = v.safeParse(deleteSessionSchema, formData);

		if (!result.success) {
			throw error(400, `Invalid form data`);
		}

		const id = result.output.id;

		const success = await deleteSessionById(id);

		if (!success) {
			throw error(500, `Failed to delete session`);
		}
	}
};
