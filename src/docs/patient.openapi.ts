import z from "zod";
import {
  OpenAPIRegistry,
  extendZodWithOpenApi
} from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

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

const auth = [{ bearerAuth: [] }, { accessTokenCookie: [] }] as {
  [key: string]: string[];
}[];
const patientId = z.object({ patientId: z.uuid() });

export function registerPatientPaths(registry: OpenAPIRegistry) {
  const ApiRes = z.object({
    success: z.boolean(),
    message: z.string(),
    statusCode: z.number().int(),
    data: z.any().optional()
  });

  // ── Profile ────────────────────────────────────────────────────────────────
  const UpdateProfileReq = registry.register(
    "UpdatePatientProfileRequest",
    UpdatePatientProfileSchema
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
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/patients/{patientId}",
    tags: ["Patients"],
    summary: "Get patient by ID",
    security: auth,
    request: { params: patientId },
    responses: {
      200: {
        description: "Patient profile",
        content: { "application/json": { schema: ApiRes } }
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
      params: patientId,
      body: {
        required: true,
        content: { "application/json": { schema: UpdateProfileReq } }
      }
    },
    responses: {
      200: {
        description: "Profile updated",
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  // ── Organisation access ────────────────────────────────────────────────────
  const OrgAccessReq = registry.register(
    "OrganizationAccessRequest",
    OrganizationAccessSchema
  );

  registry.registerPath({
    method: "get",
    path: "/api/v1/patients/{patientId}/organization-access",
    tags: ["Patients"],
    summary: "List organisation access grants for a patient",
    security: auth,
    request: { params: patientId },
    responses: {
      200: {
        description: "Access list",
        content: { "application/json": { schema: ApiRes } }
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
      params: patientId,
      body: {
        required: true,
        content: { "application/json": { schema: OrgAccessReq } }
      }
    },
    responses: {
      201: {
        description: "Access granted",
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/patients/{patientId}/organization-access/{accessId}/revoke",
    tags: ["Patients"],
    summary: "Revoke an organisation's access",
    security: auth,
    request: { params: z.object({ patientId: z.uuid(), accessId: z.uuid() }) },
    responses: {
      200: {
        description: "Access revoked",
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  // ── Episodes ───────────────────────────────────────────────────────────────
  const NewEpisodeReq = registry.register(
    "NewEpisodeRequest",
    NewEpisodeLabelSchema
  );

  registry.registerPath({
    method: "get",
    path: "/api/v1/patients/{patientId}/episodes",
    tags: ["Records"],
    summary: "List care episodes for a patient",
    security: auth,
    request: { params: patientId },
    responses: {
      200: {
        description: "Episodes list",
        content: { "application/json": { schema: ApiRes } }
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
      params: patientId,
      body: {
        required: true,
        content: { "application/json": { schema: NewEpisodeReq } }
      }
    },
    responses: {
      201: {
        description: "Episode created",
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  // ── Summaries ──────────────────────────────────────────────────────────────
  const NewSummaryReq = registry.register(
    "NewSummaryRequest",
    NewSummarySchema
  );

  registry.registerPath({
    method: "get",
    path: "/api/v1/patients/{patientId}/summaries",
    tags: ["Records"],
    summary: "List medical summaries (medications, allergies, care plan, etc.)",
    security: auth,
    request: { params: patientId },
    responses: {
      200: {
        description: "Summaries",
        content: { "application/json": { schema: ApiRes } }
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
      params: patientId,
      body: {
        required: true,
        content: { "application/json": { schema: NewSummaryReq } }
      }
    },
    responses: {
      201: {
        description: "Summary created",
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  // ── Clinical entries ───────────────────────────────────────────────────────
  const NewClinicalEntryReq = registry.register(
    "NewClinicalEntryRequest",
    NewClinicalEntrySchema
  );

  registry.registerPath({
    method: "get",
    path: "/api/v1/patients/{patientId}/clinical-entries",
    tags: ["Records"],
    summary: "List clinical entries for a patient",
    security: auth,
    request: { params: patientId },
    responses: {
      200: {
        description: "Clinical entries",
        content: { "application/json": { schema: ApiRes } }
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
      params: patientId,
      body: {
        required: true,
        content: { "application/json": { schema: NewClinicalEntryReq } }
      }
    },
    responses: {
      201: {
        description: "Entry created",
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  // ── Appointments ───────────────────────────────────────────────────────────
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
    request: { params: patientId },
    responses: {
      200: {
        description: "Appointments",
        content: { "application/json": { schema: ApiRes } }
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
      params: patientId,
      body: {
        required: true,
        content: { "application/json": { schema: CreateApptReq } }
      }
    },
    responses: {
      201: {
        description: "Appointment booked",
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  // ── Invoices & Payments ────────────────────────────────────────────────────
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
    request: { params: patientId },
    responses: {
      200: {
        description: "Invoices",
        content: { "application/json": { schema: ApiRes } }
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
      params: patientId,
      body: {
        required: true,
        content: { "application/json": { schema: CreateInvoiceReq } }
      }
    },
    responses: {
      201: {
        description: "Invoice created",
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  registry.registerPath({
    method: "patch",
    path: "/api/v1/patients/{patientId}/invoices/{invoiceId}/mark-paid",
    tags: ["Invoices & Payments"],
    summary: "Mark an invoice as paid",
    security: auth,
    request: { params: z.object({ patientId: z.uuid(), invoiceId: z.uuid() }) },
    responses: {
      200: {
        description: "Invoice marked paid",
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/patients/{patientId}/invoices/{invoiceId}/payments",
    tags: ["Invoices & Payments"],
    summary: "List payments on an invoice",
    security: auth,
    request: { params: z.object({ patientId: z.uuid(), invoiceId: z.uuid() }) },
    responses: {
      200: {
        description: "Payments",
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/patients/{patientId}/invoices/{invoiceId}/payments",
    tags: ["Invoices & Payments"],
    summary: "Record a payment",
    security: auth,
    request: { params: z.object({ patientId: z.uuid(), invoiceId: z.uuid() }) },
    responses: {
      201: {
        description: "Payment recorded",
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  // ── Consent forms ──────────────────────────────────────────────────────────
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
    request: { params: patientId },
    responses: {
      200: {
        description: "Consent forms",
        content: { "application/json": { schema: ApiRes } }
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
      params: patientId,
      body: {
        required: true,
        content: { "application/json": { schema: CreateConsentReq } }
      }
    },
    responses: {
      201: {
        description: "Consent form created",
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  // ── Menstrual cycles ───────────────────────────────────────────────────────
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
    request: { params: patientId },
    responses: {
      200: {
        description: "Cycles",
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/patients/{patientId}/cycles/latest",
    tags: ["Menstrual Cycles"],
    summary: "Get the most recent cycle",
    security: auth,
    request: { params: patientId },
    responses: {
      200: {
        description: "Latest cycle",
        content: { "application/json": { schema: ApiRes } }
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
      params: patientId,
      body: {
        required: true,
        content: { "application/json": { schema: LogCycleReq } }
      }
    },
    responses: {
      201: {
        description: "Cycle logged",
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });
}
