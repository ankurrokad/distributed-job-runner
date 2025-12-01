import { Queue, QueueOptions } from "bullmq";
import { getRedisConnection, RedisConfig } from "../redis.connection";

const queues = new Map<string, Queue>();

export function getQueue(
  name: string,
  cfg?: { redis?: RedisConfig; jobDefaults?: QueueOptions["defaultJobOptions"] }
): Queue {
  if (queues.has(name)) return queues.get(name)!;

  const q = new Queue(name, {
    connection: getRedisConnection(cfg?.redis),
    defaultJobOptions: cfg?.jobDefaults,
  });

  queues.set(name, q);
  return q;
}

export async function closeAllQueues() {
  await Promise.all(
    [...queues.values()].map((q) => q.close().catch(() => null))
  );
  queues.clear();
}

