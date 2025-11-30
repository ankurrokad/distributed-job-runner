import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { workflowHistory } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type WorkflowHistorySelect = InferSelectModel<typeof workflowHistory>;
export type WorkflowHistoryInsert = InferInsertModel<typeof workflowHistory>;

export class WorkflowHistoryRepository extends BaseRepository<
  typeof workflowHistory,
  WorkflowHistorySelect,
  WorkflowHistoryInsert
> {
  constructor(db: NodePgDatabase) {
    super(db, workflowHistory, 'id');
  }

  // Add workflow-history-specific methods here
}

