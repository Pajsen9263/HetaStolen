import type { Cookies } from "@sveltejs/kit";

const COOKIE_KEY = "crowdToken";

export interface ICrowdAuthService {
	join(sessionId: string, cookies: Cookies): string;
	logout(cookies: Cookies): void;
	isAuthenticated(sessionId: string, cookies: Cookies): boolean;
	getDeviceId(cookies: Cookies): string | null;
}

export class CrowdAuthService implements ICrowdAuthService {
	/** Maps deviceId → sessionId */
	#devices: Map<string, string>;

	constructor() {
		this.#devices = new Map();
	}

	/**
	 * Register a device for the given session. Generates a new deviceId,
	 * stores the session mapping, sets the cookie, and returns the deviceId.
	 */
	join(sessionId: string, cookies: Cookies): string {
		const deviceId = crypto.randomUUID();
		this.#devices.set(deviceId, sessionId);
		cookies.set(COOKIE_KEY, deviceId, {
			httpOnly: true,
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});
		return deviceId;
	}

	/**
	 * Remove the device registration and clear the cookie.
	 */
	logout(cookies: Cookies): void {
		const deviceId = this.getDeviceId(cookies);
		if (deviceId) {
			this.#devices.delete(deviceId);
		}
		cookies.delete(COOKIE_KEY, { path: "/" });
	}

	/**
	 * Returns true if the device cookie is present and was registered
	 * for the given session.
	 */
	isAuthenticated(sessionId: string, cookies: Cookies): boolean {
		const deviceId = this.getDeviceId(cookies);
		if (!deviceId) return false;
		return this.#devices.get(deviceId) === sessionId;
	}

	/**
	 * Returns the deviceId from the cookie, or null if not present.
	 */
	getDeviceId(cookies: Cookies): string | null {
		return cookies.get(COOKIE_KEY) ?? null;
	}
}
