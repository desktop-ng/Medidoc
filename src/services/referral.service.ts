import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";
import QRCode from "qrcode";
import db from "../configs/db";
import {
  patients,
  reproductive_profiles,
  patient_summaries,
  pregnancies,
  episodes,
  clinical_entries,
  referrals,
  NewReferral
} from "@/drizzle";
import { ApiError } from "@/utils/api-error";

const EXPIRY_HOURS: Record<NewReferral["urgency"], number> = {
  emergency: 24,
  urgent: 48,
  routine: 168
};

type GenerateReferralParams = {
  patientId: string;
  pregnancyId?: string;
  fromOrganizationId: string;
  initiatedBy: string;
  urgency: NewReferral["urgency"];
  reason: string;
  toOrganizationId?: string;
};

export class ReferralService {
  static async generateReferral(params: GenerateReferralParams) {
    const {
      patientId,
      pregnancyId,
      fromOrganizationId,
      initiatedBy,
      urgency,
      reason,
      toOrganizationId
    } = params;

    const [
      patient,
      reproductiveProfile,
      medicationsSummary,
      latestEpisode,
      latestEntry,
      pregnancy
    ] = await Promise.all([
      db.query.patients.findFirst({ where: eq(patients.id, patientId) }),

      db.query.reproductive_profiles.findFirst({
        where: eq(reproductive_profiles.patientId, patientId)
      }),

      db.query.patient_summaries.findFirst({
        where: and(
          eq(patient_summaries.patientId, patientId),
          eq(patient_summaries.category, "medications")
        )
      }),

      db
        .select()
        .from(episodes)
        .where(eq(episodes.patientId, patientId))
        .orderBy(desc(episodes.openedAt))
        .limit(1)
        .then(rows => rows[0] ?? null),

      db
        .select()
        .from(clinical_entries)
        .where(eq(clinical_entries.patientId, patientId))
        .orderBy(desc(clinical_entries.occurredAt))
        .limit(1)
        .then(rows => rows[0] ?? null),

      pregnancyId
        ? db.query.pregnancies.findFirst({
            where: eq(pregnancies.id, pregnancyId)
          })
        : Promise.resolve(null)
    ]);

    if (!patient) throw ApiError.notFound("Patient not found");

    const snapshotData = {
      demographics: {
        fullName: patient.fullName,
        dateOfBirth: patient.dob,
        gender: patient.gender,
        phone: patient.phone,
        address: patient.address,
        nin: patient.nin
      },
      reproductiveProfile: reproductiveProfile
        ? {
            trackingGoal: reproductiveProfile.trackingGoal,
            birthControl: reproductiveProfile.birthControl,
            cycleType: reproductiveProfile.cycleType,
            healthConditions: reproductiveProfile.healthConditions,
            priorPregnanciesCount: reproductiveProfile.priorPregnanciesCount,
            priorBirthsCount: reproductiveProfile.priorBirthsCount
          }
        : null,
      currentMedications: medicationsSummary?.data ?? null,
      currentPregnancy: pregnancy
        ? {
            lmp: pregnancy.lmp,
            edd: pregnancy.edd,
            gestationalAgeAtBookingWeeks:
              pregnancy.gestationalAgeAtBookingWeeks,
            complications: pregnancy.complications,
            outcome: pregnancy.outcome,
            emergencySummary: pregnancy.emergencySummary
          }
        : null,
      latestEpisode: latestEpisode
        ? {
            id: latestEpisode.id,
            label: latestEpisode.label,
            status: latestEpisode.status,
            openedAt: latestEpisode.openedAt
          }
        : null,
      latestClinicalEntry: latestEntry
        ? {
            eventType: latestEntry.eventType,
            data: latestEntry.data,
            occurredAt: latestEntry.occurredAt
          }
        : null,
      snapshotGeneratedAt: new Date().toISOString()
    };

    const accessCode = crypto.randomUUID();
    const hoursToExpiry = EXPIRY_HOURS[urgency] ?? 48;
    const accessExpiresAt = new Date(
      Date.now() + hoursToExpiry * 60 * 60 * 1000
    );

    const [referral] = await db
      .insert(referrals)
      .values({
        patientId,
        pregnancyId: pregnancyId ?? null,
        fromOrganizationId,
        toOrganizationId: toOrganizationId ?? null,
        initiatedBy,
        urgency,
        reason,
        snapshotData,
        accessCode,
        accessExpiresAt,
        status: "pending"
      })
      .returning();

    const qrCode = await QRCode.toDataURL(accessCode);

    return { referralId: referral.id, accessCode, accessExpiresAt, qrCode };
  }

  static async verifyAccessCode(code: string) {
    const referral = await db.query.referrals.findFirst({
      where: eq(referrals.accessCode, code)
    });

    if (!referral) throw ApiError.notFound("Invalid access code");

    if (referral.accessExpiresAt < new Date()) {
      throw ApiError.badRequest("This referral code has expired");
    }

    if (referral.status === "cancelled") {
      throw ApiError.badRequest("This referral has been cancelled");
    }

    return referral.snapshotData;
  }

  static async markReferralAccepted(
    referralId: string,
    receivingOrgId: string
  ) {
    const referral = await db.query.referrals.findFirst({
      where: eq(referrals.id, referralId)
    });

    if (!referral) throw ApiError.notFound("Referral not found");

    if (referral.status !== "pending") {
      throw ApiError.badRequest(`Referral is already ${referral.status}`);
    }

    const [updated] = await db
      .update(referrals)
      .set({ status: "accepted", toOrganizationId: receivingOrgId })
      .where(eq(referrals.id, referralId))
      .returning();

    return updated;
  }
}
