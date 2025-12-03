import type { TimerSelect } from '../repositories/timer';

export class TimerService {
  async scheduleTimer(
    type: 'DELAY' | 'RETRY' | 'TIMEOUT' | 'SCHEDULE',
    targetType: string,
    targetId: string,
    when: Date,
    payload?: Record<string, any>
  ): Promise<TimerSelect> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async fetchDueTimers(): Promise<TimerSelect[]> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async markTimerFired(id: string): Promise<TimerSelect | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async cancelTimersForTarget(targetType: string, targetId: string): Promise<TimerSelect[]> {
    // TODO: Implement
    throw new Error('Not implemented');
  }
}

