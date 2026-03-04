import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import type { Cookies } from "@sveltejs/kit";
import { generateSecretPassword, generateSessionToken } from "./utils/generate";

const cookieKey = "adminToken";

function getTokenFromCookies(cookies: Cookies): string | null {
	return cookies.get(cookieKey) || null;
}

type Admin = {
	token: string;
	ip: string;
	userAgent: string;
};

export interface IAdminAuthService {
	login(password: string, ip: string, userAgent: string, cookies: Cookies): boolean;
	logout(cookies: Cookies): boolean;
}

export class AdminAuthService implements IAdminAuthService {
	#secretPassword: string;

	#loggedInAdmin: Admin | null;

	constructor() {
		// In development, use env variable if set, otherwise generate random
		// In production, always generate random
		if (dev && env.DEV_ADMIN_PASSWORD) {
			this.#secretPassword = env.DEV_ADMIN_PASSWORD;
			console.log("\n🔐 Using DEV_ADMIN_PASSWORD from environment");
		} else {
			this.#secretPassword = generateSecretPassword(16);
			console.log("\n🔐 Admin Password:", this.#secretPassword);
			console.log("This password is valid until server restart.\n");
		}

		this.#loggedInAdmin = null;
	}

	login(password: string, ip: string, userAgent: string, cookies: Cookies): boolean {
		if (password === this.#secretPassword) {
			const token = generateSessionToken();
			this.#loggedInAdmin = { token, ip, userAgent };
			cookies.set(cookieKey, token, {
				httpOnly: true,
				sameSite: "strict",
				path: "/"
			});
			return true;
		}

		return false;
	}

	logout(cookies: Cookies): boolean {
		const token = getTokenFromCookies(cookies);

		cookies.delete(cookieKey, { path: "/" });

		if (this.#loggedInAdmin && token && this.#loggedInAdmin.token === token) {
			this.#loggedInAdmin = null;
			return true;
		}

		return false;
	}

	isAuthenticated(ip: string, userAgent: string, cookies: Cookies): boolean {
		const token = getTokenFromCookies(cookies);

		if (!this.#loggedInAdmin) return false;

		return (
			this.#loggedInAdmin.token === token &&
			this.#loggedInAdmin.ip === ip &&
			this.#loggedInAdmin.userAgent === userAgent
		);
	}
}
