import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { jobAttempt } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type JobAttemptSelect = InferSelectModel<typeof jobAttempt>;
export type JobAttemptInsert = InferInsertModel<typeof jobAttempt>;

export class JobAttemptRepository extends BaseRepository<
  typeof jobAttempt,
  JobAttemptSelect,
  JobAttemptInsert
> {
  constructor(db: NodePgDatabase) {
    super(db, jobAttempt, 'id');
  }

  // Add job-attempt-specific methods here
}

