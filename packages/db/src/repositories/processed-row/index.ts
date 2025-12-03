import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { processedRow } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

export type ProcessedRowSelect = InferSelectModel<typeof processedRow>;
export type ProcessedRowInsert = InferInsertModel<typeof processedRow>;

export class ProcessedRowRepository extends BaseRepository<
  typeof processedRow,
  ProcessedRowSelect,
  ProcessedRowInsert
> {
  constructor(db: NodePgDatabase) {
    super(db, processedRow, 'id');
  }

  async insertMany(rows: ProcessedRowInsert[]): Promise<ProcessedRowSelect[]> {
    if (rows.length === 0) return [];

    const results = await this.db
      .insert(this.table as any)
      .values(rows as any)
      .returning();

    return results as ProcessedRowSelect[];
  }

  async countByBatch(batchId: string): Promise<number> {
    return this.count(eq((this.table as any).batchId, batchId));
  }
}
