import { Response, NextFunction } from "express";
import { UserRequest } from "@/types/user";
import { ApiError } from "@/utils/api-error";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { ReproductiveProfileService } from "@/services/reproductive-profile.service";

export const createReproductiveProfile = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const patientId = req.params.patientId as string;

    if (req.user?.role !== "patient" || req.patient_id !== patientId) {
      return next(
        ApiError.unauthorized(
          "Only the patient can set up their own reproductive profile"
        )
      );
    }

    const {
      tracking_goal,
      birth_control,
      birth_control_details,
      cycle_type,
      health_conditions,
      prior_pregnancies_count,
      prior_births_count
    } = req.body;

    const profile = await ReproductiveProfileService.createProfile({
      patientId,
      trackingGoal: tracking_goal,
      birthControl: birth_control,
      birthControlDetails: birth_control_details,
      cycleType: cycle_type,
      healthConditions: health_conditions,
      priorPregnanciesCount: prior_pregnancies_count,
      priorBirthsCount: prior_births_count
    });

    return ApiResponse.created(res, "Reproductive profile created", {
      profile
    });
  }
);

export const getReproductiveProfile = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const patientId = req.params.patientId as string;
    const profile = await ReproductiveProfileService.getProfile(patientId);
    return ApiResponse.ok(res, "Reproductive profile fetched", { profile });
  }
);

export const updateReproductiveProfile = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const patientId = req.params.patientId as string;

    if (req.user?.role !== "patient" || req.patient_id !== patientId) {
      return next(
        ApiError.unauthorized(
          "Only the patient can update their reproductive profile"
        )
      );
    }

    const {
      tracking_goal,
      birth_control,
      birth_control_details,
      cycle_type,
      health_conditions,
      prior_pregnancies_count,
      prior_births_count
    } = req.body;

    const profile = await ReproductiveProfileService.updateProfile(patientId, {
      trackingGoal: tracking_goal,
      birthControl: birth_control,
      birthControlDetails: birth_control_details,
      cycleType: cycle_type,
      healthConditions: health_conditions,
      priorPregnanciesCount: prior_pregnancies_count,
      priorBirthsCount: prior_births_count
    });

    return ApiResponse.ok(res, "Reproductive profile updated", { profile });
  }
);
