CREATE TABLE IF NOT EXISTS "batch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"raw_data" jsonb NOT NULL,
	"total_rows" integer NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batch_chunk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"start_row" integer NOT NULL,
	"end_row" integer NOT NULL,
	"total_rows" integer NOT NULL,
	"workflow_step_id" uuid,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "error_row" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"row_index" integer NOT NULL,
	"raw_data" jsonb NOT NULL,
	"error_message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "processed_row" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"row_index" integer NOT NULL,
	"data" jsonb NOT NULL,
	"score" integer,
	"risk_level" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow" ADD COLUMN "is_paused" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "workflow" ADD COLUMN "failed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "workflow_step" ADD COLUMN "parallel_group" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_created_at_idx" ON "batch" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_chunk_idx" ON "batch_chunk" ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_chunk_chunk_idx" ON "batch_chunk" ("chunk_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "error_row_batch_idx" ON "error_row" ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "error_row_row_idx" ON "error_row" ("row_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processed_row_batch_idx" ON "processed_row" ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processed_row_row_idx" ON "processed_row" ("row_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "step_name_idx" ON "workflow_step" ("name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_chunk" ADD CONSTRAINT "batch_chunk_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_chunk" ADD CONSTRAINT "batch_chunk_workflow_step_id_workflow_step_id_fk" FOREIGN KEY ("workflow_step_id") REFERENCES "workflow_step"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "error_row" ADD CONSTRAINT "error_row_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "processed_row" ADD CONSTRAINT "processed_row_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
