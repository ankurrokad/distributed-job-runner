export type JobPayload<T = any> = {
  workflowId: string;
  stepId: string;
  data: T;
  attempt?: number;
};

export type EnqueueOptions = {
  jobId?: string;
  attempts?: number;
  delayMs?: number;
  backoff?: { type: "fixed" | "exponential"; delay: number };
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
  idempotencyKey?: string;
};

