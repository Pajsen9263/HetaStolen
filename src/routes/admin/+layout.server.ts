import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Allow login page
	if (url.pathname === "/admin/login") {
		return {};
	}

	// Protect all other admin routes
	if (!locals.isAdmin) {
		redirect(303, "/admin/login");
	}

	return {};
};
