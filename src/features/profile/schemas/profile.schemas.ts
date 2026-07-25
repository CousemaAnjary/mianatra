import { z } from "zod";

const nullableTrimmedText = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .optional();

export const profileInputSchema = z.object({
  displayName: z.string().trim().min(1),
  age: z.number().int(),
  grade: z.string().trim().min(1),
  series: nullableTrimmedText,
  schoolName: nullableTrimmedText,
});

export const profilePatchSchema = profileInputSchema.partial();

export type ProfileInput = z.input<typeof profileInputSchema>;
export type ProfilePatch = z.input<typeof profilePatchSchema>;
