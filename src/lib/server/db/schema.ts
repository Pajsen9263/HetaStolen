import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sessionTable = sqliteTable("session", {
	id: text().primaryKey(),
	name: text().notNull(),
	code: text({ length: 6 }).notNull().unique(),
	createdAt: int({ mode: "timestamp_ms" }).notNull()
});

export const questionTable = sqliteTable("question", {
	id: text().primaryKey(),
	content: text().notNull(),
	createdAt: int({ mode: "timestamp_ms" }).notNull(),
	sessionId: text().references(() => sessionTable.id, { onDelete: "cascade" })
});

export const speakersTable = sqliteTable("speaker", {
	id: text().primaryKey(),
	name: text().notNull(),
	sessionId: text().references(() => sessionTable.id, { onDelete: "cascade" })
});
