import { redirect, error, type Handle } from "@sveltejs/kit";
import { AdminAuthService } from "$lib/server/services/adminAuth";

const adminAuthService = new AdminAuthService();

export const handle: Handle = async ({ event, resolve }) => {
	const userAgent = event.request.headers.get("user-agent");
	if (!userAgent) {
		throw error(400, "User-Agent header is required");
	}

	const ip = event.getClientAddress();

	// Service Injection
	event.locals.adminAuthService = adminAuthService;

	// Check authentication status
	event.locals.isAdmin = adminAuthService.isAuthenticated(ip, userAgent, event.cookies);
	event.locals.requestInfo = { ip, userAgent };

	// Protect /admin routes (except /admin/login)
	if (event.url.pathname.startsWith("/admin") && event.url.pathname !== "/admin/login") {
		if (!event.locals.isAdmin) {
			throw redirect(303, "/admin/login");
		}
	}

	return resolve(event);
};
