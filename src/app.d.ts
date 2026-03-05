import type { IAdminAuthService } from "$lib/server/services/admin-auth.service";
import type { IQuestionService } from "$lib/server/services/question.service";
import type { ISpeakerService } from "$lib/server/services/speaker.service";
import type { IProjectorService } from "$lib/server/services/projector.service";
import type { ICrowdAuthService } from "$lib/server/services/crowd-auth.service";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			requestInfo: {
				ip: string;
				userAgent: string;
			};
			isAdmin: boolean;
			adminAuthService: IAdminAuthService;
			questionService: IQuestionService;
			speakerService: ISpeakerService;
			projectorService: IProjectorService;
			crowdAuthService: ICrowdAuthService;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
