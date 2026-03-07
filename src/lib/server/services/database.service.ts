import { countDistinct, eq, sql } from "drizzle-orm";
import { createDatabaseConnection } from "../db/index.ts";
import { questionTable, sessionTable, speakersTable } from "../db/schema.ts";

export class DatabaseService {
	#db: ReturnType<typeof createDatabaseConnection>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	#prepared: Record<string, any>;

	constructor() {
		this.#db = createDatabaseConnection();

		this.#prepared = {
			getAllSessionsWithCounts: this.#db
				.select({
					session: sessionTable,
					questionCount: countDistinct(questionTable.id),
					speakerCount: countDistinct(speakersTable.id)
				})
				.from(sessionTable)
				.leftJoin(questionTable, eq(sessionTable.id, questionTable.sessionId))
				.leftJoin(speakersTable, eq(sessionTable.id, speakersTable.sessionId))
				.groupBy(sessionTable.id)
				.prepare(),

			getSessionById: this.#db
				.select()
				.from(sessionTable)
				.where(eq(sessionTable.id, sql.placeholder("sessionId")))
				.prepare(),

			getSessionByCode: this.#db
				.select()
				.from(sessionTable)
				.where(eq(sessionTable.code, sql.placeholder("code")))
				.prepare(),

			getSessionWithRelations: this.#db
				.select({
					session: sessionTable,
					question: questionTable,
					speaker: speakersTable
				})
				.from(sessionTable)
				.leftJoin(questionTable, eq(sessionTable.id, questionTable.sessionId))
				.leftJoin(speakersTable, eq(sessionTable.id, speakersTable.sessionId))
				.where(eq(sessionTable.id, sql.placeholder("sessionId")))
				.prepare(),

			getQuestionById: this.#db
				.select()
				.from(questionTable)
				.where(eq(questionTable.id, sql.placeholder("questionId")))
				.prepare(),

			getSpeakerById: this.#db
				.select()
				.from(speakersTable)
				.where(eq(speakersTable.id, sql.placeholder("speakerId")))
				.prepare()
		};
	}

	async getAllSessionsWithCounts() {
		try {
			return await this.#prepared.getAllSessionsWithCounts.execute();
		} catch (error) {
			console.error("Error fetching all sessions with counts:", error);
			return null;
		}
	}

	async getSessionById(sessionId: string) {
		try {
			const result = await this.#prepared.getSessionById.execute({ sessionId });
			return result[0] ?? null;
		} catch (error) {
			console.error("Error fetching session by ID:", error);
			return null;
		}
	}

	async getSessionByCode(code: string) {
		try {
			const result = await this.#prepared.getSessionByCode.execute({
				code: code.toUpperCase()
			});
			return result[0] ?? null;
		} catch (error) {
			console.error("Error fetching session by code:", error);
			return null;
		}
	}

	async getSessionWithRelations(sessionId: string) {
		try {
			const rows = await this.#prepared.getSessionWithRelations.execute({ sessionId });

			if (rows.length === 0) {
				return null;
			}

			const session = rows[0].session;
			const questions = rows
				.map((row: { question: typeof questionTable.$inferSelect | null }) => row.question)
				.filter(
					(q: typeof questionTable.$inferSelect | null): q is typeof questionTable.$inferSelect =>
						q !== null
				)
				.filter(
					(
						q: typeof questionTable.$inferSelect,
						index: number,
						self: (typeof questionTable.$inferSelect)[]
					) => q && self.findIndex((t) => t?.id === q.id) === index
				)
				.map((q: typeof questionTable.$inferSelect) => {
					const { id, content, createdAt } = q;
					return { id, content, createdAt };
				});
			const speakers = rows
				.map((row: { speaker: typeof speakersTable.$inferSelect | null }) => row.speaker)
				.filter(
					(s: typeof speakersTable.$inferSelect | null): s is typeof speakersTable.$inferSelect =>
						s !== null
				)
				.filter(
					(
						s: typeof speakersTable.$inferSelect,
						index: number,
						self: (typeof speakersTable.$inferSelect)[]
					) => s && self.findIndex((t) => t?.id === s.id) === index
				)
				.map((s: typeof speakersTable.$inferSelect) => {
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

	async createSession(name: string) {
		const id = crypto.randomUUID();
		const code = Math.random().toString(36).substring(2, 8).toUpperCase();

		try {
			await this.#db.insert(sessionTable).values({
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

	async deleteSessionById(sessionId: string) {
		try {
			await this.#db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
			return true;
		} catch (error) {
			console.error("Error deleting session:", error);
			return false;
		}
	}

	async createQuestion(sessionId: string, content: string): Promise<string | null> {
		const id = crypto.randomUUID();

		try {
			await this.#db.insert(questionTable).values({
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

	async deleteQuestionById(questionId: string) {
		try {
			await this.#db.delete(questionTable).where(eq(questionTable.id, questionId));
			return true;
		} catch (error) {
			console.error("Error deleting question:", error);
			return false;
		}
	}

	async getQuestionById(questionId: string) {
		try {
			const result = await this.#prepared.getQuestionById.execute({ questionId });
			return result[0] ?? null;
		} catch (error) {
			console.error("Error fetching question by ID:", error);
			return null;
		}
	}

	async createSpeaker(sessionId: string, name: string): Promise<string | null> {
		const id = crypto.randomUUID();

		try {
			await this.#db.insert(speakersTable).values({
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

	async deleteSpeakerById(speakerId: string) {
		try {
			await this.#db.delete(speakersTable).where(eq(speakersTable.id, speakerId));
			return true;
		} catch (error) {
			console.error("Error deleting speaker:", error);
			return false;
		}
	}

	async getSpeakerById(speakerId: string) {
		try {
			const result = await this.#prepared.getSpeakerById.execute({ speakerId });
			return result[0] ?? null;
		} catch (error) {
			console.error("Error fetching speaker by ID:", error);
			return null;
		}
	}
}
