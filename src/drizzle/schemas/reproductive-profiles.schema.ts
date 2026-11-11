import {
  pgTable,
  text,
  timestamp,
  uuid,
  json,
  integer
} from "drizzle-orm/pg-core";
import { patients } from "./patients.schema";

export const HEALTH_CONDITIONS = [
  "pcos",
  "endometriosis",
  "fibroids",
  "thyroid_disorder",
  "diabetes",
  "hypertension",
  "anaemia",
  "hiv",
  "sickle_cell",
  "depression",
  "anxiety",
  "other"
] as const;

export type HealthCondition = (typeof HEALTH_CONDITIONS)[number];

export const reproductive_profiles = pgTable("reproductive_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  trackingGoal: text("tracking_goal", {
    enum: [
      "cycle",
      "pregnancy",
      "trying_to_conceive",
      "postpartum",
      "peri_menopause"
    ]
  }).notNull(),
  birthControl: text("birth_control", {
    enum: ["pill", "iud", "none"]
  }),
  birthControlDetails: json("birth_control_details"),
  cycleType: text("cycle_type", {
    enum: ["regular", "irregular", "unknown", "no_period"]
  }).notNull(),
  healthConditions: text("health_conditions").array().notNull().default([]),
  priorPregnanciesCount: integer("prior_pregnancies_count")
    .notNull()
    .default(0),
  priorBirthsCount: integer("prior_births_count").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type ReproductiveProfile = typeof reproductive_profiles.$inferSelect;
export type NewReproductiveProfile = typeof reproductive_profiles.$inferInsert;
