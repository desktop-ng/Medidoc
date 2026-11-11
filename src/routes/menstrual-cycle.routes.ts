import { Router } from "express";
import { verifyAuthentication } from "../middlewares/verify-auth";
import { requirePatientAccess } from "../middlewares/require-patient-access";
import { validateRequest } from "../middlewares/validate-request";
import {
  logCycle,
  getCycles,
  getLatestCycle,
  updateCycle
} from "../controllers/menstrual-cycle.controller";
import {
  LogCycleSchema,
  UpdateCycleSchema
} from "../validators/menstrual-cycle";

const router = Router();

router.get(
  "/:patientId/cycles",
  verifyAuthentication,
  requirePatientAccess({ roles: ["patient", "practitioner"] }),
  getCycles
);

router.get(
  "/:patientId/cycles/latest",
  verifyAuthentication,
  requirePatientAccess({ roles: ["patient", "practitioner"] }),
  getLatestCycle
);

router.post(
  "/:patientId/cycles",
  verifyAuthentication,
  requirePatientAccess({ roles: ["patient"] }),
  validateRequest(LogCycleSchema),
  logCycle
);

router.patch(
  "/:patientId/cycles/:cycleId",
  verifyAuthentication,
  requirePatientAccess({ roles: ["patient"] }),
  validateRequest(UpdateCycleSchema),
  updateCycle
);

export default router;
