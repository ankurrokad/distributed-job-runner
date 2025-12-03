import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { batch, processedRow, errorRow } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { eq, count } from 'drizzle-orm';

export type BatchSelect = InferSelectModel<typeof batch>;
export type BatchInsert = InferInsertModel<typeof batch>;

export class BatchRepository extends BaseRepository<
  typeof batch,
  BatchSelect,
  BatchInsert
> {
  constructor(db: NodePgDatabase) {
    super(db, batch, 'id');
  }

  async setStatus(batchId: string, status: string): Promise<BatchSelect | null> {
    return this.updateById(batchId, {
      status,
      updatedAt: new Date(),
    });
  }

  async incrementProcessedCount(batchId: string, _count?: number): Promise<number> {
    // Count from processedRow table (count parameter reserved for future use if counter field is added)
    const [result] = await this.db
      .select({ count: count() })
      .from(processedRow)
      .where(eq(processedRow.batchId, batchId));

    return Number(result?.count ?? 0);
  }

  async incrementErrorCount(batchId: string, _count?: number): Promise<number> {
    // Count from errorRow table (count parameter reserved for future use if counter field is added)
    const [result] = await this.db
      .select({ count: count() })
      .from(errorRow)
      .where(eq(errorRow.batchId, batchId));

    return Number(result?.count ?? 0);
  }

  async getRawData(batchId: string): Promise<Record<string, any> | null> {
    const batch = await this.findById(batchId);
    return batch?.rawData || null;
  }
}

