import * as v from "valibot";

export const createQuestionSchema = v.object({
	content: v.pipe(
		v.string(),
		v.minLength(2, "Question content must be at least 2 characters long."),
		v.maxLength(128, "Question content must be at most 128 characters long.")
	)
});

export const joinSchema = v.object({
	code: v.pipe(
		v.string(),
		v.length(6, "Session code must be exactly 6 characters."),
		v.regex(/^[A-Z0-9]+$/i, "Session code must only contain letters and numbers.")
	)
});
