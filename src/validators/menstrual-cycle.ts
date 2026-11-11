import * as z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  error: "Date must be in YYYY-MM-DD format"
});

export const LogCycleSchema = z.object({
  cycle_start_date: dateString,
  cycle_end_date: dateString.optional(),
  period_start_date: dateString.optional(),
  period_end_date: dateString.optional()
});

export const UpdateCycleSchema = LogCycleSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { error: "At least one field must be provided" }
);
