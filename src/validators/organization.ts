import * as z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);
import { nameSchema, emailSchema, passwordSchema } from "./auth";

export const CreateAdminSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema
});

export const CreatePractitionerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema
});

export type CreateAdminType = z.infer<typeof CreateAdminSchema>;
export type CreatePractitionerType = z.infer<typeof CreatePractitionerSchema>;
