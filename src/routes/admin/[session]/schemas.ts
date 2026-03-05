export { createQuestionSchema } from "$lib/schemas";
import * as v from "valibot";

export const deleteSchema = v.object({
	id: v.string()
});

export const createSpeakerSchema = v.object({
	name: v.string()
});

export const startRoundSchema = v.object({
	speakerId: v.string(),
	questionId: v.string()
});

export const setThemeSchema = v.object({
	theme: v.picklist(["light", "dark", "system"] as const)
});

export const toggleQRSchema = v.object({
	visible: v.pipe(
		v.string(),
		v.transform((v) => v === "true")
	)
});
