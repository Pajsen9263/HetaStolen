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
	create: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData()) as FormData;

		const result = v.safeParse(createSessionSchema, formData);

		if (!result.success) {
			throw error(400, `Invalid form data`);
		}

		const name = result.output.name;

		// Expected to call some service that creates the service. Or maybe we're lazy and just insert into the database here. But I would like a service Mr caiban.
		console.log(name);
	},
	logout: async ({ locals, cookies }) => {
		locals.adminAuthService.logout(cookies);
		throw redirect(303, "/admin/login");
	}
} satisfies Actions;
