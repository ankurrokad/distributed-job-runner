import { Queue } from 'bullmq';
import { connection } from './connection';

export const defaultQueue = new Queue('default', { connection });

// Export queue factory for creating named queues
export function createQueue(name: string): Queue {
  return new Queue(name, { connection });
}

