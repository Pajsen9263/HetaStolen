import type { IAdminAuthService } from "$lib/server/services/adminAuth";

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
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
