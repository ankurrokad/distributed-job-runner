import { withTransaction } from '../client';
import { WorkflowHistoryRepository, WorkflowStepRepository } from '../repositories';
import { workflowStep } from '../schema';
import { eq } from 'drizzle-orm';

export class WorkflowStepService {
  constructor(
    private readonly stepRepo: WorkflowStepRepository,
    private readonly historyRepo: WorkflowHistoryRepository
  ) {}

  /* -------------------------------------------------------
     claimStep — atomic, IN_PROGRESS, +attempts
  ------------------------------------------------------- */
  async claimStep(stepId: string) {
    return withTransaction(async () => {
      const step = await this.stepRepo.findById(stepId);
      if (!step) throw new Error(`Step not found: ${stepId}`);

      if (step.status !== 'PENDING') {
        throw new Error(`Cannot claim step ${stepId}, status = ${step.status}`);
      }

      await this.stepRepo.updateById(stepId, {
        status: 'IN_PROGRESS',
        attempts: step.attempts + 1,
        updatedAt: new Date(),
      });

      await this.historyRepo.create({
        workflowId: step.workflowId,
        eventType: 'STEP_CLAIMED',
        payload: { stepId },
      });

      return step;
    });
  }

  /* -------------------------------------------------------
     markStepSuccess
  ------------------------------------------------------- */
  async markStepSuccess(stepId: string, result?: any) {
    return withTransaction(async () => {
      const step = await this.stepRepo.findById(stepId);
      if (!step) throw new Error(`Step not found: ${stepId}`);

      await this.stepRepo.updateById(stepId, {
        status: 'SUCCESS',
        result: result ?? null,
        updatedAt: new Date(),
      });

      await this.historyRepo.create({
        workflowId: step.workflowId,
        eventType: 'STEP_SUCCESS',
        payload: { stepId, result },
      });

      return true;
    });
  }

  /* -------------------------------------------------------
     markStepFailed
  ------------------------------------------------------- */
  async markStepFailed(stepId: string, error: string) {
    return withTransaction(async () => {
      const step = await this.stepRepo.findById(stepId);
      if (!step) throw new Error(`Step not found: ${stepId}`);

      await this.stepRepo.updateById(stepId, {
        status: 'FAILED',
        lastError: error,
        updatedAt: new Date(),
      });

      await this.historyRepo.create({
        workflowId: step.workflowId,
        eventType: 'STEP_FAILED',
        payload: { stepId, error },
      });

      return true;
    });
  }

  /* -------------------------------------------------------
     createStep — determine stepIndex automatically
  ------------------------------------------------------- */
  async createStep(
    workflowId: string,
    name: string,
    payload: any,
    opts?: { parallelGroup?: string; maxRetries?: number }
  ) {
    const count = await this.stepRepo.count(eq(workflowStep.workflowId, workflowId));

    const step = await this.stepRepo.create({
      workflowId,
      name,
      payload,
      stepIndex: count,
      parallelGroup: opts?.parallelGroup ?? null,
      maxRetries: opts?.maxRetries ?? 3,
      status: 'PENDING',
    });

    await this.historyRepo.create({
      workflowId,
      eventType: 'STEP_CREATED',
      payload: { stepId: step.id, name },
    });

    return step;
  }
}
