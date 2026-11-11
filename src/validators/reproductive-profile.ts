import * as z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);
import { HEALTH_CONDITIONS } from "../drizzle/schemas/reproductive-profiles.schema";

const birthControlDetailsSchema = z.union([
  z.object({
    type: z.literal("combination_pill"),
    activePills: z.number().int().optional(),
    placeboPills: z.number().int().optional(),
    packWeek: z.number().int().optional(),
    packDay: z.number().int().optional(),
    brand: z.string().optional()
  }),
  z.object({
    type: z.literal("progestin_only_pill"),
    brand: z.string().optional()
  }),
  z.object({
    type: z.enum(["hormonal", "copper"]),
    brand: z.string().optional(),
    insertedAt: z.string().optional(),
    effectiveYears: z.number().optional()
  })
]);

export const CreateReproductiveProfileSchema = z.object({
  tracking_goal: z.enum(
    [
      "cycle",
      "pregnancy",
      "trying_to_conceive",
      "postpartum",
      "peri_menopause"
    ],
    { error: "Invalid tracking goal" }
  ),
  birth_control: z.enum(["pill", "iud", "none"]).optional(),
  birth_control_details: birthControlDetailsSchema.optional(),
  cycle_type: z.enum(["regular", "irregular", "unknown", "no_period"], {
    error: "Invalid cycle type"
  }),
  health_conditions: z.array(z.enum(HEALTH_CONDITIONS)).optional(),
  prior_pregnancies_count: z.number().int().min(0).optional(),
  prior_births_count: z.number().int().min(0).optional()
});

export const UpdateReproductiveProfileSchema =
  CreateReproductiveProfileSchema.partial();
