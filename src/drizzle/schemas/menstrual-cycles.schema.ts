import { pgTable, timestamp, uuid, date, index } from "drizzle-orm/pg-core";
import { patients } from "./patients.schema";

export const menstrual_cycles = pgTable(
  "menstrual_cycles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .references(() => patients.id, { onDelete: "cascade" })
      .notNull(),
    cycleStartDate: date("cycle_start_date").notNull(),
    cycleEndDate: date("cycle_end_date"),
    periodStartDate: date("period_start_date"),
    periodEndDate: date("period_end_date"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
  },
  table => [index("menstrual_cycles_patient_id_idx").on(table.patientId)]
);

export type MenstrualCycle = typeof menstrual_cycles.$inferSelect;
export type NewMenstrualCycle = typeof menstrual_cycles.$inferInsert;
