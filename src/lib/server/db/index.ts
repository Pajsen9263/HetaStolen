import { env } from "$env/dynamic/private";
import { drizzle } from "drizzle-orm/bun-sqlite";

export function createDatabaseConnection() {
	const db = drizzle(env.DB_FILE_NAME);

	db.$client.run("PRAGMA journal_mode = WAL;");
	db.$client.run("PRAGMA foreign_keys = ON;");

	return db;
}

export * from "./schema.ts";
