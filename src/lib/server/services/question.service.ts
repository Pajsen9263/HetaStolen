import {
	createQuestion as dbCreateQuestion,
	deleteQuestionById,
	getQuestionById
} from "../db/queries.ts";

export type Question = {
	id: string;
	content: string;
	createdAt: Date;
};

export type QuestionEventType = "created" | "deleted";

export type QuestionEvent = {
	type: QuestionEventType;
	question: Question;
};

export type QuestionSubscriber = (event: QuestionEvent) => void;

export interface IQuestionService {
	createQuestion(sessionId: string, content: string): Promise<boolean>;
	deleteQuestion(questionId: string): Promise<boolean>;
	subscribe(sessionId: string, callback: QuestionSubscriber): () => void;
}

export class QuestionService implements IQuestionService {
	#subscribers: Map<string, Set<QuestionSubscriber>>;

	constructor() {
		this.#subscribers = new Map();
	}

	async createQuestion(sessionId: string, content: string): Promise<boolean> {
		const createdAt = new Date();

		try {
			const id = await dbCreateQuestion(sessionId, content);

			if (!id) {
				return false;
			}

			// Construct the question object with the data we know
			const question: Question = {
				id,
				content,
				createdAt
			};

			// Notify subscribers about the new question
			this.#notifySubscribers(sessionId, {
				type: "created",
				question
			});

			return true;
		} catch (error) {
			console.error("Error in QuestionService.createQuestion:", error);
			return false;
		}
	}

	async deleteQuestion(questionId: string): Promise<boolean> {
		try {
			// Fetch the question before deleting to get sessionId and full data
			const question = await getQuestionById(questionId);

			if (!question || !question.sessionId) {
				console.error("Question not found or missing sessionId:", questionId);
				return false;
			}

			// Delete the question
			const success = await deleteQuestionById(questionId);

			if (success) {
				// Notify subscribers about the deletion
				this.#notifySubscribers(question.sessionId, {
					type: "deleted",
					question: {
						id: question.id,
						content: question.content,
						createdAt: question.createdAt
					}
				});
			}

			return success;
		} catch (error) {
			console.error("Error in QuestionService.deleteQuestion:", error);
			return false;
		}
	}

	subscribe(sessionId: string, callback: QuestionSubscriber): () => void {
		// Get or create the subscriber set for this sessionId
		if (!this.#subscribers.has(sessionId)) {
			this.#subscribers.set(sessionId, new Set());
		}

		const subscribers = this.#subscribers.get(sessionId)!;
		subscribers.add(callback);

		// Return unsubscribe function
		return () => {
			subscribers.delete(callback);

			// Clean up empty sets to prevent memory leaks
			if (subscribers.size === 0) {
				this.#subscribers.delete(sessionId);
			}
		};
	}

	#notifySubscribers(sessionId: string, event: QuestionEvent): void {
		const subscribers = this.#subscribers.get(sessionId);

		if (!subscribers || subscribers.size === 0) {
			return;
		}

		// Notify all subscribers, catching errors to prevent one bad subscriber
		// from breaking the notification chain
		for (const callback of subscribers) {
			try {
				callback(event);
			} catch (error) {
				console.error("Error notifying subscriber:", error);
				// Continue notifying other subscribers
			}
		}
	}
}
