import { Response } from "express";
import { UserRequest } from "@/types/user";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { ChildService } from "@/services/child.service";

export const addChild = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const patientId = req.params.patientId as string;
    const {
      pregnancy_id,
      dob,
      full_name,
      sex,
      birth_weight_grams,
      apgar_score_1min,
      apgar_score_5min
    } = req.body;

    const child = await ChildService.addChild({
      patientId,
      pregnancyId: pregnancy_id,
      dob,
      fullName: full_name,
      sex,
      birthWeightGrams: birth_weight_grams,
      apgarScore1min: apgar_score_1min,
      apgarScore5min: apgar_score_5min
    });

    return ApiResponse.created(res, "Child record added", { child });
  }
);

export const getChildrenForPatient = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const patientId = req.params.patientId as string;
    const childList = await ChildService.getChildrenForPatient(patientId);
    return ApiResponse.ok(res, "Children fetched", { children: childList });
  }
);

export const getChildrenForPregnancy = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const pregnancyId = req.params.pregnancyId as string;
    const childList = await ChildService.getChildrenForPregnancy(pregnancyId);
    return ApiResponse.ok(res, "Children fetched", { children: childList });
  }
);

export const updateChild = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const childId = req.params.childId as string;
    const {
      full_name,
      sex,
      dob,
      birth_weight_grams,
      apgar_score_1min,
      apgar_score_5min
    } = req.body;

    const child = await ChildService.updateChild(childId, {
      fullName: full_name,
      sex,
      dob,
      birthWeightGrams: birth_weight_grams,
      apgarScore1min: apgar_score_1min,
      apgarScore5min: apgar_score_5min
    });

    return ApiResponse.ok(res, "Child record updated", { child });
  }
);
