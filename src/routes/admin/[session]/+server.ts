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

		const unsubPs = locals.projectorService.subscribe(params.session, (event) => {
			if (event.type === "roundStarted" || event.type === "roundCancelled") {
				// Only emit the timer-relevant part of the state to the admin dashboard
				emit("timerUpdate", JSON.stringify({ timerEndTimestamp: event.state.timerEndTimestamp }));
			} else if (event.type === "themeChanged") {
				emit("themeChanged", JSON.stringify({ theme: event.state.theme }));
			} else if (event.type === "qrToggled") {
				emit("qrToggled", JSON.stringify({ qrVisible: event.state.qrVisible }));
			}
		});

		return () => {
			unsubQs();
			unsubSs();
			unsubPs();
		};
	});
};
