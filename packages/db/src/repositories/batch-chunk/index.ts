import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { batchChunk } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { eq, and } from 'drizzle-orm';

export type BatchChunkSelect = InferSelectModel<typeof batchChunk>;
export type BatchChunkInsert = InferInsertModel<typeof batchChunk>;

export class BatchChunkRepository extends BaseRepository<
  typeof batchChunk,
  BatchChunkSelect,
  BatchChunkInsert
> {
  constructor(db: NodePgDatabase) {
    super(db, batchChunk, 'id');
  }

  async createChunk(
    batchId: string,
    chunkIndex: number,
    startRow: number,
    endRow: number,
    workflowStepId?: string
  ): Promise<BatchChunkSelect> {
    const totalRows = endRow - startRow + 1;

    return this.create({
      batchId,
      chunkIndex,
      startRow,
      endRow,
      totalRows,
      workflowStepId: workflowStepId || null,
    } as BatchChunkInsert);
  }

  async markChunkStatus(chunkId: string, status: string): Promise<BatchChunkSelect | null> {
    return this.updateById(chunkId, {
      status,
    });
  }

  async findChunksForBatch(batchId: string): Promise<BatchChunkSelect[]> {
    return this.findMany(eq((this.table as any).batchId, batchId));
  }

  async countChunksByStatus(batchId: string, status: string): Promise<number> {
    return this.count(
      and(eq((this.table as any).batchId, batchId), eq((this.table as any).status, status))
    );
  }

  async findChunkByStep(stepId: string): Promise<BatchChunkSelect | null> {
    return this.findOne(eq((this.table as any).workflowStepId, stepId));
  }
}
