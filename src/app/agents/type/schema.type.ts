import z from "zod";

export const idSchema = z.string().uuid();


export const createEmployeeSchema = z.object({
    name: z.string().trim().min(1),
    role: z.string().trim().min(1),
    avatarUrl: z.string().url().optional(),
    model: z.string().trim().min(1),
    instructions: z.string().trim().min(1),
});


export const patchSchema = z.object({
    model: z.string().trim().min(1).optional(),
    instructions: z.string().trim().min(1).optional(),
  }).refine((v) => v.model !== undefined || v.instructions !== undefined, {
    message: "Send at least one of: model, instructions",
});