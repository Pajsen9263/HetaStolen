import { error, type Handle } from "@sveltejs/kit";
import { AdminAuthService } from "$lib/server/services/admin-auth.service";
import { QuestionService } from "$lib/server/services/question.service";
import { SpeakerService } from "$lib/server/services/speaker.service";

const adminAuthService = new AdminAuthService();
const questionService = new QuestionService();
const speakerService = new SpeakerService();

export const handle: Handle = async ({ event, resolve }) => {
	const userAgent = event.request.headers.get("user-agent");
	if (!userAgent) {
		throw error(400, "User-Agent header is required");
	}

	const ip = event.getClientAddress();

	// Service Injection
	event.locals.adminAuthService = adminAuthService;
	event.locals.questionService = questionService;
	event.locals.speakerService = speakerService;

	// Check authentication status
	event.locals.isAdmin = adminAuthService.isAuthenticated(ip, userAgent, event.cookies);
	event.locals.requestInfo = { ip, userAgent };

	return resolve(event);
};
