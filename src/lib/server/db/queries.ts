import { countDistinct, eq, sql } from "drizzle-orm";
import db from "./index.ts";
import { questionTable, sessionTable, speakersTable } from "./schema.ts";

const preparedGetAllSessionsWithCounts = db
	.select({
		session: sessionTable,
		questionCount: countDistinct(questionTable.id),
		speakerCount: countDistinct(speakersTable.id)
	})
	.from(sessionTable)
	.leftJoin(questionTable, eq(sessionTable.id, questionTable.sessionId))
	.leftJoin(speakersTable, eq(sessionTable.id, speakersTable.sessionId))
	.groupBy(sessionTable.id)
	.prepare();

const preparedGetSessionById = db
	.select()
	.from(sessionTable)
	.where(eq(sessionTable.id, sql.placeholder("sessionId")))
	.prepare();

const preparedGetSessionByCode = db
	.select()
	.from(sessionTable)
	.where(eq(sessionTable.code, sql.placeholder("code")))
	.prepare();

const preparedGetSessionWithRelations = db
	.select({
		session: sessionTable,
		question: questionTable,
		speaker: speakersTable
	})
	.from(sessionTable)
	.leftJoin(questionTable, eq(sessionTable.id, questionTable.sessionId))
	.leftJoin(speakersTable, eq(sessionTable.id, speakersTable.sessionId))
	.where(eq(sessionTable.id, sql.placeholder("sessionId")))
	.prepare();

const preparedGetQuestionById = db
	.select()
	.from(questionTable)
	.where(eq(questionTable.id, sql.placeholder("questionId")))
	.prepare();

const preparedGetSpeakerById = db
	.select()
	.from(speakersTable)
	.where(eq(speakersTable.id, sql.placeholder("speakerId")))
	.prepare();

export async function getAllSessionsWithCounts() {
	// Let's just hope this does not throw XD
	return await preparedGetAllSessionsWithCounts.execute();
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

export async function getSessionByCode(code: string) {
	try {
		const result = await preparedGetSessionByCode.execute({ code: code.toUpperCase() });
		return result[0] ?? null;
	} catch (error) {
		console.error("Error fetching session by code:", error);
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

export async function getSessionWithRelations(sessionId: string) {
	try {
		const rows = await preparedGetSessionWithRelations.execute({ sessionId });

		if (rows.length === 0) {
			return null;
		}

		// Transform the flat rows into a structured object
		const session = rows[0].session;
		const questions = rows
			.map((row) => row.question)
			.filter((q): q is NonNullable<typeof q> => q !== null)
			.filter((q, index, self) => q && self.findIndex((t) => t?.id === q.id) === index)
			.map((q) => {
				const { id, content, createdAt } = q;
				return { id, content, createdAt };
			});
		const speakers = rows
			.map((row) => row.speaker)
			.filter((s): s is NonNullable<typeof s> => s !== null)
			.filter((s, index, self) => s && self.findIndex((t) => t?.id === s.id) === index)
			.map((s) => {
				const { id, name } = s;
				return { id, name };
			});

		return {
			...session,
			questions,
			speakers
		};
	} catch (error) {
		console.error("Error fetching session with relations:", error);
		return null;
	}
}

export async function createQuestion(sessionId: string, content: string): Promise<string | null> {
	const id = crypto.randomUUID();

	try {
		await db.insert(questionTable).values({
			id,
			sessionId,
			content,
			createdAt: new Date()
		});
		return id;
	} catch (error) {
		console.error("Error creating question:", error);
		return null;
	}
}

export async function deleteQuestionById(questionId: string) {
	try {
		await db.delete(questionTable).where(eq(questionTable.id, questionId));
		return true;
	} catch (error) {
		console.error("Error deleting question:", error);
		return false;
	}
}

export async function createSpeaker(sessionId: string, name: string): Promise<string | null> {
	const id = crypto.randomUUID();

	try {
		await db.insert(speakersTable).values({
			id,
			sessionId,
			name
		});

		return id;
	} catch (error) {
		console.error("Error creating speaker:", error);
		return null;
	}
}

export async function deleteSpeakerById(speakerId: string) {
	try {
		await db.delete(speakersTable).where(eq(speakersTable.id, speakerId));
		return true;
	} catch (error) {
		console.error("Error deleting speaker:", error);
		return false;
	}
}

export async function getQuestionById(questionId: string) {
	try {
		const result = await preparedGetQuestionById.execute({ questionId });
		return result[0] ?? null;
	} catch (error) {
		console.error("Error fetching question by ID:", error);
		return null;
	}
}

export async function getSpeakerById(speakerId: string) {
	try {
		const result = await preparedGetSpeakerById.execute({ speakerId });
		return result[0] ?? null;
	} catch (error) {
		console.error("Error fetching speaker by ID:", error);
		return null;
	}
}
