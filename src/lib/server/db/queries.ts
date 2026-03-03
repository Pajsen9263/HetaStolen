import { count, eq, sql } from "drizzle-orm";
import db from "./index.ts";
import { questionTable, sessionTable } from "./schema.ts";

export const getSessionWithQuestionCount = db
	.select({
		session: sessionTable,
		questionCount: count(questionTable.id)
	})
	.from(sessionTable)
	.leftJoin(questionTable, eq(sessionTable.id, questionTable.sessionId))
	.where(eq(sessionTable.id, sql.placeholder("sessionId")))
	.groupBy(sessionTable.id)
	.prepare();

export const getAllSessionsWithQuestionCount = db
	.select({
		session: sessionTable,
		questionCount: count(questionTable.id)
	})
	.from(sessionTable)
	.leftJoin(questionTable, eq(sessionTable.id, questionTable.sessionId))
	.groupBy(sessionTable.id)
	.prepare();
