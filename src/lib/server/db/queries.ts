import { count, eq, sql } from "drizzle-orm";
import db from "./index.ts";
import { questionTable, sessionTable } from "./schema.ts";

const preparedGetAllSessionsWithQuestionCount = db
	.select({
		session: sessionTable,
		questionCount: count(questionTable.id)
	})
	.from(sessionTable)
	.leftJoin(questionTable, eq(sessionTable.id, questionTable.sessionId))
	.groupBy(sessionTable.id)
	.prepare();

const preparedGetSessionById = db
	.select()
	.from(sessionTable)
	.where(eq(sessionTable.id, sql.placeholder("sessionId")))
	.prepare();

export async function getAllSessionsWithQuestionCount() {
	// Let's just hope this does not throw XD
	return await preparedGetAllSessionsWithQuestionCount.execute();
}

export async function getSessionById(sessionId: string) {
	try {
		const result = await preparedGetSessionById.execute({ sessionId });
		return result[0] ?? null;
	} catch (error) {
		console.error("Error fetching session by ID:", error);
		return null;
	}
}

export async function createSession(name: string) {
	const id = crypto.randomUUID();
	const code = Math.random().toString(36).substring(2, 8).toUpperCase();

	try {
		await db.insert(sessionTable).values({
			id,
			code,
			name,
			createdAt: new Date()
		});
		return true;
	} catch (error) {
		console.error("Error creating session:", error);
		return false;
	}
}

export async function deleteSessionById(sessionId: string) {
	try {
		await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
		return true;
	} catch (error) {
		console.error("Error deleting session:", error);
		return false;
	}
}
