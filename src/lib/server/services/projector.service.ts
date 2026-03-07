export type ProjectorTheme = "light" | "dark" | "system";

export type ProjectorState = {
	speakerName: string | null;
	questionContent: string | null;
	timerEndTimestamp: number | null;
	theme: ProjectorTheme;
	qrVisible: boolean;
};

export type ProjectorEventType = "roundStarted" | "roundCancelled" | "themeChanged" | "qrToggled";

export type ProjectorEvent = {
	type: ProjectorEventType;
	state: ProjectorState;
};

export type ProjectorSubscriber = (event: ProjectorEvent) => void;

export interface IProjectorService {
	startRound(
		sessionId: string,
		speakerName: string,
		questionContent: string,
		durationSeconds?: number
	): void;
	cancelRound(sessionId: string): void;
	setTheme(sessionId: string, theme: ProjectorTheme): void;
	toggleQR(sessionId: string, visible: boolean): void;
	getState(sessionId: string): ProjectorState;
	subscribe(sessionId: string, callback: ProjectorSubscriber): () => void;
}

const DEFAULT_DURATION_SECONDS = 30;

const DEFAULT_STATE: Omit<
	ProjectorState,
	"speakerId" | "speakerName" | "questionId" | "questionContent" | "timerEndTimestamp"
> = {
	theme: "system",
	qrVisible: true
};

export class ProjectorService implements IProjectorService {
	#state: Map<string, ProjectorState>;
	#subscribers: Map<string, Set<ProjectorSubscriber>>;

	constructor() {
		this.#state = new Map();
		this.#subscribers = new Map();
	}

	#getOrInitState(sessionId: string): ProjectorState {
		if (!this.#state.has(sessionId)) {
			this.#state.set(sessionId, {
				speakerName: null,
				questionContent: null,
				timerEndTimestamp: null,
				...DEFAULT_STATE
			});
		}
		return this.#state.get(sessionId)!;
	}

	startRound(
		sessionId: string,
		speakerName: string,
		questionContent: string,
		durationSeconds: number = DEFAULT_DURATION_SECONDS
	): void {
		const existing = this.#getOrInitState(sessionId);
		const state: ProjectorState = {
			speakerName,
			questionContent,
			timerEndTimestamp: Date.now() + durationSeconds * 1000,
			theme: existing.theme,
			qrVisible: existing.qrVisible
		};

		this.#state.set(sessionId, state);

		this.#notifySubscribers(sessionId, {
			type: "roundStarted",
			state
		});
	}

	cancelRound(sessionId: string): void {
		const existing = this.#getOrInitState(sessionId);

		// Clear speaker/question and timer, preserve display settings
		const state: ProjectorState = {
			speakerName: null,
			questionContent: null,
			timerEndTimestamp: null,
			theme: existing.theme,
			qrVisible: existing.qrVisible
		};

		this.#state.set(sessionId, state);

		this.#notifySubscribers(sessionId, {
			type: "roundCancelled",
			state
		});
	}

	setTheme(sessionId: string, theme: ProjectorTheme): void {
		const existing = this.#getOrInitState(sessionId);
		const state: ProjectorState = { ...existing, theme };
		this.#state.set(sessionId, state);
		this.#notifySubscribers(sessionId, { type: "themeChanged", state });
	}

	toggleQR(sessionId: string, visible: boolean): void {
		const existing = this.#getOrInitState(sessionId);
		const state: ProjectorState = { ...existing, qrVisible: visible };
		this.#state.set(sessionId, state);
		this.#notifySubscribers(sessionId, { type: "qrToggled", state });
	}

	getState(sessionId: string): ProjectorState {
		return this.#getOrInitState(sessionId);
	}

	subscribe(sessionId: string, callback: ProjectorSubscriber): () => void {
		if (!this.#subscribers.has(sessionId)) {
			this.#subscribers.set(sessionId, new Set());
		}

		const subscribers = this.#subscribers.get(sessionId)!;
		subscribers.add(callback);

		return () => {
			subscribers.delete(callback);

			if (subscribers.size === 0) {
				this.#subscribers.delete(sessionId);
			}
		};
	}

	#notifySubscribers(sessionId: string, event: ProjectorEvent): void {
		const subscribers = this.#subscribers.get(sessionId);

		if (!subscribers || subscribers.size === 0) {
			return;
		}

		for (const callback of subscribers) {
			try {
				callback(event);
			} catch (error) {
				console.error("Error notifying projector subscriber:", error);
			}
		}
	}
}
