import { Response, NextFunction } from "express";
import { UserRequest } from "@/types/user";
import { ApiError } from "@/utils/api-error";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { ReferralService } from "@/services/referral.service";

export const generateReferral = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const patientId = req.params.patientId as string;
    const practitionerId = req.practitioner?.id;

    if (!practitionerId) {
      return next(
        ApiError.unauthorized("Only practitioners can create referrals")
      );
    }

    const organizationId = req.practitioner?.organizationId;
    if (!organizationId) {
      return next(ApiError.badRequest("No organization context found"));
    }

    const { pregnancy_id, to_organization_id, urgency, reason } = req.body;

    const result = await ReferralService.generateReferral({
      patientId,
      pregnancyId: pregnancy_id,
      fromOrganizationId: organizationId,
      initiatedBy: practitionerId,
      urgency,
      reason,
      toOrganizationId: to_organization_id
    });

    return ApiResponse.created(res, "Referral generated successfully", result);
  }
);

export const verifyReferralCode = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const code = req.params.code as string;
    const snapshot = await ReferralService.verifyAccessCode(code);
    return ApiResponse.ok(res, "Referral verified", { snapshot });
  }
);

export const acceptReferral = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const referralId = req.params.referralId as string;
    const { receiving_org_id } = req.body;

    const referral = await ReferralService.markReferralAccepted(
      referralId,
      receiving_org_id
    );

    return ApiResponse.ok(res, "Referral accepted", { referral });
  }
);
