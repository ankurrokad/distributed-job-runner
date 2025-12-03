import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { workflow } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { eq, sql } from 'drizzle-orm';

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

  async markRunning(workflowId: string): Promise<WorkflowSelect | null> {
    return this.updateById(workflowId, {
      status: 'RUNNING',
      updatedAt: new Date(),
    });
  }

  async markCompleted(workflowId: string): Promise<WorkflowSelect | null> {
    return this.updateById(workflowId, {
      status: 'SUCCESS',
      completedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async markFailed(workflowId: string, _error?: string): Promise<WorkflowSelect | null> {
    return this.updateById(workflowId, {
      status: 'FAILED',
      failedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async pause(workflowId: string): Promise<WorkflowSelect | null> {
    return this.updateById(workflowId, {
      isPaused: true,
      updatedAt: new Date(),
    });
  }

  async resume(workflowId: string): Promise<WorkflowSelect | null> {
    return this.updateById(workflowId, {
      isPaused: false,
      updatedAt: new Date(),
    });
  }

  async incrementAttempts(workflowId: string): Promise<WorkflowSelect | null> {
    const tableColumn = (this.table as any).attempts;
    const idColumn = (this.table as any).id;
    
    const result = await this.db
      .update(this.table as any)
      .set({
        attempts: sql`${tableColumn} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(idColumn, workflowId))
      .returning();

    const results = Array.isArray(result) ? result : [result];
    return (results[0] as WorkflowSelect) || null;
  }

  async isWorkflowDone(workflowId: string): Promise<boolean> {
    const wf = await this.findById(workflowId);
    if (!wf) return false;
    return wf.status === 'SUCCESS' || wf.status === 'FAILED' || wf.status === 'CANCELLED';
  }
}

