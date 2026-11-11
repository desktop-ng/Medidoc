ALTER TABLE "practitioner_access" DROP CONSTRAINT "practitioner_access_expires_at_organization_access_expires_at_fk";
--> statement-breakpoint
ALTER TABLE "practitioner_access" ADD COLUMN "organization_access_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "practitioner_access" ADD CONSTRAINT "practitioner_access_organization_access_id_organization_access_id_fk" FOREIGN KEY ("organization_access_id") REFERENCES "public"."organization_access"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practitioner_access" DROP COLUMN "expires_at";