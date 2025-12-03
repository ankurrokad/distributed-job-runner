import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { errorRow } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

export type ErrorRowSelect = InferSelectModel<typeof errorRow>;
export type ErrorRowInsert = InferInsertModel<typeof errorRow>;

export class ErrorRowRepository extends BaseRepository<
  typeof errorRow,
  ErrorRowSelect,
  ErrorRowInsert
> {
  constructor(db: NodePgDatabase) {
    super(db, errorRow, 'id');
  }

  async insertMany(rows: ErrorRowInsert[]): Promise<ErrorRowSelect[]> {
    if (rows.length === 0) return [];

    const results = await this.db
      .insert(this.table as any)
      .values(rows as any)
      .returning();

    return results as ErrorRowSelect[];
  }

  async countByBatch(batchId: string): Promise<number> {
    return this.count(eq((this.table as any).batchId, batchId));
  }
}
