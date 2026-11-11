import {
  pgTable,
  text,
  timestamp,
  json,
  uuid,
  index
} from "drizzle-orm/pg-core";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";
import { practitioners } from "./practitioners.schema";
import { pregnancies } from "./pregnancies.schema";

export const referrals = pgTable(
  "referrals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .references(() => patients.id, { onDelete: "cascade" })
      .notNull(),

    // Optional — referral may be pregnancy-related or general reproductive health
    pregnancyId: uuid("pregnancy_id").references(() => pregnancies.id),

    fromOrganizationId: uuid("from_organization_id")
      .references(() => providers.id)
      .notNull(),

    // Nullable — destination may not be known at time of referral (e.g. emergency)
    toOrganizationId: uuid("to_organization_id").references(() => providers.id),

    initiatedBy: uuid("initiated_by")
      .references(() => practitioners.id)
      .notNull(),

    urgency: text("urgency", {
      enum: ["routine", "urgent", "emergency"]
    }).notNull(),

    reason: text("reason").notNull(),

    // Frozen snapshot of the patient's record at the time of referral.
    // The receiving provider sees this even if they never get full access.
    snapshotData: json("snapshot_data").notNull(),

    // One-time access code for the receiving provider to read the full record.
    // This is what gets anchored on-chain for tamper-evidence.
    accessCode: text("access_code").unique().notNull(),
    accessExpiresAt: timestamp("access_expires_at").notNull(),

    status: text("status", {
      enum: ["pending", "accepted", "completed", "cancelled"]
    })
      .notNull()
      .default("pending"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => [
    index("referrals_patient_id_idx").on(table.patientId),
    index("referrals_from_organization_id_idx").on(table.fromOrganizationId),
    index("referrals_access_code_idx").on(table.accessCode)
  ]
);

export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
