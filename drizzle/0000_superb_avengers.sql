DROP INDEX IF EXISTS "account_issuer_accountId_uidx";
--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "issuer";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "account_provider_account_uidx" ON "account" USING btree ("provider_id","account_id");
