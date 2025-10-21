import { z } from "zod";

const firestoreTimestampSchema = z.preprocess((value) => {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number") {
    return value;
  }
  if (
    value &&
    typeof value === "object" &&
    "seconds" in value &&
    typeof (value as { seconds: unknown }).seconds === "number" &&
    "nanoseconds" in value &&
    typeof (value as { nanoseconds: unknown }).nanoseconds === "number"
  ) {
    const { seconds, nanoseconds } = value as { seconds: number; nanoseconds: number };
    return seconds * 1000 + Math.floor(nanoseconds / 1_000_000);
  }
  return value;
}, z.number().int().nonnegative());

export const canvasObjectTypeSchema = z.enum(["rect", "circle", "text"]);
export type CanvasObjectType = z.infer<typeof canvasObjectTypeSchema>;

export const canvasObjectPropsSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().optional(),
  h: z.number().optional(),
  r: z.number().optional(),
  rotation: z.number().optional(),
  text: z.string().optional(),
  fill: z.string().optional(),
});
export type CanvasObjectProps = z.infer<typeof canvasObjectPropsSchema>;

export const canvasObjectSchema = z.object({
  id: z.string(),
  type: canvasObjectTypeSchema,
  props: canvasObjectPropsSchema,
  v: z.number().int().nonnegative(),
  updatedBy: z.string(),
  updatedAt: z.number().int().nonnegative(),
});
export type CanvasObject = z.infer<typeof canvasObjectSchema>;

export const canvasObjectPatchSchema = canvasObjectPropsSchema.partial();
export type CanvasObjectPatch = z.infer<typeof canvasObjectPatchSchema>;

export const canvasObjectDocSchema = canvasObjectSchema.extend({
  updatedAt: firestoreTimestampSchema,
}).partial({ id: true });

export class CanvasObjectValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CanvasObjectValidationError";
  }
}

export function parseCanvasObjectDoc(id: string, data: unknown): CanvasObject {
  const result = canvasObjectDocSchema.safeParse({ ...data, id });
  if (!result.success) {
    throw new CanvasObjectValidationError(
      `Invalid canvas object data for ${id}: ${result.error.message}`
    );
  }
  return result.data;
}


