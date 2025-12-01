import { Job, Worker, WorkerOptions } from "bullmq";
import { getRedisConnection, RedisConfig } from "../redis.connection";
import { JobPayload } from "../types";
import { log } from "../logger";

export abstract class BaseConsumer<T = any> {
  protected worker: Worker;

  constructor(
    public queueName: string,
    cfg?: {
      redis?: RedisConfig;
      concurrency?: number;
      lockDuration?: number;
    }
  ) {
    const opts: WorkerOptions = {
      connection: getRedisConnection(cfg?.redis),
      concurrency: cfg?.concurrency ?? 5,
      lockDuration: cfg?.lockDuration ?? 30000,
    };

    this.worker = new Worker(
      queueName,
      async (job: Job) => {
        const payload = job.data as JobPayload<T>;
        await this.claim(payload, job);

        try {
          const result = await this.handle(payload, job);
          await this.onSuccess(payload, job, result);
          return result;
        } catch (err) {
          await this.onError(payload, job, err);
          throw err;
        } finally {
          await this.release(payload, job);
        }
      },
      opts
    );

    this.worker.on("failed", (job, err) => {
      log(`❌ Job ${job?.id} failed in ${queueName}: ${err.message}`);
    });
  }

  // ---------- Worker Lifecycle Methods ----------

  abstract handle(payload: JobPayload<T>, job: Job): Promise<any>;

  async claim(_payload: JobPayload<T>, _job: Job) {}
  async release(_payload: JobPayload<T>, _job: Job) {}
  async onSuccess(_p: JobPayload<T>, _j: Job, _res: any) {}
  async onError(_p: JobPayload<T>, _j: Job, _err: any) {}

  async start() {
    return this.worker;
  }

  async close() {
    await this.worker.close();
  }
}

