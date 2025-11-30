import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { workflow } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type WorkflowSelect = InferSelectModel<typeof workflow>;
export type WorkflowInsert = InferInsertModel<typeof workflow>;

export class WorkflowRepository extends BaseRepository<
  typeof workflow,
  WorkflowSelect,
  WorkflowInsert
> {
  constructor(db: NodePgDatabase) {
    super(db, workflow, 'id');
  }

  // Add workflow-specific methods here
  // Example:
  // async doSomethingWithWorkflow(): Promise<void> {
  //   // Implementation
  // }
}

