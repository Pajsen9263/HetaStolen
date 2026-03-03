import { env } from "$env/dynamic/private";
import { drizzle } from "drizzle-orm/bun-sqlite";

const db = drizzle(env.DB_FILE_NAME);

export default db;

export * from "./schema.ts";
