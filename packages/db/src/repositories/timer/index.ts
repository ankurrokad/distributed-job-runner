import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { timer } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type TimerSelect = InferSelectModel<typeof timer>;
export type TimerInsert = InferInsertModel<typeof timer>;

export class TimerRepository extends BaseRepository<
  typeof timer,
  TimerSelect,
  TimerInsert
> {
  constructor(db: NodePgDatabase) {
    super(db, timer, 'id');
  }

  // Add timer-specific methods here
}

