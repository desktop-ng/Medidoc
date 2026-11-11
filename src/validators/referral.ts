import * as z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const GenerateReferralSchema = z.object({
  pregnancy_id: z
    .uuid({ error: "pregnancy_id must be a valid UUID" })
    .optional(),
  to_organization_id: z
    .uuid({ error: "to_organization_id must be a valid UUID" })
    .optional(),
  urgency: z.enum(["routine", "urgent", "emergency"], {
    error: "urgency must be one of: routine, urgent, emergency"
  }),
  reason: z.string().min(1, { error: "reason is required" })
});

export const AcceptReferralSchema = z.object({
  receiving_org_id: z.uuid({ error: "receiving_org_id must be a valid UUID" })
});
