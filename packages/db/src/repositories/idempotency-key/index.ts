import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { idempotencyKey } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type IdempotencyKeySelect = InferSelectModel<typeof idempotencyKey>;
export type IdempotencyKeyInsert = InferInsertModel<typeof idempotencyKey>;

export class IdempotencyKeyRepository extends BaseRepository<
  typeof idempotencyKey,
  IdempotencyKeySelect,
  IdempotencyKeyInsert
> {
  constructor(db: NodePgDatabase) {
    super(db, idempotencyKey, 'id');
  }

  // Add idempotency-key-specific methods here
}

