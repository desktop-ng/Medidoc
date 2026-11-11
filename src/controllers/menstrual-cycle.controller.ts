import { Response } from "express";
import { UserRequest } from "@/types/user";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { MenstrualCycleService } from "@/services/menstrual-cycle.service";

export const logCycle = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const patientId = req.params.patientId as string;
    const {
      cycle_start_date,
      cycle_end_date,
      period_start_date,
      period_end_date
    } = req.body;

    const cycle = await MenstrualCycleService.logCycle({
      patientId,
      cycleStartDate: cycle_start_date,
      cycleEndDate: cycle_end_date,
      periodStartDate: period_start_date,
      periodEndDate: period_end_date
    });

    return ApiResponse.created(res, "Cycle logged", { cycle });
  }
);

export const getCycles = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const patientId = req.params.patientId as string;
    const cycles = await MenstrualCycleService.getCycles(patientId);
    return ApiResponse.ok(res, "Cycles fetched", { cycles });
  }
);

export const getLatestCycle = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const patientId = req.params.patientId as string;
    const cycle = await MenstrualCycleService.getLatestCycle(patientId);
    return ApiResponse.ok(res, "Latest cycle fetched", { cycle });
  }
);

export const updateCycle = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const patientId = req.params.patientId as string;
    const cycleId = req.params.cycleId as string;
    const {
      cycle_start_date,
      cycle_end_date,
      period_start_date,
      period_end_date
    } = req.body;

    const cycle = await MenstrualCycleService.updateCycle(cycleId, patientId, {
      cycleStartDate: cycle_start_date,
      cycleEndDate: cycle_end_date,
      periodStartDate: period_start_date,
      periodEndDate: period_end_date
    });

    return ApiResponse.ok(res, "Cycle updated", { cycle });
  }
);
