import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sessionTable = sqliteTable("session", {
	id: text().notNull().unique(),
	code: text({ length: 6 }).notNull().unique(),
	created_at: int({ mode: "timestamp_ms" }).notNull()
});

export const questionTable = sqliteTable("question", {
	id: text().notNull().unique(),
	session_id: text().references(() => sessionTable.id),
	content: text().notNull(),
	created_at: int({ mode: "timestamp_ms" }).notNull()
});
