import * as v from "valibot";

export const newSessionSchema = v.object({
	name: v.pipe(
		v.string(),
		v.minLength(1, "Name must be at least 2 characters long"),
		v.maxLength(64, "Name can't be longer than 64 characters"),
		v.trim()
	)
});

export const deleteSessionSchema = v.object({
	id: v.string()
});
