import { error, type Handle } from "@sveltejs/kit";
import { AdminAuthService } from "$lib/server/services/admin-auth.service";
import { QuestionService } from "$lib/server/services/question.service";
import { SpeakerService } from "$lib/server/services/speaker.service";
import { ProjectorService } from "$lib/server/services/projector.service";
import { CrowdAuthService } from "$lib/server/services/crowd-auth.service";

const adminAuthService = new AdminAuthService();
const questionService = new QuestionService();
const speakerService = new SpeakerService();
const projectorService = new ProjectorService();
const crowdAuthService = new CrowdAuthService();

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
	event.locals.projectorService = projectorService;
	event.locals.crowdAuthService = crowdAuthService;

	// Check authentication status
	event.locals.isAdmin = adminAuthService.isAuthenticated(ip, userAgent, event.cookies);
	event.locals.requestInfo = { ip, userAgent };

	return resolve(event);
};
