import { env } from "$env/dynamic/private";
import { drizzle } from "drizzle-orm/bun-sqlite";

export * from "./schema.ts";

const db = drizzle(env.DB_FILE_NAME);

export default { db };
