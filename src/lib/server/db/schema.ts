import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sessionTable = sqliteTable("session", {
	id: text().notNull().unique(),
	name: text().notNull(),
	code: text({ length: 6 }).notNull().unique(),
	createdAt: int({ mode: "timestamp_ms" }).notNull()
});

export const questionTable = sqliteTable("question", {
	id: text().notNull().unique(),
	sessionId: text().references(() => sessionTable.id),
	content: text().notNull(),
	createdAt: int({ mode: "timestamp_ms" }).notNull()
});

export const speakersTable = sqliteTable("speaker", {
	id: text().notNull().unique(),
	name: text().notNull(),
	party: text().notNull(),
	imageURL: text(),
	sessionId: text().references(() => sessionTable.id)
});
