import {
  pgEnum,
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  integer,
  boolean,
  index,
  unique,
} from 'drizzle-orm/pg-core';

// ======================================================
// ENUMS
// ======================================================

export const workflowStatus = pgEnum('workflow_status', [
  'PENDING',
  'RUNNING',
  'SUCCESS',
  'FAILED',
  'CANCELLED',
]);

export const stepStatus = pgEnum('step_status', [
  'PENDING',
  'IN_PROGRESS',
  'SUCCESS',
  'FAILED',
  'SKIPPED',
]);

export const timerType = pgEnum('timer_type', ['DELAY', 'RETRY', 'TIMEOUT', 'SCHEDULE']);

export const stepType = pgEnum('step_type', ['TASK', 'SUBWORKFLOW', 'TIMER']);

// ======================================================
// TABLE: workflow
// ======================================================

export const workflow = pgTable(
  'workflow',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(),
    tenantId: text('tenant_id'),
    input: jsonb('input').notNull(),
    state: jsonb('state'),
    status: workflowStatus('status').notNull().default('PENDING'),
    currentStep: integer('current_step'),
    attempts: integer('attempts').notNull().default(0),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    statusIdx: index('workflow_status_idx').on(table.status),
    typeIdx: index('workflow_type_idx').on(table.type),
    tenantIdx: index('workflow_tenant_idx').on(table.tenantId),
    createdAtIdx: index('workflow_created_at_idx').on(table.createdAt),
  })
);

// ======================================================
// TABLE: workflow_step
// ======================================================

export const workflowStep = pgTable(
  'workflow_step',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workflowId: uuid('workflow_id')
      .notNull()
      .references(() => workflow.id, { onDelete: 'cascade' }),

    stepIndex: integer('step_index').notNull(),
    name: text('name').notNull(),
    type: stepType('type').notNull().default('TASK'),
    payload: jsonb('payload').notNull(),
    result: jsonb('result'),
    status: stepStatus('status').notNull().default('PENDING'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    nextRunAt: timestamp('next_run_at', { withTimezone: true }),
    attempts: integer('attempts').notNull().default(0),
    maxRetries: integer('max_retries').notNull().default(3),
    lastError: text('last_error'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    workflowIdx: index('step_workflow_idx').on(table.workflowId),
    statusIdx: index('step_status_idx').on(table.status),
    scheduledIdx: index('step_scheduled_idx').on(table.scheduledAt),
    uniqueStep: unique('workflow_step_unique').on(table.workflowId, table.stepIndex),
  })
);

// ======================================================
// TABLE: workflow_history
// ======================================================

export const workflowHistory = pgTable(
  'workflow_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workflowId: uuid('workflow_id')
      .notNull()
      .references(() => workflow.id, { onDelete: 'cascade' }),

    eventType: text('event_type').notNull(),
    payload: jsonb('payload'),
    meta: jsonb('meta'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    workflowIdx: index('history_workflow_idx').on(table.workflowId),
    eventTypeIdx: index('history_event_type_idx').on(table.eventType),
    createdAtIdx: index('history_created_at_idx').on(table.createdAt),
  })
);

// ======================================================
// TABLE: idempotency_key
// ======================================================

export const idempotencyKey = pgTable(
  'idempotency_key',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    owner: text('owner').notNull(),
    key: text('key').notNull(),

    resourceId: text('resource_id'),
    response: jsonb('response'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    ttl: timestamp('ttl', { withTimezone: true }),
  },
  (table) => ({
    uniqueOwnerKey: unique('owner_key_unique').on(table.owner, table.key),
    createdAtIdx: index('idempotency_created_at_idx').on(table.createdAt),
    usedAtIdx: index('idempotency_used_at_idx').on(table.usedAt),
  })
);

// ======================================================
// TABLE: timer
// ======================================================

export const timer = pgTable(
  'timer',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: timerType('type').notNull(),

    targetType: text('target_type').notNull(),
    targetId: text('target_id').notNull(),

    when: timestamp('when', { withTimezone: true }).notNull(),
    payload: jsonb('payload'),

    firedAt: timestamp('fired_at', { withTimezone: true }),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(3),
    cancelled: boolean('cancelled').notNull().default(false),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    whenIdx: index('timer_when_idx').on(table.when),
    typeIdx: index('timer_type_idx').on(table.type),
    targetIdx: index('timer_target_idx').on(table.targetType, table.targetId),
  })
);

// ======================================================
// TABLE: job_attempt
// ======================================================

export const jobAttempt = pgTable(
  'job_attempt',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: text('job_id').notNull(),

    workflowId: uuid('workflow_id').references(() => workflow.id),
    stepId: uuid('step_id').references(() => workflowStep.id),

    attempt: integer('attempt').notNull(),
    status: text('status').notNull(),
    error: text('error'),
    result: jsonb('result'),

    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
  },
  (table) => ({
    jobIdx: index('job_attempt_job_idx').on(table.jobId),
    workflowIdx: index('job_attempt_workflow_idx').on(table.workflowId),
    stepIdx: index('job_attempt_step_idx').on(table.stepId),
  })
);
