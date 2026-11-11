# Medidoc API

A patient-owned reproductive and maternal health EHR built for Sub-Saharan Africa. Medidoc gives women a portable, verifiable health record they carry with them — not one that stays locked inside a clinic's system.

When a mother is referred from a primary health centre to a hospital, she no longer arrives as a stranger. A QR code on her phone or printed referral card carries a tamper-proof snapshot of her history. The receiving obstetrician scans it and has her blood group, gestational age, complications, and current medications in under 60 seconds.

Built with open-source frontier technology. Blockchain integration anchors access grants and referral records for sovereign, auditable data ownership.

---

## The Problem

Maternal mortality in Sub-Saharan Africa remains among the highest in the world. A leading cause is information loss at the point of referral. A mother transferred from a rural clinic to a district hospital often arrives without any verifiable clinical history — no blood group, no ANC records, no known complications. The receiving team starts from zero.

This is not a connectivity problem. It is a data ownership problem: health records are held by institutions, not patients.

---

## How Medidoc Solves It

**Patient-sovereign records.** The patient owns her data. She grants access to organisations; organisations grant access to their practitioners. Every grant and revocation is recorded and, for organisations, anchored on-chain.

**Portable referral passport.** When a practitioner initiates a referral, Medidoc generates a QR code containing a one-time access code. The receiving facility scans it to retrieve a frozen snapshot of the patient's record — demographics, reproductive profile, current pregnancy details, medications, and the latest clinical entry — regardless of whether the two facilities share any system.

**Emergency-ready.** The snapshot is generated at the time of referral and requires no internet access to read after the initial scan. Access codes expire automatically (24 hours for emergency referrals, 7 days for routine).

**Menstrual and reproductive health tracking.** Beyond pregnancy, women can track cycles, manage birth control, and maintain a lifelong reproductive health profile — all under their own control.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 5 |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Cache / Sessions | Redis |
| Authentication | Passport.js, JWT, Argon2 |
| Validation | Zod |
| QR Code | qrcode |
| Blockchain | (integration layer — anchors access events and referral codes) |
| File Storage | Cloudinary |
| Email | Nodemailer, Resend |
| Logging | Pino |
| API Docs | Swagger / OpenAPI 3.0 |

---

## Data Model

```
patients
  └── reproductive_profiles     (1-to-1, patient-only write)
  └── menstrual_cycles          (1-to-many)
  └── pregnancies               (1-to-many)
        └── clinical_entries    (ANC visits, delivery, postnatal)
        └── children            (newborn records)
  └── referrals                 (QR passport, frozen snapshots)
  └── organization_access       (patient grants to orgs — blockchain anchored)
        └── practitioner_access (org grants to practitioners)
```

Access hierarchy: **Patient → Organisation → Practitioner**. No practitioner can access a patient's record unless their organisation has active access granted by the patient.

---

## Architecture

```
src/
├── configs/          # Database, Redis, Cloudinary, app config
├── controllers/      # Route handlers — thin, delegate to services
├── services/         # Business logic
│   ├── referral.service.ts
│   ├── pregnancy.service.ts
│   ├── reproductive-profile.service.ts
│   ├── child.service.ts
│   └── ...
├── routes/           # Express router definitions
├── middlewares/      # Auth, access control, rate limiting
├── validators/       # Zod schemas for request validation
├── drizzle/          # Schema definitions and migrations
│   └── schemas/
│       ├── patients.schema.ts
│       ├── pregnancies.schema.ts
│       ├── referrals.schema.ts
│       ├── reproductive-profiles.schema.ts
│       ├── menstrual-cycles.schema.ts
│       ├── children.schema.ts
│       └── ...
├── docs/             # OpenAPI spec and generation script
└── server.ts         # Entry point
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- Redis

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/medidoc-api.git
cd medidoc-api

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your values

# 4. Create the database
createdb medidoc

# 5. Push the schema
npm run db:push

# 6. Start the development server
npm run dev
```

The server starts on `http://localhost:4000`.
Swagger docs: `http://localhost:4000/api/v1/docs`

---

## Environment Variables

```env
NODE_ENV=development
PORT=4000

DATABASE_URL=postgresql://user:password@localhost:5432/medidoc

REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=minimum_32_character_secret
JWT_REFRESH_SECRET=minimum_32_character_secret
CRYPTO_SECRET=minimum_32_character_secret

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RESEND_API_KEY=
EMAIL_FROM=

GMAIL_USER=
GMAIL_APP_PASSWORD=
```

> **Never commit `.env` or any file containing secrets.**

---

## Key API Endpoints

All routes are prefixed `/api/v1`. Authenticated routes require `Authorization: Bearer <token>`.

### Referrals (portable health passport)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/patients/:id/referrals` | Practitioner | Generate referral + QR code |
| GET | `/referrals/verify/:code` | None | Scan QR — read patient snapshot |
| PATCH | `/referrals/:id/accept` | Organisation | Mark referral accepted |

### Pregnancies

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/patients/:id/pregnancies` | List or open a pregnancy record |
| GET/PATCH | `/patients/:id/pregnancies/:pregnancyId` | Read or update |
| POST | `/patients/:id/pregnancies/:pregnancyId/delivery` | Record outcome |

### Reproductive Profile

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/patients/:id/reproductive-profile` | Any access | Read profile |
| POST/PATCH | `/patients/:id/reproductive-profile` | Patient only | Create or update |

### Children

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/patients/:id/children` | List or add newborn record |
| GET | `/patients/:id/pregnancies/:pregnancyId/children` | Children for a specific pregnancy |
| PATCH | `/patients/:id/children/:childId` | Update child record |

### Access Control

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/patients/:id/organization-access` | Patient grants access to an org |
| POST | `/patients/:id/organization-access/:accessId/revoke` | Patient revokes access |

Full interactive documentation is available at `GET /api/v1/docs`.

---

## Scripts

```bash
npm run dev             # Development server with hot reload
npm run build           # Compile to dist/
npm start               # Run production build

npm run db:push         # Push schema to database (dev)
npm run db:generate     # Generate migration files
npm run db:migrate      # Apply migrations
npm run db:studio       # Open Drizzle Studio

npm run docs            # Regenerate OpenAPI spec
npm run typecheck       # Type-check
npm run lint:fix        # Lint and auto-fix
npm run format:fix      # Format with Prettier
```

---

## Blockchain Integration

Medidoc uses blockchain for tamper-evident audit trails at two points:

1. **Organisation access events** — every `grant` and `revoke` of a patient's data is anchored on-chain, giving the patient an immutable record of who has accessed her data.

2. **Referral access codes** — the one-time code embedded in each QR code is anchored on-chain at generation time, making the snapshot tamper-proof and verifiable by any receiving facility.

The blockchain layer is implemented as a separate service that listens for events from the `organization_access` and `referrals` tables. The core API is chain-agnostic.

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Contributing

1. Fork the repository and create a feature branch from `main`
2. Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
3. Ensure `npm run typecheck` and `npm run lint:check` pass before opening a PR
4. Open a pull request with a clear description of the change

---

Built for the UNICEF FemTech Ventures initiative — advancing sexual, reproductive, and maternal health for women and girls in Sub-Saharan Africa.
