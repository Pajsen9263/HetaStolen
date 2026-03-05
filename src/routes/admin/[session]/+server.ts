import type { RequestHandler } from "./$types";
import { createSSEStream } from "$lib/sse";
import { capitalize } from "$lib/utils";

export const GET: RequestHandler = ({ request, locals, params }) => {
	return createSSEStream(request, (emit) => {
		const unsubQs = locals.questionService.subscribe(params.session, (event) => {
			const serializedData = JSON.stringify(event.question);
			emit(`question${capitalize(event.type)}`, serializedData);
		});

		const unsubSs = locals.speakerService.subscribe(params.session, (event) => {
			const serializedData = JSON.stringify(event.speaker);
			emit(`speaker${capitalize(event.type)}`, serializedData);
		});

		return () => {
			unsubQs();
			unsubSs();
		};
	});
};
