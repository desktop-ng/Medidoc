import * as z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  error: "Date must be in YYYY-MM-DD format"
});

export const CreatePregnancySchema = z.object({
  booking_organization_id: z
    .uuid({ error: "booking_organization_id must be a valid UUID" })
    .optional(),
  episode_id: z.uuid({ error: "episode_id must be a valid UUID" }).optional(),
  lmp: dateString.optional(),
  edd: dateString.optional(),
  gestational_age_at_booking_weeks: z.number().int().min(0).max(45).optional()
});

export const UpdatePregnancySchema = z.object({
  lmp: dateString.optional(),
  edd: dateString.optional(),
  gestational_age_at_booking_weeks: z.number().int().min(0).max(45).optional(),
  complications: z.array(z.string()).optional(),
  emergency_summary: z.record(z.string(), z.unknown()).optional()
});

export const RecordDeliverySchema = z.object({
  outcome: z.enum(
    [
      "live_birth",
      "stillbirth",
      "miscarriage",
      "ectopic",
      "molar",
      "termination"
    ],
    {
      error:
        "outcome must be one of: live_birth, stillbirth, miscarriage, ectopic, molar, termination"
    }
  ),
  delivery_type: z
    .enum(["svd", "assisted", "cs"], {
      error: "delivery_type must be one of: svd, assisted, cs"
    })
    .optional(),
  delivered_at: dateString.optional(),
  complications: z.array(z.string()).optional()
});
