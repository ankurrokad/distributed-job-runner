import { Producer } from '@repo/queue';
import { WorkflowHistoryRepository, WorkflowRepository } from '../repositories';
import { WorkflowStepService } from './workflow-step.service';
import { withTransaction } from '../client';

export class WorkflowService {
  constructor(
    private readonly workflowRepo: WorkflowRepository,
    private readonly stepService: WorkflowStepService,
    private readonly historyRepo: WorkflowHistoryRepository,
    private readonly producer: Producer
  ) {}

  /* -------------------------------------------------------
     startWorkflow — create workflow + initial step + enqueue
  ------------------------------------------------------- */
  async startWorkflow(type: string, input: any) {
    return withTransaction(async () => {
      const workflow = await this.workflowRepo.create({
        type,
        input,
        status: 'PENDING',
      });

      // create step
      const step = await this.stepService.createStep(workflow.id, 'ingest_batch', {
        batchId: input.batchId,
      });

      // log
      await this.historyRepo.create({
        workflowId: workflow.id,
        eventType: 'WORKFLOW_STARTED',
        payload: {},
      });

      // enqueue job (MATCHING your payload!)
      await this.producer.enqueue({
        workflowId: workflow.id,
        stepId: step.id,
        data: step.payload,
      });

      return workflow;
    });
  }

  /* -------------------------------------------------------
     markWorkflowFailed
  ------------------------------------------------------- */
  async markWorkflowFailed(workflowId: string, error: string) {
    await this.workflowRepo.updateById(workflowId, {
      status: 'FAILED',
      failedAt: new Date(),
      updatedAt: new Date(),
    });

    await this.historyRepo.create({
      workflowId,
      eventType: 'WORKFLOW_FAILED',
      payload: { error },
    });
  }

  /* -------------------------------------------------------
     markWorkflowCompleted
  ------------------------------------------------------- */
  async markWorkflowCompleted(workflowId: string) {
    await this.workflowRepo.updateById(workflowId, {
      status: 'SUCCESS',
      completedAt: new Date(),
      updatedAt: new Date(),
    });

    await this.historyRepo.create({
      workflowId,
      eventType: 'WORKFLOW_COMPLETED',
      payload: {},
    });
  }
}
