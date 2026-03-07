import * as v from "valibot";
import { fail, redirect } from "@sveltejs/kit";

const loginSchema = v.object({
	adminSecret: v.pipe(v.string(), v.minLength(1, "Password is required"))
});

export const load = async ({ locals }) => {
	if (locals.isAdmin) {
		redirect(303, "/admin");
	}
};

export const actions = {
	default: async ({ request, locals, cookies }) => {
		const formData = Object.fromEntries(await request.formData());

		const result = v.safeParse(loginSchema, formData);

		if (!result.success) {
			return fail(400, {
				error: "Password is required"
			});
		}

		const { adminSecret } = result.output;
		const { ip, userAgent } = locals.requestInfo;

		const success = locals.adminAuthService.login(adminSecret, ip, userAgent, cookies);

		if (!success) {
			return fail(401, {
				error: "Invalid password"
			});
		}

		redirect(303, "/admin");
	}
};
