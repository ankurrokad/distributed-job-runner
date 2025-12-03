import type { WorkflowSelect } from '../repositories/workflow';

export class WorkflowService {
  async startWorkflow(type: string, input: Record<string, any>): Promise<WorkflowSelect> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async markWorkflowRunning(workflowId: string): Promise<WorkflowSelect | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async markWorkflowCompleted(workflowId: string): Promise<WorkflowSelect | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async markWorkflowFailed(workflowId: string, error: string): Promise<WorkflowSelect | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async pauseWorkflow(workflowId: string): Promise<WorkflowSelect | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async resumeWorkflow(workflowId: string): Promise<WorkflowSelect | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }
}

