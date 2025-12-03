import type { BatchSelect } from '../repositories/batch';

export class BatchService {
  async createBatch(name: string, rawJson: Record<string, any>): Promise<BatchSelect> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async updateBatchStatus(batchId: string, status: string): Promise<BatchSelect | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async getBatchRawData(batchId: string): Promise<Record<string, any> | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }
}

