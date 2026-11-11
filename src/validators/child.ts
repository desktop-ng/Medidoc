import * as z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  error: "Date must be in YYYY-MM-DD format"
});

export const AddChildSchema = z.object({
  pregnancy_id: z.uuid({ error: "pregnancy_id must be a valid UUID" }),
  dob: dateString,
  full_name: z.string().optional(),
  sex: z.enum(["male", "female", "indeterminate"]).optional(),
  birth_weight_grams: z.number().int().min(0).optional(),
  apgar_score_1min: z.number().int().min(0).max(10).optional(),
  apgar_score_5min: z.number().int().min(0).max(10).optional()
});

export const UpdateChildSchema = AddChildSchema.omit({ pregnancy_id: true })
  .partial()
  .extend({
    dob: dateString.optional()
  });
