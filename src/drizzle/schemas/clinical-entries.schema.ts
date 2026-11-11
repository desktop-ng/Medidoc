import {
  pgTable,
  text,
  timestamp,
  json,
  uuid,
  index
} from "drizzle-orm/pg-core";
import { patients } from "./patients.schema";
import { practitioners } from "./practitioners.schema";
import { providers } from "./providers.schema";
import { episodes } from "./episodes.schema";
import { pregnancies } from "./pregnancies.schema";

export const clinical_entries = pgTable(
  "clinical_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .references(() => patients.id)
      .notNull(),
    practitionerId: uuid("practitioner_id")
      .references(() => practitioners.id)
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => providers.id)
      .notNull(),
    episodeId: uuid("episode_id").references(() => episodes.id),
    pregnancyId: uuid("pregnancy_id").references(() => pregnancies.id),
    eventType: text("event_type", {
      enum: [
        "observation",
        "antenatal_visit",
        "delivery",
        "newborn_record",
        "vaccination",
        "order",
        "referral",
        "procedure",
        "lab_result",
        "radiology",
        "ultrasound",
        "vital_signs",
        "progress_note",
        "note",
        "gynae_visit",
        "contraception_update",
        "prenatal_screening",
        "postnatal_visit",
        "child_growth",
        "child_vaccine"
      ]
    }).notNull(),
    data: json("data").notNull(),
    occurredAt: timestamp("occurred_at").notNull(),
    recordedAt: timestamp("recorded_at").defaultNow().notNull()
  },
  table => [
    index("clinical_entries_patient_id_idx").on(table.patientId),
    index("clinical_entries_organization_id_idx").on(table.organizationId),
    index("clinical_entries_episode_id_idx").on(table.episodeId)
  ]
);

export type ClinicalEntry = typeof clinical_entries.$inferSelect;
export type NewClinicalEntry = typeof clinical_entries.$inferInsert;
