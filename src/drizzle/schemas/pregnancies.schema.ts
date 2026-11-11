import {
  pgTable,
  text,
  timestamp,
  date,
  integer,
  json,
  uuid,
  index
} from "drizzle-orm/pg-core";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";
import { episodes } from "./episodes.schema";

export const pregnancies = pgTable(
  "pregnancies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .references(() => patients.id, { onDelete: "cascade" })
      .notNull(),

    // Links all ANC visits, delivery, postnatal entries in clinical_entries
    episodeId: uuid("episode_id").references(() => episodes.id),

    // The booking provider — where ANC started
    bookingOrganizationId: uuid("booking_organization_id").references(
      () => providers.id
    ),

    lmp: date("lmp"), // last menstrual period — gestational age anchor
    edd: date("edd"), // estimated due date — set by LMP or ultrasound

    // How many weeks along she was at her first ANC visit
    gestationalAgeAtBookingWeeks: integer("gestational_age_at_booking_weeks"),

    outcome: text("outcome", {
      enum: [
        "ongoing",
        "live_birth",
        "stillbirth",
        "miscarriage",
        "ectopic",
        "molar",
        "termination"
      ]
    })
      .notNull()
      .default("ongoing"),

    deliveryType: text("delivery_type", {
      enum: ["svd", "assisted", "cs"]
    }),

    // svd = spontaneous vaginal delivery, cs = caesarean section

    complications: text("complications").array().notNull().default([]),

    // Snapshot of key facts for emergency referral — blood group, baseline BP, etc.
    // Populated/updated by practitioners, readable without full record access
    emergencySummary: json("emergency_summary"),

    deliveredAt: date("delivered_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => [
    index("pregnancies_patient_id_idx").on(table.patientId),
    index("pregnancies_episode_id_idx").on(table.episodeId)
  ]
);

export type Pregnancy = typeof pregnancies.$inferSelect;
export type NewPregnancy = typeof pregnancies.$inferInsert;
