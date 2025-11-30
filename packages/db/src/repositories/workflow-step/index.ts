import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { workflowStep } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type WorkflowStepSelect = InferSelectModel<typeof workflowStep>;
export type WorkflowStepInsert = InferInsertModel<typeof workflowStep>;

export class WorkflowStepRepository extends BaseRepository<
  typeof workflowStep,
  WorkflowStepSelect,
  WorkflowStepInsert
> {
  constructor(db: NodePgDatabase) {
    super(db, workflowStep, 'id');
  }

  // Add workflow-step-specific methods here
}

