import { Response, NextFunction } from "express";
import { UserRequest } from "@/types/user";
import { ApiError } from "@/utils/api-error";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { PregnancyService } from "@/services/pregnancy.service";

export const createPregnancy = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const patientId = req.params.patientId as string;

    if (!req.practitioner?.id) {
      return next(
        ApiError.unauthorized("Only practitioners can open a pregnancy record")
      );
    }

    const {
      booking_organization_id,
      episode_id,
      lmp,
      edd,
      gestational_age_at_booking_weeks
    } = req.body;

    const pregnancy = await PregnancyService.createPregnancy({
      patientId,
      bookingOrganizationId: booking_organization_id,
      episodeId: episode_id,
      lmp,
      edd,
      gestationalAgeAtBookingWeeks: gestational_age_at_booking_weeks
    });

    return ApiResponse.created(res, "Pregnancy record opened", { pregnancy });
  }
);

export const getPregnancies = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const patientId = req.params.patientId as string;
    const pregnancies = await PregnancyService.getPatientPregnancies(patientId);
    return ApiResponse.ok(res, "Pregnancies fetched", { pregnancies });
  }
);

export const getPregnancy = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const pregnancyId = req.params.pregnancyId as string;
    const pregnancy = await PregnancyService.getPregnancy(pregnancyId);
    return ApiResponse.ok(res, "Pregnancy fetched", { pregnancy });
  }
);

export const updatePregnancy = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.practitioner?.id) {
      return next(
        ApiError.unauthorized(
          "Only practitioners can update a pregnancy record"
        )
      );
    }

    const pregnancyId = req.params.pregnancyId as string;
    const {
      lmp,
      edd,
      gestational_age_at_booking_weeks,
      complications,
      emergency_summary
    } = req.body;

    const pregnancy = await PregnancyService.updatePregnancy(pregnancyId, {
      lmp,
      edd,
      gestationalAgeAtBookingWeeks: gestational_age_at_booking_weeks,
      complications,
      emergencySummary: emergency_summary
    });

    return ApiResponse.ok(res, "Pregnancy updated", { pregnancy });
  }
);

export const recordDelivery = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.practitioner?.id) {
      return next(
        ApiError.unauthorized("Only practitioners can record a delivery")
      );
    }

    const pregnancyId = req.params.pregnancyId as string;
    const { outcome, delivery_type, delivered_at, complications } = req.body;

    const pregnancy = await PregnancyService.recordDelivery(pregnancyId, {
      outcome,
      deliveryType: delivery_type,
      deliveredAt: delivered_at,
      complications
    });

    return ApiResponse.ok(res, "Delivery recorded", { pregnancy });
  }
);
