# Medidoc API

A patient-owned reproductive and maternal health EHR built for Sub-Saharan Africa. Medidoc gives women a portable, verifiable health record they carry with them — not one that stays locked inside a clinic's system.

When a mother is referred from a primary health centre to a hospital, she no longer arrives as a stranger. A QR code on her phone or printed referral card carries a tamper-proof snapshot of her history. The receiving obstetrician scans it and has her blood group, gestational age, complications, and current medications in under 60 seconds.

Built with open-source frontier technology. Blockchain integration anchors access grants and referral records for sovereign, auditable data ownership.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Overview](#api-overview)
- [Scripts](#scripts)
- [Docker](#docker)
- [Code Quality](#code-quality)
- [Blockchain Integration](#blockchain-integration)
- [Contributing](#contributing)

---

## Features

- **Role-based access control** — patients, practitioners, organization admins, and platform admins each have scoped permissions
- **Hybrid authentication** — local credentials (email + password with Argon2 hashing) and OAuth 2.0 (Google, GitHub) via Passport.js
- **JWT + refresh token flow** — 15-minute access tokens, long-lived refresh tokens, and secure logout
- **OTP email verification** — required on registration before account activation
- **Patient-sovereign health records** — episodes of care, clinical entries, and medical summaries with full version history
- **Access control for records** — patients explicitly grant and revoke access per organisation and per practitioner
- **Reproductive & maternal health** — pregnancies, delivery outcomes, reproductive profiles, menstrual cycle tracking, and child records
- **Portable referral passport** — QR-code referrals embed a tamper-proof frozen snapshot of the patient's record for receiving facilities
- **Appointments & invoicing** — schedule appointments, check-in, raise invoices, and record payments
- **Consent forms** — attach and retrieve patient consent documents
- **Organisation onboarding** — organisations register and await platform-level verification before going live
- **Audit logs** — platform-wide audit trail for sensitive operations
- **File uploads** — Cloudinary integration for documents and images
- **Email delivery** — Nodemailer and Resend support for transactional emails
- **Rate limiting & security headers** — express-rate-limit and Helmet configured out of the box
- **Structured logging** — Pino with pretty-printing in development
- **OpenAPI / Swagger docs** — auto-generated and served at runtime

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
| Containerization | Docker (multi-stage build) |

---

## Architecture

```
src/
├── configs/          # Database, Redis, Cloudinary, and app config
├── controllers/      # Route handlers (thin, delegate to services)
├── services/         # Business logic
├── routes/           # Express router definitions
├── middlewares/      # Auth, error handling, rate limiting, etc.
├── validators/       # Zod schemas for request validation
├── helpers/          # Shared utility functions
├── types/            # TypeScript interfaces and type definitions
├── drizzle/          # Drizzle schema, migrations, and queries
│   └── schemas/
│       ├── patients.schema.ts
│       ├── pregnancies.schema.ts
│       ├── referrals.schema.ts
│       ├── reproductive-profiles.schema.ts
│       ├── menstrual-cycles.schema.ts
│       ├── children.schema.ts
│       └── ...
├── seed/             # Database seeding scripts
├── email-templates/  # EJS templates for transactional emails
├── docs/             # Swagger/OpenAPI generated output
├── utils/            # Miscellaneous utilities
└── server.ts         # Entry point
```

Access hierarchy: **Patient → Organisation → Practitioner**. No practitioner can access a patient's record unless their organisation has active access granted by the patient.

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
# Edit .env with your values (see Environment Variables below)

# 4. Run database migrations
npm run db:migrate

# 5. (Optional) Seed the database
npm run seed

# 6. Start the development server
npm run dev
```

The server starts on `http://localhost:4000` by default.
Swagger docs: `http://localhost:4000/api/v1/docs`

---

## Environment Variables

Create a `.env` file at the project root:

```env
NODE_ENV=development
PORT=4000

DATABASE_URL=postgresql://user:password@localhost:5432/medidoc

REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=minimum_32_character_secret
JWT_REFRESH_SECRET=minimum_32_character_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
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

## Database

Drizzle ORM is used for schema management and migrations.

```bash
npm run db:generate   # Generate a migration from schema changes
npm run db:migrate    # Apply pending migrations
npm run db:push       # Push schema directly (dev only)
npm run db:studio     # Open Drizzle Studio (visual browser)
```

---

## API Overview

All routes are prefixed with `/api/v1`. Authenticated routes require a `Bearer` access token in the `Authorization` header or the `accessToken` cookie. Access tokens expire after **15 minutes** — use `POST /auth/refresh` to rotate them.

> Endpoints marked _(planned)_ have database schemas in place but are not yet implemented.

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Basic liveness check |
| GET | `/health/detailed` | Health check with memory, CPU, and dependency info |

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a base user account |
| POST | `/auth/register/patient` | Register a patient account |
| POST | `/auth/register/organization` | Register a provider organisation |
| POST | `/auth/verify` | Verify account via OTP |
| POST | `/auth/login` | Sign in (returns access + refresh tokens) |
| POST | `/auth/refresh` | Rotate access and refresh tokens |
| POST | `/auth/logout` | Invalidate the current session |
| GET | `/auth/profile` | Get authenticated user profile |
| PATCH | `/auth/profile` | Update profile (supports avatar upload) |
| GET | `/auth/sessions` | List all active sessions |
| DELETE | `/auth/sessions` | Revoke all sessions |
| DELETE | `/auth/sessions/:sessionId` | Revoke a specific session |
| POST | `/auth/forgot-password` | Request a password reset OTP |
| POST | `/auth/verify-reset-otp` | Verify password reset OTP |
| POST | `/auth/reset-password` | Set a new password after OTP verify |
| POST | `/auth/change-password` | Change password (authenticated) |
| POST | `/auth/account/request-delete` | Initiate account deletion |
| DELETE | `/auth/account/delete` | Confirm and delete account |
| PUT | `/auth/account/reactivate` | Reactivate a deactivated account |

### OAuth _(no `/api/v1` prefix)_

| Method | Endpoint | Description |
|---|---|---|
| GET | `/auth/github` | Initiate GitHub OAuth flow |
| GET | `/auth/github/callback` | GitHub OAuth callback |
| GET | `/auth/google` | Initiate Google OAuth flow |
| GET | `/auth/google/callback` | Google OAuth callback |

### Patients

| Method | Endpoint | Description |
|---|---|---|
| GET | `/patients/me` | Get own patient profile |
| GET | `/patients/:id` | Get patient by ID |
| PATCH | `/patients/:id` | Update patient profile |

### Reproductive Profile

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/patients/:id/reproductive-profile` | Any access | Read profile |
| POST | `/patients/:id/reproductive-profile` | Patient only | Create profile (one-time setup) |
| PATCH | `/patients/:id/reproductive-profile` | Patient only | Update profile |

### Pregnancies

| Method | Endpoint | Description |
|---|---|---|
| GET | `/patients/:id/pregnancies` | List all pregnancy records |
| POST | `/patients/:id/pregnancies` | Open a new pregnancy record |
| GET | `/patients/:id/pregnancies/:pregnancyId` | Get a single pregnancy record |
| PATCH | `/patients/:id/pregnancies/:pregnancyId` | Update pregnancy details (LMP, EDD, complications) |
| POST | `/patients/:id/pregnancies/:pregnancyId/delivery` | Record delivery outcome and close the pregnancy |

### Children

| Method | Endpoint | Description |
|---|---|---|
| GET | `/patients/:id/children` | List all children linked to a patient |
| POST | `/patients/:id/children` | Add a newborn record linked to a pregnancy |
| GET | `/patients/:id/pregnancies/:pregnancyId/children` | List children for a specific pregnancy |
| PATCH | `/patients/:id/children/:childId` | Update a child record |

### Menstrual Cycles

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/patients/:id/cycles` | Patient / Practitioner | List cycle history |
| GET | `/patients/:id/cycles/latest` | Patient / Practitioner | Get the most recent cycle |
| POST | `/patients/:id/cycles` | Patient only | Log a new cycle |
| PATCH | `/patients/:id/cycles/:cycleId` | Patient only | Update a cycle record |

### Referrals

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/patients/:id/referrals` | Practitioner | Generate referral + QR code |
| GET | `/referrals/verify/:code` | None (public) | Scan QR — read frozen patient snapshot |
| PATCH | `/referrals/:referralId/accept` | Organisation | Mark referral accepted |

### Records & Episodes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/patients/:id/episodes` | List care episodes |
| POST | `/patients/:id/episodes` | Open a new care episode |
| POST | `/patients/:id/episodes/:episodeId/close` | _(planned)_ Close an active episode |
| GET | `/patients/:id/summaries` | List medical summaries (medications, allergies, care plan) |
| POST | `/patients/:id/summaries` | Create a medical summary entry |
| PATCH | `/patients/:id/summaries/:summaryId` | _(planned)_ Update a summary entry |
| GET | `/patients/:id/summaries/:summaryId/versions` | _(planned)_ View full version history of a summary |
| GET | `/patients/:id/clinical-entries` | List clinical entries (observations, lab results, vitals) |
| POST | `/patients/:id/clinical-entries` | Create a clinical entry |

### Access Control

| Method | Endpoint | Description |
|---|---|---|
| GET | `/patients/:id/organization-access` | List organisation access grants |
| POST | `/patients/:id/organization-access` | Grant an organisation access to records |
| POST | `/patients/:id/organization-access/:accessId/revoke` | Revoke an organisation's access |
| GET | `/organizations/:orgId/:patientId/practitioner-access` | List practitioners with access to a patient |
| POST | `/organizations/:orgId/:patientId/practitioner-access` | Grant a practitioner access to a patient |
| POST | `/organizations/:orgId/:patientId/practitioner-access/:accessId/revoke` | Revoke a practitioner's access |

### Appointments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/patients/:id/appointments` | List appointments for a patient |
| POST | `/patients/:id/appointments` | Book an appointment |
| PATCH | `/patients/:id/appointments/:appointmentId/check-in` | Check in for an appointment |
| PATCH | `/patients/:id/appointments/:appointmentId/cancel` | Cancel an appointment |
| GET | `/organizations/:orgId/appointments` | List all appointments for an organisation |
| GET | `/organizations/:orgId/practitioners/:practitionerId/availability` | Get practitioner availability slots |

### Invoices & Payments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/patients/:id/invoices` | List invoices for a patient |
| POST | `/patients/:id/invoices` | Create an invoice |
| PATCH | `/patients/:id/invoices/:invoiceId/mark-paid` | Mark an invoice as paid |
| GET | `/patients/:id/invoices/:invoiceId/payments` | List payments on an invoice |
| POST | `/patients/:id/invoices/:invoiceId/payments` | Record a payment |
| GET | `/organizations/:orgId/invoices` | List all invoices for an organisation |

### Consent Forms

| Method | Endpoint | Description |
|---|---|---|
| GET | `/patients/:id/consent-forms` | List consent forms for a patient |
| POST | `/patients/:id/consent-forms` | Create a consent form (practitioner) |
| PATCH | `/patients/:id/consent-forms/:consentFormId/sign` | Patient signs a consent form |

### Organisation Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/organizations/public` | List publicly visible organisations |
| GET | `/organizations/:id/admins` | List organisation admins |
| POST | `/organizations/:id/admins` | Invite an admin |
| POST | `/admins/:adminId/approve` | Approve an admin |
| GET | `/organizations/:id/practitioners` | List practitioners in an organisation |
| POST | `/organizations/:id/practitioners` | Add a practitioner |
| POST | `/practitioners/:practitionerId/approve` | Approve a practitioner |
| GET | `/organizations/:id/practitioners/public` | List publicly visible practitioners |
| GET | `/organizations/:id/patients` | List patients registered with an organisation |

### Platform Administration

| Method | Endpoint | Description |
|---|---|---|
| GET | `/organizations` | List all organisations (platform admin) |
| GET | `/platform/stats` | Platform-wide statistics |
| POST | `/organizations/:id/verify` | Verify an organisation |
| POST | `/organizations/:id/suspend` | Suspend an organisation |
| POST | `/organizations/:id/reinstate` | Reinstate a suspended organisation |
| GET | `/audit-logs` | Retrieve platform audit logs |

Full interactive documentation is available via Swagger UI at `GET /api/v1/docs`.

---

## Scripts

```bash
npm run dev           # Start development server with hot reload
npm run build         # Compile TypeScript to dist/
npm start             # Run the compiled production build

npm run seed          # Seed the database with sample data

npm run db:generate   # Generate Drizzle migrations
npm run db:migrate    # Apply migrations
npm run db:push       # Push schema without migration files
npm run db:studio     # Open Drizzle Studio

npm run docs          # Regenerate Swagger output

npm run typecheck     # Type-check source
npm run lint:check    # Lint without fixing
npm run lint:fix      # Lint and auto-fix
npm run format:check  # Check formatting
npm run format:fix    # Auto-format with Prettier
```

---

## Docker

A multi-stage Dockerfile is included for production builds.

```bash
docker build -t medidoc-api .
docker run -p 4000:4000 --env-file .env medidoc-api
```

---

## Code Quality

This project enforces consistent code style and commit conventions through:

- **ESLint** — TypeScript-aware linting rules
- **Prettier** — opinionated code formatting
- **Husky** — Git hooks to run checks before commits
- **lint-staged** — runs ESLint and Prettier only on staged files
- **Commitlint** — enforces [Conventional Commits](https://www.conventionalcommits.org/) format

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
