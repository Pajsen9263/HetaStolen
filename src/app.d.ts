import type { IAdminAuthService } from "$lib/server/services/admin-auth.service";
import type { IQuestionService } from "$lib/server/services/question.service";
import type { ISpeakerService } from "$lib/server/services/speaker.service";

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
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
