import { defineConfig } from "drizzle-kit";

if (!process.env.DB_FILE_NAME) {
	throw new Error("DATABASE_URL is missing in the environment");
}

export default defineConfig({
	dialect: "sqlite",
	schema: "./src/lib/server/db/schema.ts",
	casing: "camelCase",
	out: "./drizzle",
	dbCredentials: {
		url: process.env.DB_FILE_NAME
	}
});
