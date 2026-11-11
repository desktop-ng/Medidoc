import z from "zod";
import {
  OpenAPIRegistry,
  extendZodWithOpenApi
} from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);
import {
  GenerateReferralSchema,
  AcceptReferralSchema
} from "../validators/referral";
import {
  CreatePregnancySchema,
  UpdatePregnancySchema,
  RecordDeliverySchema
} from "../validators/pregnancy";
import {
  CreateReproductiveProfileSchema,
  UpdateReproductiveProfileSchema
} from "../validators/reproductive-profile";
import { AddChildSchema, UpdateChildSchema } from "../validators/child";

const patientIdParam = z.object({ patientId: z.uuid() });
const pregnancyIdParam = z.object({
  patientId: z.uuid(),
  pregnancyId: z.uuid()
});
const auth: { [key: string]: string[] }[] = [
  { bearerAuth: [] },
  { accessTokenCookie: [] }
];

export function registerFemHealthPaths(registry: OpenAPIRegistry) {
  // ── Shared schemas ──────────────────────────────────────────────────────────

  const ApiResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    statusCode: z.number().int(),
    data: z.any().optional()
  });

  // ── Referrals ───────────────────────────────────────────────────────────────

  const GenerateReferralRequestSchema = registry.register(
    "GenerateReferralRequest",
    GenerateReferralSchema
  );
  const AcceptReferralRequestSchema = registry.register(
    "AcceptReferralRequest",
    AcceptReferralSchema
  );

  registry.registerPath({
    method: "post",
    path: "/api/v1/patients/{patientId}/referrals",
    tags: ["Referrals"],
    summary: "Generate a referral and QR code for a patient",
    security: auth,
    request: {
      params: patientIdParam,
      body: {
        required: true,
        content: {
          "application/json": { schema: GenerateReferralRequestSchema }
        }
      }
    },
    responses: {
      201: {
        description:
          "Referral created — returns referralId, accessCode, expiresAt, qrCode (base64 PNG)",
        content: { "application/json": { schema: ApiResponseSchema } }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/referrals/verify/{code}",
    tags: ["Referrals"],
    summary:
      "Verify a referral access code and read the frozen patient snapshot",
    description:
      "Public endpoint — no authentication required. Called when a receiving facility scans the referral QR code.",
    request: {
      params: z.object({ code: z.uuid() })
    },
    responses: {
      200: {
        description: "Snapshot returned",
        content: { "application/json": { schema: ApiResponseSchema } }
      },
      400: { description: "Code expired or referral cancelled" },
      404: { description: "Invalid access code" }
    }
  });

  registry.registerPath({
    method: "patch",
    path: "/api/v1/referrals/{referralId}/accept",
    tags: ["Referrals"],
    summary: "Mark a referral as accepted by the receiving organisation",
    security: auth,
    request: {
      params: z.object({ referralId: z.uuid() }),
      body: {
        required: true,
        content: { "application/json": { schema: AcceptReferralRequestSchema } }
      }
    },
    responses: {
      200: {
        description: "Referral accepted",
        content: { "application/json": { schema: ApiResponseSchema } }
      }
    }
  });

  // ── Pregnancies ─────────────────────────────────────────────────────────────

  const CreatePregnancyRequestSchema = registry.register(
    "CreatePregnancyRequest",
    CreatePregnancySchema
  );
  const UpdatePregnancyRequestSchema = registry.register(
    "UpdatePregnancyRequest",
    UpdatePregnancySchema
  );
  const RecordDeliveryRequestSchema = registry.register(
    "RecordDeliveryRequest",
    RecordDeliverySchema
  );

  registry.registerPath({
    method: "get",
    path: "/api/v1/patients/{patientId}/pregnancies",
    tags: ["Pregnancies"],
    summary: "List all pregnancy records for a patient",
    security: auth,
    request: { params: patientIdParam },
    responses: {
      200: {
        description: "Pregnancies list",
        content: { "application/json": { schema: ApiResponseSchema } }
      }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/patients/{patientId}/pregnancies",
    tags: ["Pregnancies"],
    summary: "Open a new pregnancy record",
    security: auth,
    request: {
      params: patientIdParam,
      body: {
        required: true,
        content: {
          "application/json": { schema: CreatePregnancyRequestSchema }
        }
      }
    },
    responses: {
      201: {
        description: "Pregnancy opened",
        content: { "application/json": { schema: ApiResponseSchema } }
      },
      400: { description: "Patient already has an ongoing pregnancy" }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/patients/{patientId}/pregnancies/{pregnancyId}",
    tags: ["Pregnancies"],
    summary: "Get a single pregnancy record",
    security: auth,
    request: { params: pregnancyIdParam },
    responses: {
      200: {
        description: "Pregnancy record",
        content: { "application/json": { schema: ApiResponseSchema } }
      }
    }
  });

  registry.registerPath({
    method: "patch",
    path: "/api/v1/patients/{patientId}/pregnancies/{pregnancyId}",
    tags: ["Pregnancies"],
    summary:
      "Update pregnancy details (LMP, EDD, complications, emergency summary)",
    security: auth,
    request: {
      params: pregnancyIdParam,
      body: {
        required: true,
        content: {
          "application/json": { schema: UpdatePregnancyRequestSchema }
        }
      }
    },
    responses: {
      200: {
        description: "Pregnancy updated",
        content: { "application/json": { schema: ApiResponseSchema } }
      }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/patients/{patientId}/pregnancies/{pregnancyId}/delivery",
    tags: ["Pregnancies"],
    summary: "Record delivery outcome and close the pregnancy",
    security: auth,
    request: {
      params: pregnancyIdParam,
      body: {
        required: true,
        content: { "application/json": { schema: RecordDeliveryRequestSchema } }
      }
    },
    responses: {
      200: {
        description: "Delivery recorded",
        content: { "application/json": { schema: ApiResponseSchema } }
      }
    }
  });

  // ── Reproductive Profile ────────────────────────────────────────────────────

  const CreateReproductiveProfileRequestSchema = registry.register(
    "CreateReproductiveProfileRequest",
    CreateReproductiveProfileSchema
  );
  const UpdateReproductiveProfileRequestSchema = registry.register(
    "UpdateReproductiveProfileRequest",
    UpdateReproductiveProfileSchema
  );

  registry.registerPath({
    method: "get",
    path: "/api/v1/patients/{patientId}/reproductive-profile",
    tags: ["Reproductive Profile"],
    summary: "Get the patient's reproductive profile",
    security: auth,
    request: { params: patientIdParam },
    responses: {
      200: {
        description: "Reproductive profile",
        content: { "application/json": { schema: ApiResponseSchema } }
      }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/patients/{patientId}/reproductive-profile",
    tags: ["Reproductive Profile"],
    summary: "Create the reproductive profile (patient only, one-time setup)",
    security: auth,
    request: {
      params: patientIdParam,
      body: {
        required: true,
        content: {
          "application/json": { schema: CreateReproductiveProfileRequestSchema }
        }
      }
    },
    responses: {
      201: {
        description: "Profile created",
        content: { "application/json": { schema: ApiResponseSchema } }
      },
      400: { description: "Profile already exists" }
    }
  });

  registry.registerPath({
    method: "patch",
    path: "/api/v1/patients/{patientId}/reproductive-profile",
    tags: ["Reproductive Profile"],
    summary: "Update the reproductive profile (patient only)",
    security: auth,
    request: {
      params: patientIdParam,
      body: {
        required: true,
        content: {
          "application/json": { schema: UpdateReproductiveProfileRequestSchema }
        }
      }
    },
    responses: {
      200: {
        description: "Profile updated",
        content: { "application/json": { schema: ApiResponseSchema } }
      }
    }
  });

  // ── Children ────────────────────────────────────────────────────────────────

  const AddChildRequestSchema = registry.register(
    "AddChildRequest",
    AddChildSchema
  );
  const UpdateChildRequestSchema = registry.register(
    "UpdateChildRequest",
    UpdateChildSchema
  );

  registry.registerPath({
    method: "get",
    path: "/api/v1/patients/{patientId}/children",
    tags: ["Children"],
    summary: "List all children linked to a patient (mother)",
    security: auth,
    request: { params: patientIdParam },
    responses: {
      200: {
        description: "Children list",
        content: { "application/json": { schema: ApiResponseSchema } }
      }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/patients/{patientId}/children",
    tags: ["Children"],
    summary: "Add a newborn record linked to a pregnancy",
    security: auth,
    request: {
      params: patientIdParam,
      body: {
        required: true,
        content: { "application/json": { schema: AddChildRequestSchema } }
      }
    },
    responses: {
      201: {
        description: "Child record added",
        content: { "application/json": { schema: ApiResponseSchema } }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/patients/{patientId}/pregnancies/{pregnancyId}/children",
    tags: ["Children"],
    summary: "List children linked to a specific pregnancy",
    security: auth,
    request: { params: pregnancyIdParam },
    responses: {
      200: {
        description: "Children for pregnancy",
        content: { "application/json": { schema: ApiResponseSchema } }
      }
    }
  });

  registry.registerPath({
    method: "patch",
    path: "/api/v1/patients/{patientId}/children/{childId}",
    tags: ["Children"],
    summary: "Update a child record",
    security: auth,
    request: {
      params: z.object({ patientId: z.uuid(), childId: z.uuid() }),
      body: {
        required: true,
        content: { "application/json": { schema: UpdateChildRequestSchema } }
      }
    },
    responses: {
      200: {
        description: "Child record updated",
        content: { "application/json": { schema: ApiResponseSchema } }
      }
    }
  });
}
