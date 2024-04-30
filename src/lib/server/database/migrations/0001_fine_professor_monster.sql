CREATE TABLE IF NOT EXISTS "officials" (
	"official_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"image_url" text,
	"social_links" jsonb,
	"region" text NOT NULL,
	"level" text NOT NULL
);
