export { createQuestionSchema } from "$lib/schemas";
import * as v from "valibot";

export const deleteSchema = v.object({
	id: v.string()
});

export const createSpeakerSchema = v.object({
	name: v.string()
});
