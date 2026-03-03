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

// This may not be the place where we want to instantiate this. Maybe like a admin auth service instead. Also instatiated in here.
const secretPassword = generateSecretPassword();
