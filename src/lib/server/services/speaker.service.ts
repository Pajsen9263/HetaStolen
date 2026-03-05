import {
	createSpeaker as dbCreateSpeaker,
	deleteSpeakerById,
	getSpeakerById
} from "../db/queries.ts";

export type Speaker = {
	id: string;
	name: string;
};

export type SpeakerEventType = "created" | "deleted";

export type SpeakerEvent = {
	type: SpeakerEventType;
	speaker: Speaker;
};

export type SpeakerSubscriber = (event: SpeakerEvent) => void;

export interface ISpeakerService {
	createSpeaker(sessionId: string, name: string): Promise<boolean>;
	deleteSpeaker(speakerId: string): Promise<boolean>;
	subscribe(sessionId: string, callback: SpeakerSubscriber): () => void;
}

export class SpeakerService implements ISpeakerService {
	#subscribers: Map<string, Set<SpeakerSubscriber>>;

	constructor() {
		this.#subscribers = new Map();
	}

	async createSpeaker(sessionId: string, name: string): Promise<boolean> {
		try {
			const id = await dbCreateSpeaker(sessionId, name);

			if (!id) {
				return false;
			}

			const speaker: Speaker = {
				id,
				name
			};

			// Notify subscribers about the new speaker
			this.#notifySubscribers(sessionId, {
				type: "created",
				speaker
			});

			return true;
		} catch (error) {
			console.error("Error in SpeakerService.createSpeaker:", error);
			return false;
		}
	}

	async deleteSpeaker(speakerId: string): Promise<boolean> {
		try {
			// Fetch the speaker before deleting to get sessionId and full data
			const speaker = await getSpeakerById(speakerId);

			if (!speaker || !speaker.sessionId) {
				console.error("Speaker not found or missing sessionId:", speakerId);
				return false;
			}

			// Delete the speaker
			const success = await deleteSpeakerById(speakerId);

			if (success) {
				// Notify subscribers about the deletion
				this.#notifySubscribers(speaker.sessionId, {
					type: "deleted",
					speaker: {
						id: speaker.id,
						name: speaker.name
					}
				});
			}

			return success;
		} catch (error) {
			console.error("Error in SpeakerService.deleteSpeaker:", error);
			return false;
		}
	}

	subscribe(sessionId: string, callback: SpeakerSubscriber): () => void {
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

	#notifySubscribers(sessionId: string, event: SpeakerEvent): void {
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
