import { Router } from "express";
import { verifyAuthentication } from "../middlewares/verify-auth";
import { requirePatientAccess } from "../middlewares/require-patient-access";
import { validateRequest } from "../middlewares/validate-request";
import {
  generateReferral,
  verifyReferralCode,
  acceptReferral
} from "../controllers/referral.controller";
import {
  GenerateReferralSchema,
  AcceptReferralSchema
} from "../validators/referral";

// Mounted at /v1/patients — patient-scoped referral actions
export const patientReferralRouter = Router();

patientReferralRouter.post(
  "/:patientId/referrals",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner"] }),
  validateRequest(GenerateReferralSchema),
  generateReferral
);

// Mounted at /v1 — referral actions that don't require a patient context
export const referralRouter = Router();

// Public — no auth required; receiving hospital scans QR and reads snapshot
referralRouter.get("/referrals/verify/:code", verifyReferralCode);

referralRouter.patch(
  "/referrals/:referralId/accept",
  verifyAuthentication,
  validateRequest(AcceptReferralSchema),
  acceptReferral
);
