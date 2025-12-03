import type { BatchChunkSelect } from '../repositories/batch-chunk';

export class ChunkService {
  async createChunk(
    batchId: string,
    chunkIndex: number,
    startRow: number,
    endRow: number
  ): Promise<BatchChunkSelect> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async assignWorkflowStep(chunkId: string, stepId: string): Promise<BatchChunkSelect | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async markChunkStatus(chunkId: string, status: string): Promise<BatchChunkSelect | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async allChunksCompleted(batchId: string): Promise<boolean> {
    // TODO: Implement
    throw new Error('Not implemented');
  }
}

