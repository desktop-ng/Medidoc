import {
  pgTable,
  text,
  timestamp,
  date,
  integer,
  uuid,
  index
} from "drizzle-orm/pg-core";
import { patients } from "./patients.schema";
import { pregnancies } from "./pregnancies.schema";

export const children = pgTable(
  "children",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // The mother
    patientId: uuid("patient_id")
      .references(() => patients.id, { onDelete: "cascade" })
      .notNull(),

    // Links back to the pregnancy record
    pregnancyId: uuid("pregnancy_id")
      .references(() => pregnancies.id)
      .notNull(),

    fullName: text("full_name"),
    sex: text("sex", { enum: ["male", "female", "indeterminate"] }),
    dob: date("dob").notNull(),
    birthWeightGrams: integer("birth_weight_grams"),

    // APGAR scores — assess newborn health at 1 and 5 minutes after birth
    apgarScore1min: integer("apgar_score_1min"),
    apgarScore5min: integer("apgar_score_5min"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => [
    index("children_patient_id_idx").on(table.patientId),
    index("children_pregnancy_id_idx").on(table.pregnancyId)
  ]
);

export type Child = typeof children.$inferSelect;
export type NewChild = typeof children.$inferInsert;
