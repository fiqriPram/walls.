CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" text NOT NULL,
	"source" text NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"thumb_url" text NOT NULL,
	"full_url" text NOT NULL,
	"download_url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"device_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "unique_fav_idx" ON "favorites" USING btree ("device_id","source","external_id");