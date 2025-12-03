import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { workflowStep } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { eq, and, sql } from 'drizzle-orm';

export type WorkflowStepSelect = InferSelectModel<typeof workflowStep>;
export type WorkflowStepInsert = InferInsertModel<typeof workflowStep>;

export interface CreateStepOptions {
  parallelGroup?: string;
  maxRetries?: number;
  stepIndex?: number;
}

export class WorkflowStepRepository extends BaseRepository<
  typeof workflowStep,
  WorkflowStepSelect,
  WorkflowStepInsert
> {
  constructor(db: NodePgDatabase) {
    super(db, workflowStep, 'id');
  }

  async createStep(
    workflowId: string,
    name: string,
    payload: Record<string, any>,
    options: CreateStepOptions = {}
  ): Promise<WorkflowStepSelect> {
    const { parallelGroup, maxRetries = 3, stepIndex } = options;
    
    return this.create({
      workflowId,
      name,
      payload,
      parallelGroup: parallelGroup || null,
      maxRetries,
      stepIndex: stepIndex ?? 0,
    } as WorkflowStepInsert);
  }

  async claimStep(stepId: string, txDb?: NodePgDatabase): Promise<WorkflowStepSelect | null> {
    const db = txDb || this.db;
    
    // Check status within the same transaction context
    const idColumn = (this.table as any).id;
    const [step] = await db
      .select()
      .from(this.table as any)
      .where(eq(idColumn, stepId))
      .limit(1);
    
    if (!step || step.status !== 'PENDING') {
      return null;
    }

    const tableColumn = (this.table as any).attempts;
    
    const result = await db
      .update(this.table as any)
      .set({
        status: 'IN_PROGRESS',
        attempts: sql`${tableColumn} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(idColumn, stepId))
      .returning();

    const results = Array.isArray(result) ? result : [result];
    return (results[0] as WorkflowStepSelect) || null;
  }

  async markStepSuccess(stepId: string, result?: Record<string, any>): Promise<WorkflowStepSelect | null> {
    return this.updateById(stepId, {
      status: 'SUCCESS',
      result: result || null,
      updatedAt: new Date(),
    });
  }

  async markStepFailed(stepId: string, error: string): Promise<WorkflowStepSelect | null> {
    return this.updateById(stepId, {
      status: 'FAILED',
      lastError: error,
      updatedAt: new Date(),
    });
  }

  async findPendingSteps(workflowId: string): Promise<WorkflowStepSelect[]> {
    return this.findMany(
      and(
        eq((this.table as any).workflowId, workflowId),
        eq((this.table as any).status, 'PENDING')
      )
    );
  }

  async countStepsByStatus(workflowId: string, status: string): Promise<number> {
    return this.count(
      and(
        eq((this.table as any).workflowId, workflowId),
        eq((this.table as any).status, status)
      )
    );
  }

  async findStepsInParallelGroup(workflowId: string, group: string): Promise<WorkflowStepSelect[]> {
    return this.findMany(
      and(
        eq((this.table as any).workflowId, workflowId),
        eq((this.table as any).parallelGroup, group)
      )
    );
  }

  async findNextRunnableStep(workflowId: string): Promise<WorkflowStepSelect | null> {
    const steps = await this.findMany(
      and(
        eq((this.table as any).workflowId, workflowId),
        eq((this.table as any).status, 'PENDING')
      )
    );

    if (steps.length === 0) return null;

    // Sort by stepIndex and return the first one
    steps.sort((a, b) => a.stepIndex - b.stepIndex);
    return steps[0];
  }
}

