import type { CreateStepOptions, WorkflowStepSelect } from '../repositories/workflow-step';

export class WorkflowStepService {
  async createStep(
    workflowId: string,
    name: string,
    payload: Record<string, any>,
    opts?: CreateStepOptions
  ): Promise<WorkflowStepSelect> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async claimStep(stepId: string): Promise<WorkflowStepSelect | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async markStepSuccess(stepId: string, result?: Record<string, any>): Promise<WorkflowStepSelect | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async markStepFailed(stepId: string, error: string): Promise<WorkflowStepSelect | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async allStepsInGroupSucceeded(workflowId: string, group: string): Promise<boolean> {
    // TODO: Implement
    throw new Error('Not implemented');
  }
}
