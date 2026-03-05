import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as v from "valibot";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export type MaybeNull<T> = {
	[K in keyof T]: T[K] | undefined;
};

export function capitalize(string: string): string {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export async function parseForm<TSchema extends Parameters<typeof v.safeParse>[0]>(
	request: Request,
	schema: TSchema
) {
	const formData = Object.fromEntries(await request.formData());
	return v.safeParse(schema, formData);
}
