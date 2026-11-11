import { eq } from "drizzle-orm";
import db from "../configs/db";
import { reproductive_profiles, NewReproductiveProfile } from "@/drizzle";
import { ApiError } from "@/utils/api-error";

type CreateProfileData = {
  patientId: string;
  trackingGoal: NewReproductiveProfile["trackingGoal"];
  birthControl?: NewReproductiveProfile["birthControl"];
  birthControlDetails?: Record<string, unknown>;
  cycleType: NewReproductiveProfile["cycleType"];
  healthConditions?: string[];
  priorPregnanciesCount?: number;
  priorBirthsCount?: number;
};

type UpdateProfileData = Partial<Omit<CreateProfileData, "patientId">>;

export class ReproductiveProfileService {
  static async createProfile(data: CreateProfileData) {
    const existing = await db.query.reproductive_profiles.findFirst({
      where: eq(reproductive_profiles.patientId, data.patientId)
    });

    if (existing) {
      throw ApiError.badRequest(
        "Reproductive profile already exists for this patient"
      );
    }

    const [profile] = await db
      .insert(reproductive_profiles)
      .values({
        patientId: data.patientId,
        trackingGoal: data.trackingGoal,
        birthControl: data.birthControl ?? null,
        birthControlDetails: data.birthControlDetails ?? null,
        cycleType: data.cycleType,
        healthConditions: data.healthConditions ?? [],
        priorPregnanciesCount: data.priorPregnanciesCount ?? 0,
        priorBirthsCount: data.priorBirthsCount ?? 0
      })
      .returning();

    return profile;
  }

  static async getProfile(patientId: string) {
    const profile = await db.query.reproductive_profiles.findFirst({
      where: eq(reproductive_profiles.patientId, patientId)
    });

    if (!profile) throw ApiError.notFound("Reproductive profile not found");
    return profile;
  }

  static async updateProfile(patientId: string, data: UpdateProfileData) {
    const profile = await db.query.reproductive_profiles.findFirst({
      where: eq(reproductive_profiles.patientId, patientId)
    });

    if (!profile) throw ApiError.notFound("Reproductive profile not found");

    const updates: Record<string, unknown> = {};
    if (data.trackingGoal !== undefined)
      updates.trackingGoal = data.trackingGoal;
    if (data.birthControl !== undefined)
      updates.birthControl = data.birthControl;
    if (data.birthControlDetails !== undefined)
      updates.birthControlDetails = data.birthControlDetails;
    if (data.cycleType !== undefined) updates.cycleType = data.cycleType;
    if (data.healthConditions !== undefined)
      updates.healthConditions = data.healthConditions;
    if (data.priorPregnanciesCount !== undefined)
      updates.priorPregnanciesCount = data.priorPregnanciesCount;
    if (data.priorBirthsCount !== undefined)
      updates.priorBirthsCount = data.priorBirthsCount;

    const [updated] = await db
      .update(reproductive_profiles)
      .set(updates)
      .where(eq(reproductive_profiles.patientId, patientId))
      .returning();

    return updated;
  }
}
