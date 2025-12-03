import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base/repository';
import { timer } from '../../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { eq, and, lte, isNull } from 'drizzle-orm';

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

  async createTimer(
    type: 'DELAY' | 'RETRY' | 'TIMEOUT' | 'SCHEDULE',
    targetType: string,
    targetId: string,
    when: Date,
    payload?: Record<string, any>
  ): Promise<TimerSelect> {
    return this.create({
      type,
      targetType,
      targetId,
      when,
      payload: payload || null,
    } as TimerInsert);
  }

  async findDueTimers(now: Date): Promise<TimerSelect[]> {
    const whenCondition = lte((this.table as any).when, now);
    const firedAtCondition = isNull((this.table as any).firedAt);
    const cancelledCondition = eq((this.table as any).cancelled, false);
    
    return this.findMany(
      and(whenCondition, firedAtCondition, cancelledCondition)!
    );
  }

  async markFired(timerId: string): Promise<TimerSelect | null> {
    return this.updateById(timerId, {
      firedAt: new Date(),
    });
  }

  async cancelTimersForTarget(targetType: string, targetId: string): Promise<TimerSelect[]> {
    const targetTypeCondition = eq((this.table as any).targetType, targetType);
    const targetIdCondition = eq((this.table as any).targetId, targetId);
    
    return this.update(
      and(targetTypeCondition, targetIdCondition)!,
      {
        cancelled: true,
      }
    );
  }
}

