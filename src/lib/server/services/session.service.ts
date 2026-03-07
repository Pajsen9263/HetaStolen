import type { DatabaseService } from "./database.service.ts";

export interface ISessionService {
	getAllSessionsWithCounts(): ReturnType<DatabaseService["getAllSessionsWithCounts"]>;
	getSessionById(sessionId: string): ReturnType<DatabaseService["getSessionById"]>;
	getSessionByCode(code: string): ReturnType<DatabaseService["getSessionByCode"]>;
	getSessionWithRelations(
		sessionId: string
	): ReturnType<DatabaseService["getSessionWithRelations"]>;
	createSession(name: string): ReturnType<DatabaseService["createSession"]>;
	deleteSessionById(sessionId: string): ReturnType<DatabaseService["deleteSessionById"]>;
}

export class SessionService implements ISessionService {
	#db: DatabaseService;

	constructor(db: DatabaseService) {
		this.#db = db;
	}

	getAllSessionsWithCounts() {
		return this.#db.getAllSessionsWithCounts();
	}

	getSessionById(sessionId: string) {
		return this.#db.getSessionById(sessionId);
	}

	getSessionByCode(code: string) {
		return this.#db.getSessionByCode(code);
	}

	getSessionWithRelations(sessionId: string) {
		return this.#db.getSessionWithRelations(sessionId);
	}

	createSession(name: string) {
		return this.#db.createSession(name);
	}

	deleteSessionById(sessionId: string) {
		return this.#db.deleteSessionById(sessionId);
	}
}
