import { Request, Response, NextFunction } from "express";
import { AsyncHandler } from "../utils/async-handler";
import { ApiResponse } from "../utils/api-response";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";
import { OrganizationService } from "../services/organization.service";
import db from "../configs/db";
import { eq } from "drizzle-orm";
import { patients } from "@/drizzle";

//? PLATFORM-SCOPED

export const listOrganizations = AsyncHandler(
  async (_req: UserRequest, res: Response) => {
    const organizations = await OrganizationService.listOrganizations();
    return ApiResponse.ok(
      res,
      "Organizations fetched successfully",
      organizations
    );
  }
);

export const listPublicOrganizations = AsyncHandler(
  async (_req: UserRequest, res: Response) => {
    const organizations = await OrganizationService.listPublicOrganizations();
    return ApiResponse.ok(
      res,
      "Organizations fetched successfully",
      organizations
    );
  }
);

export const verifyOrganization = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { organizationId } = req.params;
    const organization = await OrganizationService.verifyOrganization(
      organizationId as string
    );
    return ApiResponse.ok(
      res,
      "Organization verified successfully",
      organization
    );
  }
);

export const suspendOrganization = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { organizationId } = req.params;
    const organization = await OrganizationService.suspendOrganization(
      organizationId as string
    );
    return ApiResponse.ok(
      res,
      "Organization suspended successfully",
      organization
    );
  }
);

export const reinstateOrganization = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { organizationId } = req.params;
    const organization = await OrganizationService.reinstateOrganization(
      organizationId as string
    );
    return ApiResponse.ok(
      res,
      "Organization reinstated successfully",
      organization
    );
  }
);

export const getPlatformStats = AsyncHandler(
  async (_req: UserRequest, res: Response) => {
    const stats = await OrganizationService.getPlatformStats();
    return ApiResponse.ok(res, "Platform stats fetched successfully", stats);
  }
);

//? ORG-SCOPED DIRECTORIES

export const listOrganizationPatients = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { organizationId } = req.params;
    const patientList = await OrganizationService.listPatientsForOrganization(
      organizationId as string
    );
    return ApiResponse.ok(res, "Patients fetched successfully", patientList);
  }
);

export const listPublicPractitioners = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { organizationId } = req.params;
    const practitionerList = await OrganizationService.listPublicPractitioners(
      organizationId as string
    );
    return ApiResponse.ok(
      res,
      "Practitioners fetched successfully",
      practitionerList
    );
  }
);

export const listAdmins = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { organizationId } = req.params;
    const admins = await OrganizationService.listAdmins(
      organizationId as string
    );
    return ApiResponse.ok(res, "Admins fetched successfully", admins);
  }
);

export const createAdmin = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { organizationId } = req.params;
    const admin = await OrganizationService.createAdmin(
      organizationId as string,
      req.body
    );
    return ApiResponse.created(res, "Admin created successfully", admin);
  }
);

export const approveAdmin = AsyncHandler(
  async (req: UserRequest, res: Response, next) => {
    const { adminId } = req.params;
    if (!req.admin) {
      return next(ApiError.forbidden("Admin access required"));
    }

    const admin = await OrganizationService.approveAdmin(
      adminId as string,
      req.admin
    );
    return ApiResponse.ok(res, "Admin approved successfully", admin);
  }
);

export const listPractitioners = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { organizationId } = req.params;
    const practitioners = await OrganizationService.listPractitioners(
      organizationId as string
    );
    return ApiResponse.ok(
      res,
      "Practitioners fetched successfully",
      practitioners
    );
  }
);

export const createPractitioner = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { organizationId } = req.params;
    const practitioner = await OrganizationService.createPractitioner(
      organizationId as string,
      req.body
    );
    return ApiResponse.created(
      res,
      "Practitioner created successfully",
      practitioner
    );
  }
);

export const approvePractitioner = AsyncHandler(
  async (req: UserRequest, res: Response, next) => {
    const { practitionerId } = req.params;
    if (!req.admin) {
      return next(ApiError.forbidden("Admin access required"));
    }

    const practitioner = await OrganizationService.approvePractitioner(
      practitionerId as string,
      req.admin
    );
    return ApiResponse.ok(
      res,
      "Practitioner approved successfully",
      practitioner
    );
  }
);

export const getPractiitonerAccess = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    const allowedPractitioners =
      await OrganizationService.getPractitionerAccessList(
        patientId?.toString()
      );

    if (!allowedPractitioners) {
      return next(
        ApiError.server(
          "Failed to get practitioner access list. Please try again later!"
        )
      );
    }

    return ApiResponse.ok(
      res,
      "Practitioners fetched successfully",
      allowedPractitioners
    );
  }
);

export const assignPractitionerAccess = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;
    const { practitioner_id } = req.body;

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    if (!practitioner_id) {
      return next(
        ApiError.badRequest(
          "Please input an appropriate practitioner id in request body"
        )
      );
    }

    const patientAccount = await db.query.patients.findFirst({
      where: eq(patients.id, patientId as string)
    });

    if (!patientAccount) {
      return next(ApiError.badRequest("Patient account does not exist"));
    }

    if (!req.admin) {
      return next(ApiError.forbidden("Staff admin access required"));
    }

    const newAccess = await OrganizationService.addPractitionerAccess(
      req.admin.id,
      req.admin.organizationId,
      patientId.toString(),
      practitioner_id
    );

    if (!newAccess) {
      return next(
        ApiError.server("Failed to create new access. Please try again later!")
      );
    }

    return ApiResponse.created(res, "Access granted successfully", newAccess);
  }
);

export const revokePractitionerAccess = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId, accessId } = req.params;

    if (!patientId || !accessId) {
      return next(ApiError.badRequest("Please input an appropriate id"));
    }

    const patientAccount = await db.query.patients.findFirst({
      where: eq(patients.id, patientId as string)
    });

    if (!patientAccount) {
      return next(ApiError.badRequest("Patient account does not exist"));
    }

    if (!req.admin) {
      return next(ApiError.forbidden("Staff admin access required"));
    }

    const revokedAccess = await OrganizationService.removePractitionerAccess(
      patientId.toString(),
      accessId?.toString()
    );

    if (!revokedAccess) {
      return next(
        ApiError.server("Failed to revoke access. Please try again later!")
      );
    }

    return ApiResponse.ok(res, "Access revoked successfully", revokedAccess);
  }
);
