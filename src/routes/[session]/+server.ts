import type { RequestHandler } from "./$types";
import { createSSEStream } from "$lib/sse/create-stream";

export const GET: RequestHandler = ({ request, locals, params }) => {
	return createSSEStream(request, (emit) => {
		const unsubscribe = locals.projectorService.subscribe(params.session, (event) => {
			emit(event.type, JSON.stringify(event.state));
		});

		return unsubscribe;
	});
};
