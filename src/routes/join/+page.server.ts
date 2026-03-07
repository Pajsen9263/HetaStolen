import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { joinSchema } from "$lib/schemas";
import { parseForm } from "$lib/utils";
export const load: PageServerLoad = async ({ url, cookies, locals }) => {
	const prefillCode = url.searchParams.get("code");

	if (prefillCode) {
		const session = await locals.sessionService.getSessionByCode(prefillCode);

		if (session) {
			locals.crowdAuthService.join(session.id, cookies);
			redirect(303, `/${session.id}/ask`);
		}
	}

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
		const session = await locals.sessionService.getSessionByCode(code);

		if (!session) {
			error(404, "Session not found. Check the code and try again.");
		}

		locals.crowdAuthService.join(session.id, cookies);

		redirect(303, `/${session.id}/ask`);
	}
};
