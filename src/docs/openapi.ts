import z from "zod";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi
} from "@asteasolutions/zod-to-openapi";
import {
  ChangePasswordSchema,
  DeleteAccountSchema,
  RefreshSchema,
  RegisterOrganizationSchema,
  RegisterPatientSchema,
  RequestOtpSchema,
  ResetPasswordSchema,
  SigninSchema,
  SignupSchema,
  UpdateProfileSchema,
  VerifyOtpSchema
} from "../validators/auth";
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
import {
  CreateAdminSchema,
  CreatePractitionerSchema
} from "../validators/organization";
import {
  UpdatePatientProfileSchema,
  OrganizationAccessSchema,
  NewEpisodeLabelSchema,
  NewSummarySchema,
  NewClinicalEntrySchema
} from "../validators/patient";
import { CreateAppointmentSchema } from "../validators/appointment";
import { CreateInvoiceSchema } from "../validators/invoice";
import { CreateConsentFormSchema } from "../validators/consent-form";
import {
  LogCycleSchema,
  UpdateCycleSchema
} from "../validators/menstrual-cycle";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// ── Shared params & security ────────────────────────────────────────────────

const auth = [{ bearerAuth: [] }, { accessTokenCookie: [] }] as {
  [key: string]: string[];
}[];
const patientIdParam = z.object({ patientId: z.uuid() });
const pregnancyIdParam = z.object({
  patientId: z.uuid(),
  pregnancyId: z.uuid()
});
const orgId = z.object({ organizationId: z.uuid() });

// ── Shared response schema ──────────────────────────────────────────────────

const ApiResponseSchema = registry.register(
  "ApiResponse",
  z.object({
    success: z.boolean(),
    message: z.string(),
    statusCode: z.number().int(),
    data: z.any().optional(),
    errors: z.any().optional()
  })
);

// ── Health ──────────────────────────────────────────────────────────────────

const HealthDataSchema = registry.register(
  "HealthData",
  z.object({
    status: z.string(),
    timestamp: z.string(),
    uptime: z.number()
  })
);

const DetailedHealthDataSchema = registry.register(
  "DetailedHealthData",
  HealthDataSchema.extend({
    environment: z.string(),
    version: z.string(),
    memory: z.object({
      used: z.number(),
      total: z.number(),
      unit: z.string()
    }),
    cpu: z.object({
      usage: z.record(z.string(), z.number())
    })
  })
);

registry.registerPath({
  method: "get",
  path: "/api/v1/health",
  tags: ["Health"],
  summary: "Basic health check",
  responses: {
    200: {
      description: "Service health status",
      content: {
        "application/json": {
          schema: ApiResponseSchema.extend({ data: HealthDataSchema })
        }
      }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/health/detailed",
  tags: ["Health"],
  summary: "Detailed health check",
  responses: {
    200: {
      description: "Detailed service health status",
      content: {
        "application/json": {
          schema: ApiResponseSchema.extend({ data: DetailedHealthDataSchema })
        }
      }
    }
  }
});

// ── Auth ────────────────────────────────────────────────────────────────────

const SignupRequestSchema = registry.register("SignupRequest", SignupSchema);
const RegisterPatientRequestSchema = registry.register(
  "RegisterPatientRequest",
  RegisterPatientSchema
);
const RegisterOrganizationRequestSchema = registry.register(
  "RegisterOrganizationRequest",
  RegisterOrganizationSchema
);
const VerifyRequestSchema = registry.register("VerifyRequest", VerifyOtpSchema);
const LoginRequestSchema = registry.register("LoginRequest", SigninSchema);
const UpdateProfileRequestSchema = registry.register(
  "UpdateProfileRequest",
  UpdateProfileSchema
);
const RefreshTokenRequestSchema = registry.register(
  "RefreshTokenRequest",
  RefreshSchema
);
const ForgotPasswordRequestSchema = registry.register(
  "ForgotPasswordRequest",
  RequestOtpSchema.pick({ email: true })
);
const VerifyResetOtpRequestSchema = registry.register(
  "VerifyResetOtpRequest",
  VerifyOtpSchema
);
const ResetPasswordRequestSchema = registry.register(
  "ResetPasswordRequest",
  ResetPasswordSchema
);
const ChangePasswordRequestSchema = registry.register(
  "ChangePasswordRequest",
  ChangePasswordSchema
);
const RequestDeleteAccountSchema = registry.register(
  "RequestDeleteAccountRequest",
  SigninSchema.pick({ password: true })
);
const DeleteAccountRequestSchema = registry.register(
  "DeleteAccountRequest",
  DeleteAccountSchema
);

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/signup",
  tags: ["Auth"],
  summary: "Register a user account",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: SignupRequestSchema } }
    }
  },
  responses: {
    200: {
      description: "Signup succeeded",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/register/patient",
  tags: ["Auth"],
  summary: "Register a patient account",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: RegisterPatientRequestSchema } }
    }
  },
  responses: {
    200: {
      description: "Patient registration succeeded",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/register/organization",
  tags: ["Auth"],
  summary: "Register an organization account",
  request: {
    body: {
      required: true,
      content: {
        "application/json": { schema: RegisterOrganizationRequestSchema }
      }
    }
  },
  responses: {
    200: {
      description: "Organization registration succeeded",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/verify",
  tags: ["Auth"],
  summary: "Verify a user account with OTP",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: VerifyRequestSchema } }
    }
  },
  responses: {
    200: {
      description: "User verification succeeded",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/login",
  tags: ["Auth"],
  summary: "Sign in a user",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: LoginRequestSchema } }
    }
  },
  responses: {
    200: {
      description: "Login succeeded",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/auth/profile",
  tags: ["Auth"],
  summary: "Fetch the currently signed-in user profile",
  security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
  responses: {
    200: {
      description: "Profile fetched",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/auth/profile",
  tags: ["Auth"],
  summary: "Update the signed-in user profile",
  security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: UpdateProfileRequestSchema } }
    }
  },
  responses: {
    200: {
      description: "Profile updated",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/refresh",
  tags: ["Auth"],
  summary: "Refresh access and refresh tokens",
  security: [{ refreshTokenCookie: [] }],
  request: {
    body: {
      required: false,
      content: { "application/json": { schema: RefreshTokenRequestSchema } }
    }
  },
  responses: {
    200: {
      description: "Tokens refreshed",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/forgot-password",
  tags: ["Auth"],
  summary: "Request password reset OTP",
  request: {
    body: {
      required: true,
      content: {
        "application/json": { schema: ForgotPasswordRequestSchema }
      }
    }
  },
  responses: {
    200: {
      description: "OTP requested",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/verify-reset-otp",
  tags: ["Auth"],
  summary: "Verify reset OTP",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: VerifyResetOtpRequestSchema } }
    }
  },
  responses: {
    200: {
      description: "Reset OTP verified",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/reset-password",
  tags: ["Auth"],
  summary: "Reset password",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: ResetPasswordRequestSchema } }
    }
  },
  responses: {
    200: {
      description: "Password reset succeeded",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/change-password",
  tags: ["Auth"],
  summary: "Change password",
  security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: ChangePasswordRequestSchema } }
    }
  },
  responses: {
    200: {
      description: "Password changed",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/account/request-delete",
  tags: ["Auth"],
  summary: "Request account deletion",
  security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: RequestDeleteAccountSchema } }
    }
  },
  responses: {
    200: {
      description: "Delete request accepted",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "delete",
  path: "/api/v1/auth/account/delete",
  tags: ["Auth"],
  summary: "Delete account",
  security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: DeleteAccountRequestSchema } }
    }
  },
  responses: {
    200: {
      description: "Account deleted",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "delete",
  path: "/api/v1/auth/sessions/{sessionId}",
  tags: ["Auth"],
  summary: "Delete a specific session",
  security: [{ bearerAuth: [] }, { accessTokenCookie: [] }],
  request: {
    params: z.object({ sessionId: z.string().min(1) })
  },
  responses: {
    200: {
      description: "Session deleted",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

// ── OAuth ───────────────────────────────────────────────────────────────────

registry.registerPath({
  method: "get",
  path: "/auth/github",
  tags: ["OAuth"],
  summary: "Start GitHub OAuth flow",
  responses: { 302: { description: "Redirect to GitHub" } }
});

registry.registerPath({
  method: "get",
  path: "/auth/github/callback",
  tags: ["OAuth"],
  summary: "GitHub OAuth callback",
  responses: { 200: { description: "OAuth callback handled" } }
});

registry.registerPath({
  method: "get",
  path: "/auth/google",
  tags: ["OAuth"],
  summary: "Start Google OAuth flow",
  responses: { 302: { description: "Redirect to Google" } }
});

registry.registerPath({
  method: "get",
  path: "/auth/google/callback",
  tags: ["OAuth"],
  summary: "Google OAuth callback",
  responses: { 200: { description: "OAuth callback handled" } }
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
  summary: "Verify a referral access code and read the frozen patient snapshot",
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

// ── Patients ────────────────────────────────────────────────────────────────

const UpdatePatientProfileReq = registry.register(
  "UpdatePatientProfileRequest",
  UpdatePatientProfileSchema
);
const OrgAccessReq = registry.register(
  "OrganizationAccessRequest",
  OrganizationAccessSchema
);
const NewEpisodeReq = registry.register(
  "NewEpisodeRequest",
  NewEpisodeLabelSchema
);
const NewSummaryReq = registry.register("NewSummaryRequest", NewSummarySchema);
const NewClinicalEntryReq = registry.register(
  "NewClinicalEntryRequest",
  NewClinicalEntrySchema
);

registry.registerPath({
  method: "get",
  path: "/api/v1/patients/me",
  tags: ["Patients"],
  summary: "Get own patient profile",
  security: auth,
  responses: {
    200: {
      description: "Patient profile",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/patients/{patientId}",
  tags: ["Patients"],
  summary: "Get patient by ID",
  security: auth,
  request: { params: patientIdParam },
  responses: {
    200: {
      description: "Patient profile",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/patients/{patientId}",
  tags: ["Patients"],
  summary: "Update patient profile",
  security: auth,
  request: {
    params: patientIdParam,
    body: {
      required: true,
      content: { "application/json": { schema: UpdatePatientProfileReq } }
    }
  },
  responses: {
    200: {
      description: "Profile updated",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/patients/{patientId}/organization-access",
  tags: ["Patients"],
  summary: "List organisation access grants for a patient",
  security: auth,
  request: { params: patientIdParam },
  responses: {
    200: {
      description: "Access list",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/patients/{patientId}/organization-access",
  tags: ["Patients"],
  summary: "Grant an organisation access to patient records",
  security: auth,
  request: {
    params: patientIdParam,
    body: {
      required: true,
      content: { "application/json": { schema: OrgAccessReq } }
    }
  },
  responses: {
    201: {
      description: "Access granted",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/patients/{patientId}/organization-access/{accessId}/revoke",
  tags: ["Patients"],
  summary: "Revoke an organisation's access",
  security: auth,
  request: {
    params: z.object({ patientId: z.uuid(), accessId: z.uuid() })
  },
  responses: {
    200: {
      description: "Access revoked",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

// ── Records (Episodes, Summaries, Clinical Entries) ─────────────────────────

registry.registerPath({
  method: "get",
  path: "/api/v1/patients/{patientId}/episodes",
  tags: ["Records"],
  summary: "List care episodes for a patient",
  security: auth,
  request: { params: patientIdParam },
  responses: {
    200: {
      description: "Episodes list",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/patients/{patientId}/episodes",
  tags: ["Records"],
  summary: "Open a new care episode",
  security: auth,
  request: {
    params: patientIdParam,
    body: {
      required: true,
      content: { "application/json": { schema: NewEpisodeReq } }
    }
  },
  responses: {
    201: {
      description: "Episode created",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/patients/{patientId}/summaries",
  tags: ["Records"],
  summary: "List medical summaries (medications, allergies, care plan, etc.)",
  security: auth,
  request: { params: patientIdParam },
  responses: {
    200: {
      description: "Summaries",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/patients/{patientId}/summaries",
  tags: ["Records"],
  summary: "Create or update a medical summary entry",
  security: auth,
  request: {
    params: patientIdParam,
    body: {
      required: true,
      content: { "application/json": { schema: NewSummaryReq } }
    }
  },
  responses: {
    201: {
      description: "Summary created",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/patients/{patientId}/clinical-entries",
  tags: ["Records"],
  summary: "List clinical entries for a patient",
  security: auth,
  request: { params: patientIdParam },
  responses: {
    200: {
      description: "Clinical entries",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/patients/{patientId}/clinical-entries",
  tags: ["Records"],
  summary:
    "Create a clinical entry (observation, lab result, vital signs, etc.)",
  security: auth,
  request: {
    params: patientIdParam,
    body: {
      required: true,
      content: { "application/json": { schema: NewClinicalEntryReq } }
    }
  },
  responses: {
    201: {
      description: "Entry created",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

// ── Appointments ────────────────────────────────────────────────────────────

const CreateApptReq = registry.register(
  "CreateAppointmentRequest",
  CreateAppointmentSchema
);

registry.registerPath({
  method: "get",
  path: "/api/v1/patients/{patientId}/appointments",
  tags: ["Appointments"],
  summary: "List appointments for a patient",
  security: auth,
  request: { params: patientIdParam },
  responses: {
    200: {
      description: "Appointments",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/patients/{patientId}/appointments",
  tags: ["Appointments"],
  summary: "Book an appointment",
  security: auth,
  request: {
    params: patientIdParam,
    body: {
      required: true,
      content: { "application/json": { schema: CreateApptReq } }
    }
  },
  responses: {
    201: {
      description: "Appointment booked",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/patients/{patientId}/appointments/{appointmentId}/check-in",
  tags: ["Appointments"],
  summary: "Check in for an appointment",
  security: auth,
  request: {
    params: z.object({ patientId: z.uuid(), appointmentId: z.uuid() })
  },
  responses: {
    200: {
      description: "Checked in",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/patients/{patientId}/appointments/{appointmentId}/cancel",
  tags: ["Appointments"],
  summary: "Cancel an appointment",
  security: auth,
  request: {
    params: z.object({ patientId: z.uuid(), appointmentId: z.uuid() })
  },
  responses: {
    200: {
      description: "Cancelled",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

// ── Invoices & Payments ─────────────────────────────────────────────────────

const CreateInvoiceReq = registry.register(
  "CreateInvoiceRequest",
  CreateInvoiceSchema
);

registry.registerPath({
  method: "get",
  path: "/api/v1/patients/{patientId}/invoices",
  tags: ["Invoices & Payments"],
  summary: "List invoices for a patient",
  security: auth,
  request: { params: patientIdParam },
  responses: {
    200: {
      description: "Invoices",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/patients/{patientId}/invoices",
  tags: ["Invoices & Payments"],
  summary: "Create an invoice",
  security: auth,
  request: {
    params: patientIdParam,
    body: {
      required: true,
      content: { "application/json": { schema: CreateInvoiceReq } }
    }
  },
  responses: {
    201: {
      description: "Invoice created",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/patients/{patientId}/invoices/{invoiceId}/mark-paid",
  tags: ["Invoices & Payments"],
  summary: "Mark an invoice as paid",
  security: auth,
  request: {
    params: z.object({ patientId: z.uuid(), invoiceId: z.uuid() })
  },
  responses: {
    200: {
      description: "Invoice marked paid",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/patients/{patientId}/invoices/{invoiceId}/payments",
  tags: ["Invoices & Payments"],
  summary: "List payments on an invoice",
  security: auth,
  request: {
    params: z.object({ patientId: z.uuid(), invoiceId: z.uuid() })
  },
  responses: {
    200: {
      description: "Payments",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/patients/{patientId}/invoices/{invoiceId}/payments",
  tags: ["Invoices & Payments"],
  summary: "Record a payment",
  security: auth,
  request: {
    params: z.object({ patientId: z.uuid(), invoiceId: z.uuid() })
  },
  responses: {
    201: {
      description: "Payment recorded",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

// ── Consent ─────────────────────────────────────────────────────────────────

const CreateConsentReq = registry.register(
  "CreateConsentFormRequest",
  CreateConsentFormSchema
);

registry.registerPath({
  method: "get",
  path: "/api/v1/patients/{patientId}/consent-forms",
  tags: ["Consent"],
  summary: "List consent forms for a patient",
  security: auth,
  request: { params: patientIdParam },
  responses: {
    200: {
      description: "Consent forms",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/patients/{patientId}/consent-forms",
  tags: ["Consent"],
  summary: "Create a consent form (practitioner)",
  security: auth,
  request: {
    params: patientIdParam,
    body: {
      required: true,
      content: { "application/json": { schema: CreateConsentReq } }
    }
  },
  responses: {
    201: {
      description: "Consent form created",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/patients/{patientId}/consent-forms/{consentFormId}/sign",
  tags: ["Consent"],
  summary: "Patient signs a consent form",
  security: auth,
  request: {
    params: z.object({ patientId: z.uuid(), consentFormId: z.uuid() })
  },
  responses: {
    200: {
      description: "Signed",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

// ── Menstrual Cycles ────────────────────────────────────────────────────────

const LogCycleReq = registry.register("LogCycleRequest", LogCycleSchema);
const UpdateCycleReq = registry.register(
  "UpdateCycleRequest",
  UpdateCycleSchema
);

registry.registerPath({
  method: "get",
  path: "/api/v1/patients/{patientId}/cycles",
  tags: ["Menstrual Cycles"],
  summary: "List menstrual cycles for a patient",
  security: auth,
  request: { params: patientIdParam },
  responses: {
    200: {
      description: "Cycles",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/patients/{patientId}/cycles/latest",
  tags: ["Menstrual Cycles"],
  summary: "Get the most recent cycle",
  security: auth,
  request: { params: patientIdParam },
  responses: {
    200: {
      description: "Latest cycle",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/patients/{patientId}/cycles",
  tags: ["Menstrual Cycles"],
  summary: "Log a new cycle (patient only)",
  security: auth,
  request: {
    params: patientIdParam,
    body: {
      required: true,
      content: { "application/json": { schema: LogCycleReq } }
    }
  },
  responses: {
    201: {
      description: "Cycle logged",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/patients/{patientId}/cycles/{cycleId}",
  tags: ["Menstrual Cycles"],
  summary: "Update a cycle record (add end dates, period dates)",
  security: auth,
  request: {
    params: z.object({ patientId: z.uuid(), cycleId: z.uuid() }),
    body: {
      required: true,
      content: { "application/json": { schema: UpdateCycleReq } }
    }
  },
  responses: {
    200: {
      description: "Cycle updated",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

// ── Organisation Management ─────────────────────────────────────────────────

const CreateAdminReq = registry.register(
  "CreateAdminRequest",
  CreateAdminSchema
);
const CreatePractitionerReq = registry.register(
  "CreatePractitionerRequest",
  CreatePractitionerSchema
);

registry.registerPath({
  method: "get",
  path: "/api/v1/organizations",
  tags: ["Organisation Management"],
  summary: "List all organisations (platform admin only)",
  security: auth,
  responses: {
    200: {
      description: "Organisations list",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/organizations/public",
  tags: ["Organisation Management"],
  summary: "List publicly visible organisations",
  security: auth,
  responses: {
    200: {
      description: "Public organisations",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/platform/stats",
  tags: ["Organisation Management"],
  summary: "Platform-wide statistics (platform admin only)",
  security: auth,
  responses: {
    200: {
      description: "Platform stats",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/organizations/{organizationId}/verify",
  tags: ["Organisation Management"],
  summary: "Verify an organisation (platform admin)",
  security: auth,
  request: { params: orgId },
  responses: {
    200: {
      description: "Organisation verified",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/organizations/{organizationId}/suspend",
  tags: ["Organisation Management"],
  summary: "Suspend an organisation (platform admin)",
  security: auth,
  request: { params: orgId },
  responses: {
    200: {
      description: "Organisation suspended",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/organizations/{organizationId}/reinstate",
  tags: ["Organisation Management"],
  summary: "Reinstate a suspended organisation (platform admin)",
  security: auth,
  request: { params: orgId },
  responses: {
    200: {
      description: "Organisation reinstated",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/organizations/{organizationId}/admins",
  tags: ["Organisation Management"],
  summary: "List organisation admins",
  security: auth,
  request: { params: orgId },
  responses: {
    200: {
      description: "Admins",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/organizations/{organizationId}/admins",
  tags: ["Organisation Management"],
  summary: "Invite an admin to an organisation",
  security: auth,
  request: {
    params: orgId,
    body: {
      required: true,
      content: { "application/json": { schema: CreateAdminReq } }
    }
  },
  responses: {
    201: {
      description: "Admin invited",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/organizations/{organizationId}/admins/{adminId}/approve",
  tags: ["Organisation Management"],
  summary: "Approve an admin",
  security: auth,
  request: {
    params: z.object({ organizationId: z.uuid(), adminId: z.uuid() })
  },
  responses: {
    200: {
      description: "Admin approved",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/organizations/{organizationId}/practitioners",
  tags: ["Organisation Management"],
  summary: "List practitioners in an organisation",
  security: auth,
  request: { params: orgId },
  responses: {
    200: {
      description: "Practitioners",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/organizations/{organizationId}/practitioners/public",
  tags: ["Organisation Management"],
  summary: "List publicly visible practitioners",
  security: auth,
  request: { params: orgId },
  responses: {
    200: {
      description: "Public practitioners",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/organizations/{organizationId}/practitioners",
  tags: ["Organisation Management"],
  summary: "Add a practitioner to an organisation",
  security: auth,
  request: {
    params: orgId,
    body: {
      required: true,
      content: { "application/json": { schema: CreatePractitionerReq } }
    }
  },
  responses: {
    201: {
      description: "Practitioner added",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/organizations/{organizationId}/practitioners/{practitionerId}/approve",
  tags: ["Organisation Management"],
  summary: "Approve a practitioner",
  security: auth,
  request: {
    params: z.object({ organizationId: z.uuid(), practitionerId: z.uuid() })
  },
  responses: {
    200: {
      description: "Practitioner approved",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/organizations/{organizationId}/practitioners/{practitionerId}/availability",
  tags: ["Organisation Management"],
  summary: "Get practitioner availability",
  security: auth,
  request: {
    params: z.object({ organizationId: z.uuid(), practitionerId: z.uuid() })
  },
  responses: {
    200: {
      description: "Availability slots",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/organizations/{organizationId}/{patientId}/practitioner-access",
  tags: ["Organisation Management"],
  summary: "List practitioners with access to a patient",
  security: auth,
  request: {
    params: z.object({ organizationId: z.uuid(), patientId: z.uuid() })
  },
  responses: {
    200: {
      description: "Access list",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/organizations/{organizationId}/{patientId}/practitioner-access",
  tags: ["Organisation Management"],
  summary: "Grant a practitioner access to a patient",
  security: auth,
  request: {
    params: z.object({ organizationId: z.uuid(), patientId: z.uuid() })
  },
  responses: {
    201: {
      description: "Access granted",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/organizations/{organizationId}/{patientId}/practitioner-access/{accessId}/revoke",
  tags: ["Organisation Management"],
  summary: "Revoke a practitioner's access",
  security: auth,
  request: {
    params: z.object({
      organizationId: z.uuid(),
      patientId: z.uuid(),
      accessId: z.uuid()
    })
  },
  responses: {
    200: {
      description: "Access revoked",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/organizations/{organizationId}/patients",
  tags: ["Organisation Management"],
  summary: "List patients registered with an organisation",
  security: auth,
  request: { params: orgId },
  responses: {
    200: {
      description: "Patients",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/organizations/{organizationId}/appointments",
  tags: ["Appointments"],
  summary: "List all appointments for an organisation",
  security: auth,
  request: { params: orgId },
  responses: {
    200: {
      description: "Appointments",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/organizations/{organizationId}/invoices",
  tags: ["Invoices & Payments"],
  summary: "List all invoices for an organisation",
  security: auth,
  request: { params: orgId },
  responses: {
    200: {
      description: "Invoices",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

// ── Audit ───────────────────────────────────────────────────────────────────

registry.registerPath({
  method: "get",
  path: "/api/v1/audit-logs",
  tags: ["Audit"],
  summary: "Retrieve platform audit logs (platform admin only)",
  security: auth,
  responses: {
    200: {
      description: "Audit log entries",
      content: { "application/json": { schema: ApiResponseSchema } }
    }
  }
});

// ── Document generation ─────────────────────────────────────────────────────

const generator = new OpenApiGeneratorV3(registry.definitions);

const generatedDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Medidoc API",
    version: "1.0.0",
    description:
      "Patient-owned reproductive and maternal health EHR for Sub-Saharan Africa. Patients control their own records and grant access to organisations and practitioners."
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development"
    },
    {
      url: "https://medidoc.braintext.io",
      description: "Medidoc API"
    }
  ]
});

export const swaggerDocument = {
  ...generatedDocument,
  components: {
    ...generatedDocument.components,
    securitySchemes: {
      bearerAuth: {
        type: "http" as const,
        scheme: "bearer" as const,
        bearerFormat: "JWT",
        description: "Enter an access token"
      },
      accessTokenCookie: {
        type: "apiKey" as const,
        in: "cookie" as const,
        name: "accessToken",
        description: "Access token stored in the accessToken cookie"
      },
      refreshTokenCookie: {
        type: "apiKey" as const,
        in: "cookie" as const,
        name: "refreshToken",
        description: "Refresh token stored in the refreshToken cookie"
      }
    }
  }
};
