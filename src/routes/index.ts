import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import oauthRoutes from "./oauth.routes";
import organizationRoutes from "./organization.routes";
import patientRoutes from "./patient.routes";
import auditLogRoutes from "./audit-log.routes";
import { patientReferralRouter, referralRouter } from "./referral.routes";
import pregnancyRoutes from "./pregnancy.routes";
import reproductiveProfileRoutes from "./reproductive-profile.routes";
import childRoutes from "./child.routes";
import menstrualCycleRoutes from "./menstrual-cycle.routes";

const router = Router();

router.use("/v1/health", healthRoutes);
router.use("/v1/auth", authRoutes);
router.use("/v1/patients", patientRoutes);
router.use("/v1", organizationRoutes);
router.use("/v1", auditLogRoutes);
router.use("/v1/patients", patientReferralRouter);
router.use("/v1/patients", pregnancyRoutes);
router.use("/v1/patients", reproductiveProfileRoutes);
router.use("/v1/patients", childRoutes);
router.use("/v1/patients", menstrualCycleRoutes);
router.use("/v1", referralRouter);
router.use("/auth", oauthRoutes); //* Here versioning is not given because, in google and github callback routes, we are not using versioning. process.env.GOOGLE_REDIRECT_URI

export default router;
