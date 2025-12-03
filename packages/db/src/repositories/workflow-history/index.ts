import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { workflowHistory } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { eq, desc } from 'drizzle-orm';

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

  async log(
    workflowId: string,
    eventType: string,
    payload?: Record<string, any>,
    meta?: Record<string, any>
  ): Promise<WorkflowHistorySelect> {
    return this.create({
      workflowId,
      eventType,
      payload: payload || null,
      meta: meta || null,
    } as WorkflowHistoryInsert);
  }

  async getTimeline(workflowId: string): Promise<WorkflowHistorySelect[]> {
    const results = await this.db
      .select()
      .from(this.table as any)
      .where(eq((this.table as any).workflowId, workflowId))
      .orderBy(desc((this.table as any).createdAt));

    return results as WorkflowHistorySelect[];
  }
}

