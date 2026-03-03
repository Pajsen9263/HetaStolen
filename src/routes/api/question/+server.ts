import type { RequestHandler } from "../session/[session]/$types";

export const POST: RequestHandler = async ({ request }) => {
	const { sessionId } = await request.json();

	// Replace this with real database lookup
	const sessionExists = sessionId === "1234";

	if (!sessionExists) {
		return new Response(null, { status: 404 });
	}

	return new Response(null, { status: 200 });
};
