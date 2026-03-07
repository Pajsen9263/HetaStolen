import { building } from "$app/environment";
import { error, type Handle } from "@sveltejs/kit";
import { DatabaseService } from "$lib/server/services/database.service";
import { AdminAuthService } from "$lib/server/services/admin-auth.service";
import { QuestionService } from "$lib/server/services/question.service";
import { SpeakerService } from "$lib/server/services/speaker.service";
import { ProjectorService } from "$lib/server/services/projector.service";
import { CrowdAuthService } from "$lib/server/services/crowd-auth.service";
import { SessionService } from "$lib/server/services/session.service";

let databaseService: DatabaseService;
let adminAuthService: AdminAuthService;
let sessionService: SessionService;
let questionService: QuestionService;
let speakerService: SpeakerService;
let projectorService: ProjectorService;
let crowdAuthService: CrowdAuthService;

if (!building) {
	databaseService = new DatabaseService();
	adminAuthService = new AdminAuthService();
	sessionService = new SessionService(databaseService);
	questionService = new QuestionService(databaseService);
	speakerService = new SpeakerService(databaseService);
	projectorService = new ProjectorService();
	crowdAuthService = new CrowdAuthService();
}

export const handle: Handle = async ({ event, resolve }) => {
	const userAgent = event.request.headers.get("user-agent");
	if (!userAgent) {
		error(400, "User-Agent header is required");
	}

	const ip = event.getClientAddress();

	// Service Injection
	event.locals.adminAuthService = adminAuthService;
	event.locals.sessionService = sessionService;
	event.locals.questionService = questionService;
	event.locals.speakerService = speakerService;
	event.locals.projectorService = projectorService;
	event.locals.crowdAuthService = crowdAuthService;

	// Check authentication status
	event.locals.isAdmin = adminAuthService.isAuthenticated(ip, userAgent, event.cookies);
	event.locals.requestInfo = { ip, userAgent };

	return resolve(event);
};
