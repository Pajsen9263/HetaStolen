/**
 * Creates a Server-Sent Events (SSE) response with proper event streaming.
 *
 * @param request - The incoming request (used to detect client disconnect via abort signal)
 * @param setup - Callback that receives an emit function and returns a cleanup function
 * @returns A Response object configured for SSE streaming
 *
 * @example
 * return createSSEStream(request, (emit) => {
 *   const unsubscribe = service.subscribe((data) => {
 *     emit('message', JSON.stringify(data));
 *   });
 *   return unsubscribe;
 * });
 */
export function createSSEStream(
	request: Request,
	setup: (emit: (event: string, data: string) => void) => () => void
): Response {
	const encoder = new TextEncoder();
	let cleanup: (() => void) | null = null;
	let isCleanedUp = false; // Prevent double cleanup

	const executeCleanup = () => {
		if (!isCleanedUp && cleanup) {
			isCleanedUp = true;
			cleanup();
		}
	};

	const stream = new ReadableStream({
		start(controller) {
			// Helper function to send SSE formatted messages
			const emit = (event: string, data: string) => {
				try {
					const message = `event: ${event}\ndata: ${data}\n\n`;
					controller.enqueue(encoder.encode(message));
				} catch (error) {
					console.error("Error emitting SSE event:", error);
				}
			};

			// Setup the subscription and get the cleanup function
			cleanup = setup(emit);

			// Listen for client disconnect (works on refresh, navigation, tab close)
			request.signal.addEventListener("abort", () => {
				executeCleanup();
				controller.close();
			});
		},

		cancel() {
			// Called when ReadableStream is cancelled (backup cleanup)
			executeCleanup();
		}
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive"
		}
	});
}
