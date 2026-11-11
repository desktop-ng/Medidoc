import { Router } from "express";
import { verifyAuthentication } from "../middlewares/verify-auth";
import { requirePatientAccess } from "../middlewares/require-patient-access";
import { validateRequest } from "../middlewares/validate-request";
import {
  addChild,
  getChildrenForPatient,
  getChildrenForPregnancy,
  updateChild
} from "../controllers/child.controller";
import { AddChildSchema, UpdateChildSchema } from "../validators/child";

const router = Router();

router.get(
  "/:patientId/children",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner", "admin", "patient"] }),
  getChildrenForPatient
);

router.post(
  "/:patientId/children",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner"] }),
  validateRequest(AddChildSchema),
  addChild
);

router.get(
  "/:patientId/pregnancies/:pregnancyId/children",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner", "admin", "patient"] }),
  getChildrenForPregnancy
);

router.patch(
  "/:patientId/children/:childId",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner"] }),
  validateRequest(UpdateChildSchema),
  updateChild
);

export default router;
