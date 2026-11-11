import { Router } from "express";
import { verifyAuthentication } from "../middlewares/verify-auth";
import { requirePatientAccess } from "../middlewares/require-patient-access";
import { validateRequest } from "../middlewares/validate-request";
import {
  createPregnancy,
  getPregnancies,
  getPregnancy,
  updatePregnancy,
  recordDelivery
} from "../controllers/pregnancy.controller";
import {
  CreatePregnancySchema,
  UpdatePregnancySchema,
  RecordDeliverySchema
} from "../validators/pregnancy";

const router = Router();

router.get(
  "/:patientId/pregnancies",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner", "admin", "patient"] }),
  getPregnancies
);

router.post(
  "/:patientId/pregnancies",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner"] }),
  validateRequest(CreatePregnancySchema),
  createPregnancy
);

router.get(
  "/:patientId/pregnancies/:pregnancyId",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner", "admin", "patient"] }),
  getPregnancy
);

router.patch(
  "/:patientId/pregnancies/:pregnancyId",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner"] }),
  validateRequest(UpdatePregnancySchema),
  updatePregnancy
);

router.post(
  "/:patientId/pregnancies/:pregnancyId/delivery",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner"] }),
  validateRequest(RecordDeliverySchema),
  recordDelivery
);

export default router;
