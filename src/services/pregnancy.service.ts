import { eq, desc } from "drizzle-orm";
import db from "../configs/db";
import { pregnancies, NewPregnancy } from "@/drizzle";
import { ApiError } from "@/utils/api-error";

type CreatePregnancyData = {
  patientId: string;
  bookingOrganizationId?: string;
  episodeId?: string;
  lmp?: string;
  edd?: string;
  gestationalAgeAtBookingWeeks?: number;
};

type UpdatePregnancyData = {
  lmp?: string;
  edd?: string;
  gestationalAgeAtBookingWeeks?: number;
  complications?: string[];
  emergencySummary?: Record<string, unknown>;
};

type RecordDeliveryData = {
  outcome: Exclude<NewPregnancy["outcome"], "ongoing">;
  deliveryType?: NewPregnancy["deliveryType"];
  deliveredAt?: string;
  complications?: string[];
};

export class PregnancyService {
  static async createPregnancy(data: CreatePregnancyData) {
    const ongoing = await db.query.pregnancies.findFirst({
      where: eq(pregnancies.patientId, data.patientId)
    });

    // Prevent two concurrent ongoing pregnancies
    if (ongoing?.outcome === "ongoing") {
      throw ApiError.badRequest(
        "Patient already has an ongoing pregnancy. Close the current one before opening a new record."
      );
    }

    const [pregnancy] = await db
      .insert(pregnancies)
      .values({
        patientId: data.patientId,
        bookingOrganizationId: data.bookingOrganizationId ?? null,
        episodeId: data.episodeId ?? null,
        lmp: data.lmp ?? null,
        edd: data.edd ?? null,
        gestationalAgeAtBookingWeeks: data.gestationalAgeAtBookingWeeks ?? null,
        outcome: "ongoing"
      })
      .returning();

    return pregnancy;
  }

  static async getPatientPregnancies(patientId: string) {
    return db
      .select()
      .from(pregnancies)
      .where(eq(pregnancies.patientId, patientId))
      .orderBy(desc(pregnancies.createdAt));
  }

  static async getPregnancy(pregnancyId: string) {
    const pregnancy = await db.query.pregnancies.findFirst({
      where: eq(pregnancies.id, pregnancyId)
    });

    if (!pregnancy) throw ApiError.notFound("Pregnancy record not found");
    return pregnancy;
  }

  static async updatePregnancy(pregnancyId: string, data: UpdatePregnancyData) {
    const pregnancy = await db.query.pregnancies.findFirst({
      where: eq(pregnancies.id, pregnancyId)
    });

    if (!pregnancy) throw ApiError.notFound("Pregnancy record not found");

    if (pregnancy.outcome !== "ongoing") {
      throw ApiError.badRequest("Cannot update a closed pregnancy record");
    }

    const [updated] = await db
      .update(pregnancies)
      .set(data)
      .where(eq(pregnancies.id, pregnancyId))
      .returning();

    return updated;
  }

  static async recordDelivery(pregnancyId: string, data: RecordDeliveryData) {
    const pregnancy = await db.query.pregnancies.findFirst({
      where: eq(pregnancies.id, pregnancyId)
    });

    if (!pregnancy) throw ApiError.notFound("Pregnancy record not found");

    if (pregnancy.outcome !== "ongoing") {
      throw ApiError.badRequest("Delivery already recorded for this pregnancy");
    }

    const [updated] = await db
      .update(pregnancies)
      .set({
        outcome: data.outcome,
        deliveryType: data.deliveryType ?? null,
        deliveredAt: data.deliveredAt ?? null,
        complications: data.complications ?? pregnancy.complications
      })
      .where(eq(pregnancies.id, pregnancyId))
      .returning();

    return updated;
  }
}
