import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const dbPath = process.env.DB_FILE_NAME;

if (!dbPath) {
	throw new Error("Error: DB_FILE_NAME environment variable is not set.");
}

const db = drizzle(dbPath);

console.log(`Checking for migrations on database: ${dbPath}`);

try {
	// This will apply any pending .sql files from the drizzle folder
	migrate(db, { migrationsFolder: "./drizzle" });
	console.log("Migrations applied successfully!");
} catch (error) {
	console.error("Migration failed:", error);
	db.$client.close();
	process.exit(1);
}

db.$client.close();
