import z from "zod";
import {
  OpenAPIRegistry,
  extendZodWithOpenApi
} from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

import {
  CreateAdminSchema,
  CreatePractitionerSchema
} from "../validators/organization";

const auth = [{ bearerAuth: [] }, { accessTokenCookie: [] }] as {
  [key: string]: string[];
}[];
const orgId = z.object({ organizationId: z.uuid() });

export function registerOrganizationPaths(registry: OpenAPIRegistry) {
  const ApiRes = z.object({
    success: z.boolean(),
    message: z.string(),
    statusCode: z.number().int(),
    data: z.any().optional()
  });

  const CreateAdminReq = registry.register(
    "CreateAdminRequest",
    CreateAdminSchema
  );
  const CreatePractitionerReq = registry.register(
    "CreatePractitionerRequest",
    CreatePractitionerSchema
  );

  // ── Platform-scoped ────────────────────────────────────────────────────────

  registry.registerPath({
    method: "get",
    path: "/api/v1/organizations",
    tags: ["Organisation Management"],
    summary: "List all organisations (platform admin only)",
    security: auth,
    responses: {
      200: {
        description: "Organisations list",
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  // ── Admins ─────────────────────────────────────────────────────────────────

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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  // ── Practitioners ──────────────────────────────────────────────────────────

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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  // ── Practitioner access to patients ───────────────────────────────────────

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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  // ── Organisation patients & appointments ───────────────────────────────────

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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
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
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });

  // ── Audit logs ─────────────────────────────────────────────────────────────

  registry.registerPath({
    method: "get",
    path: "/api/v1/audit-logs",
    tags: ["Audit"],
    summary: "Retrieve platform audit logs (platform admin only)",
    security: auth,
    responses: {
      200: {
        description: "Audit log entries",
        content: { "application/json": { schema: ApiRes } }
      }
    }
  });
}
