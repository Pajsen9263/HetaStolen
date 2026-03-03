import type { PageServerLoad, Actions } from "./$types";
import { createSessionSchema } from "./+page.svelte";
import * as v from "valibot";
import { createSession, getAllSessionsWithQuestionCount } from "$lib/server/db/queries";
import { error, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
	const sessions = await getAllSessionsWithQuestionCount();

	return {
		sessions
	};
};

type FormData = v.InferInput<typeof createSessionSchema>;

export const actions = {
	create: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData()) as FormData;

		const result = v.safeParse(createSessionSchema, formData);

		if (!result.success) {
			throw error(400, `Invalid form data`);
		}

		const name = result.output.name;

		await createSession(name);
	},
	// This is only a temporary logout action, will need to rethink this.
	logout: async ({ locals, cookies }) => {
		locals.adminAuthService.logout(cookies);
		throw redirect(303, "/admin/login");
	}
} satisfies Actions;
