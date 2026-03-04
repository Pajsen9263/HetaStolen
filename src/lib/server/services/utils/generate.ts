export function generateSecretPassword(length: number = 12): string {
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

export function generateSessionToken(): string {
	const array = new Uint8Array(32); // 256 bits
	crypto.getRandomValues(array);
	const timeNow = Date.now();
	for (let i = 0; i < array.length; i++) {
		array[i] ^= (timeNow >> (i % 4)) & 0xff; // Mix in the current time for extra uniqueness
	}
	return Buffer.from(array).toString("base64url"); // or 'hex'
}
