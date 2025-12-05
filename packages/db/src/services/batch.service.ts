import { BatchRepository } from '../repositories';

export class BatchService {
  constructor(private readonly batchRepo: BatchRepository) {}

  async getBatchRawData(batchId: string) {
    const batch = await this.batchRepo.findById(batchId);
    if (!batch) throw new Error(`Batch not found: ${batchId}`);
    return batch.rawData;
  }

  async updateStatus(batchId: string, status: string)  {
    await this.batchRepo.updateById(batchId, {
      status,
      updatedAt: new Date(),
    });
  }
}
