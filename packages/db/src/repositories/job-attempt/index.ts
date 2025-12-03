import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { jobAttempt } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type JobAttemptSelect = InferSelectModel<typeof jobAttempt>;
export type JobAttemptInsert = InferInsertModel<typeof jobAttempt>;

export class JobAttemptRepository extends BaseRepository<
  typeof jobAttempt,
  JobAttemptSelect,
  JobAttemptInsert
> {
  constructor(db: NodePgDatabase) {
    super(db, jobAttempt, 'id');
  }

  async createAttempt(
    jobId: string,
    attempt: number,
    workflowId?: string,
    stepId?: string
  ): Promise<JobAttemptSelect> {
    return this.create({
      jobId,
      attempt,
      workflowId: workflowId || null,
      stepId: stepId || null,
      status: 'RUNNING',
    } as JobAttemptInsert);
  }

  async finishAttempt(
    id: string,
    status: string,
    error?: string,
    result?: Record<string, any>
  ): Promise<JobAttemptSelect | null> {
    return this.updateById(id, {
      status,
      error: error || null,
      result: result || null,
      finishedAt: new Date(),
    });
  }
}

