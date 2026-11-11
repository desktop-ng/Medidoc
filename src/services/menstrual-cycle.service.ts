import { eq, desc } from "drizzle-orm";
import db from "../configs/db";
import { menstrual_cycles } from "@/drizzle";
import { ApiError } from "@/utils/api-error";

type LogCycleData = {
  patientId: string;
  cycleStartDate: string;
  cycleEndDate?: string;
  periodStartDate?: string;
  periodEndDate?: string;
};

type UpdateCycleData = Partial<Omit<LogCycleData, "patientId">>;

export class MenstrualCycleService {
  static async logCycle(data: LogCycleData) {
    const [cycle] = await db
      .insert(menstrual_cycles)
      .values({
        patientId: data.patientId,
        cycleStartDate: data.cycleStartDate,
        cycleEndDate: data.cycleEndDate ?? null,
        periodStartDate: data.periodStartDate ?? null,
        periodEndDate: data.periodEndDate ?? null
      })
      .returning();

    return cycle;
  }

  static async getCycles(patientId: string) {
    return db
      .select()
      .from(menstrual_cycles)
      .where(eq(menstrual_cycles.patientId, patientId))
      .orderBy(desc(menstrual_cycles.cycleStartDate));
  }

  static async getLatestCycle(patientId: string) {
    const [cycle] = await db
      .select()
      .from(menstrual_cycles)
      .where(eq(menstrual_cycles.patientId, patientId))
      .orderBy(desc(menstrual_cycles.cycleStartDate))
      .limit(1);

    return cycle ?? null;
  }

  static async updateCycle(
    cycleId: string,
    patientId: string,
    data: UpdateCycleData
  ) {
    const cycle = await db.query.menstrual_cycles.findFirst({
      where: eq(menstrual_cycles.id, cycleId)
    });

    if (!cycle) throw ApiError.notFound("Cycle record not found");

    if (cycle.patientId !== patientId) {
      throw ApiError.forbidden("This cycle does not belong to this patient");
    }

    const updates: Record<string, unknown> = {};
    if (data.cycleStartDate !== undefined)
      updates.cycleStartDate = data.cycleStartDate;
    if (data.cycleEndDate !== undefined)
      updates.cycleEndDate = data.cycleEndDate;
    if (data.periodStartDate !== undefined)
      updates.periodStartDate = data.periodStartDate;
    if (data.periodEndDate !== undefined)
      updates.periodEndDate = data.periodEndDate;

    const [updated] = await db
      .update(menstrual_cycles)
      .set(updates)
      .where(eq(menstrual_cycles.id, cycleId))
      .returning();

    return updated;
  }
}
