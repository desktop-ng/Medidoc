import { Router } from "express";
import { verifyAuthentication } from "../middlewares/verify-auth";
import { requirePatientAccess } from "../middlewares/require-patient-access";
import { validateRequest } from "../middlewares/validate-request";
import {
  createReproductiveProfile,
  getReproductiveProfile,
  updateReproductiveProfile
} from "../controllers/reproductive-profile.controller";
import {
  CreateReproductiveProfileSchema,
  UpdateReproductiveProfileSchema
} from "../validators/reproductive-profile";

const router = Router();

router.get(
  "/:patientId/reproductive-profile",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner", "admin", "patient"] }),
  getReproductiveProfile
);

router.post(
  "/:patientId/reproductive-profile",
  verifyAuthentication,
  requirePatientAccess({ roles: ["patient"] }),
  validateRequest(CreateReproductiveProfileSchema),
  createReproductiveProfile
);

router.patch(
  "/:patientId/reproductive-profile",
  verifyAuthentication,
  requirePatientAccess({ roles: ["patient"] }),
  validateRequest(UpdateReproductiveProfileSchema),
  updateReproductiveProfile
);

export default router;
