/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";

const applyTestEnv = () => {
  process.env.NODE_ENV = "test";
  process.env.PORT = "4000";
  process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/testdb";
  process.env.CORS_ORIGIN = "http://localhost:3000";
  process.env.CLIENT_URL = "https://example.com";
  process.env.LOG_LEVEL = "info";
  process.env.JWT_ACCESS_SECRET = "a".repeat(32);
  process.env.JWT_REFRESH_SECRET = "b".repeat(32);
  process.env.CRYPTO_SECRET = "c".repeat(32);
  process.env.RESEND_API_KEY = "test-key";
  process.env.EMAIL_FROM = "noreply@example.com";
  process.env.GMAIL_USER = "user@gmail.com";
  process.env.GMAIL_APP_PASSWORD = "a".repeat(16);
  process.env.CLOUDINARY_CLOUD_NAME = "cloud";
  process.env.CLOUDINARY_API_KEY = "key";
  process.env.CLOUDINARY_API_SECRET = "secret";
  process.env.GOOGLE_CLIENT_ID = "google-client";
  process.env.GOOGLE_CLIENT_SECRET = "google-secret";
  process.env.GOOGLE_REDIRECT_URI = "https://example.com/google/callback";
  process.env.GITHUB_CLIENT_ID = "github-client";
  process.env.GITHUB_CLIENT_SECRET = "github-secret";
  process.env.GITHUB_REDIRECT_URI = "https://example.com/github/callback";
  process.env.REDIS_URL = "redis://localhost:6379";
};

const PATIENT_ID = "11111111-1111-1111-1111-111111111111";
const ORG_ID = "22222222-2222-2222-2222-222222222222";
const PRACTITIONER_ID = "33333333-3333-3333-3333-333333333333";
const PREGNANCY_ID = "44444444-4444-4444-4444-444444444444";
const REFERRAL_ID = "55555555-5555-5555-5555-555555555555";
const ACCESS_CODE = "66666666-6666-6666-6666-666666666666";

const mockPatient = {
  id: PATIENT_ID,
  fullName: "Amina Yusuf",
  dob: "1994-03-12",
  gender: "female",
  phone: "+2348012345678",
  address: "12 Bode Thomas, Lagos",
  nin: "12345678901",
  email: "amina@example.com"
};

const mockProfile = {
  patientId: PATIENT_ID,
  trackingGoal: "pregnancy",
  birthControl: null,
  cycleType: "regular",
  healthConditions: ["anaemia"],
  priorPregnanciesCount: 1,
  priorBirthsCount: 1
};

const mockPregnancy = {
  id: PREGNANCY_ID,
  patientId: PATIENT_ID,
  lmp: "2026-07-01",
  edd: "2027-04-08",
  gestationalAgeAtBookingWeeks: 12,
  complications: ["mild_anaemia"],
  outcome: "ongoing",
  emergencySummary: { bloodGroup: "O+", baselineBp: "110/70" }
};

const mockReferral = {
  id: REFERRAL_ID,
  patientId: PATIENT_ID,
  accessCode: ACCESS_CODE,
  accessExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  status: "pending",
  snapshotData: { demographics: { fullName: "Amina Yusuf" } }
};

// ── generateReferral ─────────────────────────────────────────────────────────

test("generateReferral returns referralId, accessCode, expiresAt, and a qrCode", async t => {
  applyTestEnv();

  const { ReferralService } = await import("./referral.service.ts");
  const { default: db } = await import("../configs/db.ts");

  t.mock.method(db.query.patients, "findFirst", async () => mockPatient);
  t.mock.method(
    db.query.reproductive_profiles,
    "findFirst",
    async () => mockProfile
  );
  t.mock.method(db.query.patient_summaries, "findFirst", async () => null);
  t.mock.method(db.query.pregnancies, "findFirst", async () => mockPregnancy);

  // mock db.select().from().where().orderBy().limit().then()
  t.mock.method(db, "select", () => ({
    from: () => ({
      where: () => ({
        orderBy: () => ({
          limit: () => ({
            then: (cb: (rows: unknown[]) => unknown) => Promise.resolve(cb([]))
          })
        })
      })
    })
  }));

  t.mock.method(db, "insert", () => ({
    values: () => ({
      returning: async () => [mockReferral]
    })
  }));

  const result = await ReferralService.generateReferral({
    patientId: PATIENT_ID,
    pregnancyId: PREGNANCY_ID,
    fromOrganizationId: ORG_ID,
    initiatedBy: PRACTITIONER_ID,
    urgency: "emergency",
    reason: "Pre-eclampsia, immediate transfer required"
  });

  assert.ok(result.referralId, "should return a referralId");
  assert.ok(result.accessCode, "should return an accessCode");
  assert.ok(
    result.accessExpiresAt instanceof Date,
    "expiresAt should be a Date"
  );
  assert.ok(
    result.qrCode.startsWith("data:image/png;base64,"),
    "qrCode should be a base64 PNG data URL"
  );
});

test("generateReferral throws NotFound when patient does not exist", async t => {
  applyTestEnv();

  const { ReferralService } = await import("./referral.service.ts");
  const { default: db } = await import("../configs/db.ts");

  t.mock.method(db.query.patients, "findFirst", async () => null);
  t.mock.method(db.query.reproductive_profiles, "findFirst", async () => null);
  t.mock.method(db.query.patient_summaries, "findFirst", async () => null);
  t.mock.method(db.query.pregnancies, "findFirst", async () => null);
  t.mock.method(db, "select", () => ({
    from: () => ({
      where: () => ({
        orderBy: () => ({
          limit: () => ({
            then: (cb: (rows: unknown[]) => unknown) => Promise.resolve(cb([]))
          })
        })
      })
    })
  }));

  await assert.rejects(
    () =>
      ReferralService.generateReferral({
        patientId: PATIENT_ID,
        fromOrganizationId: ORG_ID,
        initiatedBy: PRACTITIONER_ID,
        urgency: "emergency",
        reason: "Transfer"
      }),
    /Patient not found/
  );
});

// ── verifyAccessCode ─────────────────────────────────────────────────────────

test("verifyAccessCode returns the snapshot for a valid, unexpired code", async t => {
  applyTestEnv();

  const { ReferralService } = await import("./referral.service.ts");
  const { default: db } = await import("../configs/db.ts");

  t.mock.method(db.query.referrals, "findFirst", async () => mockReferral);

  const snapshot = await ReferralService.verifyAccessCode(ACCESS_CODE);

  assert.deepEqual(snapshot, mockReferral.snapshotData);
});

test("verifyAccessCode throws when the code is expired", async t => {
  applyTestEnv();

  const { ReferralService } = await import("./referral.service.ts");
  const { default: db } = await import("../configs/db.ts");

  t.mock.method(db.query.referrals, "findFirst", async () => ({
    ...mockReferral,
    accessExpiresAt: new Date(Date.now() - 1000) // 1 second in the past
  }));

  await assert.rejects(
    () => ReferralService.verifyAccessCode(ACCESS_CODE),
    /expired/
  );
});

test("verifyAccessCode throws when the referral is cancelled", async t => {
  applyTestEnv();

  const { ReferralService } = await import("./referral.service.ts");
  const { default: db } = await import("../configs/db.ts");

  t.mock.method(db.query.referrals, "findFirst", async () => ({
    ...mockReferral,
    status: "cancelled"
  }));

  await assert.rejects(
    () => ReferralService.verifyAccessCode(ACCESS_CODE),
    /cancelled/
  );
});

test("verifyAccessCode throws NotFound for an unknown code", async t => {
  applyTestEnv();

  const { ReferralService } = await import("./referral.service.ts");
  const { default: db } = await import("../configs/db.ts");

  t.mock.method(db.query.referrals, "findFirst", async () => null);

  await assert.rejects(
    () => ReferralService.verifyAccessCode("unknown-code"),
    /Invalid access code/
  );
});

// ── markReferralAccepted ─────────────────────────────────────────────────────

test("markReferralAccepted updates status to accepted and sets the receiving org", async t => {
  applyTestEnv();

  const { ReferralService } = await import("./referral.service.ts");
  const { default: db } = await import("../configs/db.ts");

  const RECEIVING_ORG = "77777777-7777-7777-7777-777777777777";

  t.mock.method(db.query.referrals, "findFirst", async () => mockReferral);
  t.mock.method(db, "update", () => ({
    set: () => ({
      where: () => ({
        returning: async () => [
          {
            ...mockReferral,
            status: "accepted",
            toOrganizationId: RECEIVING_ORG
          }
        ]
      })
    })
  }));

  const updated = await ReferralService.markReferralAccepted(
    REFERRAL_ID,
    RECEIVING_ORG
  );

  assert.equal(updated.status, "accepted");
  assert.equal(updated.toOrganizationId, RECEIVING_ORG);
});

test("markReferralAccepted throws when referral is not pending", async t => {
  applyTestEnv();

  const { ReferralService } = await import("./referral.service.ts");
  const { default: db } = await import("../configs/db.ts");

  t.mock.method(db.query.referrals, "findFirst", async () => ({
    ...mockReferral,
    status: "accepted"
  }));

  await assert.rejects(
    () => ReferralService.markReferralAccepted(REFERRAL_ID, ORG_ID),
    /already accepted/
  );
});
