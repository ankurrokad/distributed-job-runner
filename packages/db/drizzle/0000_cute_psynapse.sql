DO $$ BEGIN
 CREATE TYPE "step_status" AS ENUM('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED', 'SKIPPED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "step_type" AS ENUM('TASK', 'SUBWORKFLOW', 'TIMER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "timer_type" AS ENUM('DELAY', 'RETRY', 'TIMEOUT', 'SCHEDULE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "workflow_status" AS ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "idempotency_key" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner" text NOT NULL,
	"key" text NOT NULL,
	"resource_id" text,
	"response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone,
	"ttl" timestamp with time zone,
	CONSTRAINT "owner_key_unique" UNIQUE("owner","key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_attempt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" text NOT NULL,
	"workflow_id" uuid,
	"step_id" uuid,
	"attempt" integer NOT NULL,
	"status" text NOT NULL,
	"error" text,
	"result" jsonb,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "timer_type" NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"when" timestamp with time zone NOT NULL,
	"payload" jsonb,
	"fired_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"cancelled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"tenant_id" text,
	"input" jsonb NOT NULL,
	"state" jsonb,
	"status" "workflow_status" DEFAULT 'PENDING' NOT NULL,
	"current_step" integer,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_step" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"step_index" integer NOT NULL,
	"name" text NOT NULL,
	"type" "step_type" DEFAULT 'TASK' NOT NULL,
	"payload" jsonb NOT NULL,
	"result" jsonb,
	"status" "step_status" DEFAULT 'PENDING' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"next_run_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "workflow_step_unique" UNIQUE("workflow_id","step_index")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idempotency_created_at_idx" ON "idempotency_key" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idempotency_used_at_idx" ON "idempotency_key" ("used_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_attempt_job_idx" ON "job_attempt" ("job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_attempt_workflow_idx" ON "job_attempt" ("workflow_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_attempt_step_idx" ON "job_attempt" ("step_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timer_when_idx" ON "timer" ("when");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timer_type_idx" ON "timer" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timer_target_idx" ON "timer" ("target_type","target_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_status_idx" ON "workflow" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_type_idx" ON "workflow" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_tenant_idx" ON "workflow" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_created_at_idx" ON "workflow" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "history_workflow_idx" ON "workflow_history" ("workflow_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "history_event_type_idx" ON "workflow_history" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "history_created_at_idx" ON "workflow_history" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "step_workflow_idx" ON "workflow_step" ("workflow_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "step_status_idx" ON "workflow_step" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "step_scheduled_idx" ON "workflow_step" ("scheduled_at");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_attempt" ADD CONSTRAINT "job_attempt_workflow_id_workflow_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_attempt" ADD CONSTRAINT "job_attempt_step_id_workflow_step_id_fk" FOREIGN KEY ("step_id") REFERENCES "workflow_step"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_history" ADD CONSTRAINT "workflow_history_workflow_id_workflow_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_step" ADD CONSTRAINT "workflow_step_workflow_id_workflow_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
