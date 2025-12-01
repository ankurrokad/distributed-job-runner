import { Queue } from "bullmq";
import { JobPayload, EnqueueOptions } from "../types";

export class Producer {
  constructor(private queue: Queue) {}

  async enqueue<T>(payload: JobPayload<T>, opts?: EnqueueOptions) {
    return this.queue.add(
      "step",
      payload,
      {
        jobId: opts?.jobId ?? `${payload.workflowId}:${payload.stepId}:${Date.now()}`,
        attempts: opts?.attempts ?? 3,
        backoff: opts?.backoff ?? { type: "exponential", delay: 1000 },
        delay: opts?.delayMs,
        removeOnComplete: opts?.removeOnComplete ?? 1000,
        removeOnFail: opts?.removeOnFail ?? 500,
      }
    );
  }
}

