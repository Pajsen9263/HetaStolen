import { env } from "$env/dynamic/private";
import { drizzle } from "drizzle-orm/bun-sqlite";

const db = drizzle(env.DB_FILE_NAME);

try {
	db.$client.run("PRAGMA journal_mode = WAL;");
} catch (e) {
	console.error("Failed to enable WAL", e);
}

export default db;

export * from "./schema.ts";
