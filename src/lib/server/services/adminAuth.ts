import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import type { Cookies } from "@sveltejs/kit";

function generateSecretPassword(length: number = 12): string {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const randomValues = new Uint32Array(length);

	// Fills the array with cryptographically secure random numbers
	crypto.getRandomValues(randomValues);

	let password = "";
	for (let i = 0; i < length; i++) {
		// We use the random number to pick an index.
		// Uint32Array provides a massive range, which effectively eliminates modulo bias.
		password += characters.charAt(randomValues[i] % characters.length);
	}

	return password;
}

function generateSessionToken(): string {
	const array = new Uint8Array(32); // 256 bits
	crypto.getRandomValues(array);
	return Buffer.from(array).toString("base64url"); // or 'hex'
}

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
	isAuthenticated(ip: string, userAgent: string, cookies: Cookies): boolean;
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
		}

		this.#loggedInAdmin = null;
		console.log("This password is valid until server restart.\n");
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

		if (this.#loggedInAdmin && token && this.#loggedInAdmin.token === token) {
			this.#loggedInAdmin = null;
			cookies.delete(cookieKey, { path: "/" });
			return true;
		}

		// Even if no session exists, delete the cookie to ensure cleanup
		cookies.delete(cookieKey, { path: "/" });
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
