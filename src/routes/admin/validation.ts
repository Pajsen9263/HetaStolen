import * as v from "valibot";

export const createSessionSchema = v.object({
	name: v.pipe(
		v.string(),
		v.minLength(2, "Name must be at least 2 characters long"),
		v.maxLength(20, "Name can't be longer than 20 characters")
	)
});
