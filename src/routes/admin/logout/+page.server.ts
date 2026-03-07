import { redirect } from "@sveltejs/kit";

export const load = async ({ cookies, locals }) => {
	locals.adminAuthService.logout(cookies);
	redirect(302, "/admin/login");
};
