import * as v from "valibot";

export const createQuestionSchema = v.object({
	content: v.pipe(
		v.string(),
		v.minLength(2, "Question content must be at least 2 characters long."),
		v.maxLength(128, "Question content must be at most 128 characters long.")
	)
});
