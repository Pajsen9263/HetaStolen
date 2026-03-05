import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { joinSchema } from "$lib/schemas";
import { parseForm } from "$lib/utils";
import { getSessionByCode } from "$lib/server/db/queries";

export const load: PageServerLoad = async ({ url }) => {
	const prefillCode = url.searchParams.get("code");
	return { prefillCode };
};

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const result = await parseForm(request, joinSchema);

		if (!result.success) {
			const message = result.issues[0]?.message ?? "Invalid session code.";
			return { error: message };
		}

		const { code } = result.output;
		const session = await getSessionByCode(code);

		if (!session) {
			error(404, "Session not found. Check the code and try again.");
		}

		locals.crowdAuthService.join(session.id, cookies);

		redirect(303, `/${session.id}/ask`);
	}
};
