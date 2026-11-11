import { eq } from "drizzle-orm";
import db from "../configs/db";
import { children, pregnancies, NewChild } from "@/drizzle";
import { ApiError } from "@/utils/api-error";

type AddChildData = {
  patientId: string;
  pregnancyId: string;
  dob: string;
  fullName?: string;
  sex?: NewChild["sex"];
  birthWeightGrams?: number;
  apgarScore1min?: number;
  apgarScore5min?: number;
};

export class ChildService {
  static async addChild(data: AddChildData) {
    const pregnancy = await db.query.pregnancies.findFirst({
      where: eq(pregnancies.id, data.pregnancyId)
    });

    if (!pregnancy) throw ApiError.notFound("Pregnancy record not found");

    if (pregnancy.patientId !== data.patientId) {
      throw ApiError.badRequest("Pregnancy does not belong to this patient");
    }

    const [child] = await db
      .insert(children)
      .values({
        patientId: data.patientId,
        pregnancyId: data.pregnancyId,
        dob: data.dob,
        fullName: data.fullName ?? null,
        sex: data.sex ?? null,
        birthWeightGrams: data.birthWeightGrams ?? null,
        apgarScore1min: data.apgarScore1min ?? null,
        apgarScore5min: data.apgarScore5min ?? null
      })
      .returning();

    return child;
  }

  static async getChildrenForPregnancy(pregnancyId: string) {
    return db
      .select()
      .from(children)
      .where(eq(children.pregnancyId, pregnancyId));
  }

  static async getChildrenForPatient(patientId: string) {
    return db.select().from(children).where(eq(children.patientId, patientId));
  }

  static async updateChild(
    childId: string,
    data: Partial<Omit<AddChildData, "patientId" | "pregnancyId">>
  ) {
    const child = await db.query.children.findFirst({
      where: eq(children.id, childId)
    });

    if (!child) throw ApiError.notFound("Child record not found");

    const updates: Record<string, unknown> = {};
    if (data.fullName !== undefined) updates.fullName = data.fullName;
    if (data.sex !== undefined) updates.sex = data.sex;
    if (data.dob !== undefined) updates.dob = data.dob;
    if (data.birthWeightGrams !== undefined)
      updates.birthWeightGrams = data.birthWeightGrams;
    if (data.apgarScore1min !== undefined)
      updates.apgarScore1min = data.apgarScore1min;
    if (data.apgarScore5min !== undefined)
      updates.apgarScore5min = data.apgarScore5min;

    const [updated] = await db
      .update(children)
      .set(updates)
      .where(eq(children.id, childId))
      .returning();

    return updated;
  }
}
