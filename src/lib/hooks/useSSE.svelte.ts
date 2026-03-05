import { browser } from "$app/environment";
import { onDestroy } from "svelte";

interface SSEEventMap {
	[eventName: string]: (data: any) => void;
}

export function useSSE<T extends SSEEventMap>(url: string, eventHandlers: T) {
	if (!browser) return;

	const evSource = new EventSource(url);

	// Register all event handlers
	Object.entries(eventHandlers).forEach(([eventName, handler]) => {
		evSource.addEventListener(eventName, (event) => {
			try {
				const data = JSON.parse(event.data);
				handler(data);
			} catch (error) {
				console.error(`Error parsing ${eventName} event:`, error);
			}
		});
	});

	evSource.onerror = (error) => {
		console.error("EventSource error:", error);
	};

	onDestroy(() => {
		evSource.close();
	});

	return evSource;
}
