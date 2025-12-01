## `@distributed-job-runner/queue`

Queue abstraction for the distributed job runner, built on **BullMQ** and **Redis**.  
It defines how workflow steps become background jobs, how they are retried, and how workers are wired up in a consistent way.

### Big picture: what this package does

- Encodes the **contract** for jobs via `JobPayload` and `EnqueueOptions`.
- Centralizes creation and caching of BullMQ queues and connection options.
- Provides a small **producer API** that knows how to construct job IDs, retries, and backoff strategies.
- Provides a **consumer base class** that standardizes the job lifecycle (claim → handle → success/error → release) and logging.
- Offers a **registrar** that can start and stop a group of consumers together (useful for worker services).

This keeps Redis/BullMQ details behind a thin layer so the rest of the system thinks in terms of “workflow step jobs” instead of raw queues.

### JobPayload: how a unit of work is modeled

`JobPayload<T>` is the core representation of a single unit of work:

- **`workflowId`**: which workflow this job belongs to.
- **`stepId`**: which step inside the workflow this job represents.
- **`data`**: step‑specific payload (`T`) that the worker needs to execute.
- **`attempt`**: (optional) explicit attempt count, in addition to BullMQ’s retry counters.

This shape allows workers to:

- Look up and update the right workflow and step rows in the database.
- Attach history entries or metrics keyed by `(workflowId, stepId)`.
- Implement idempotency / deduplication behaviors on top of these identifiers.

### EnqueueOptions: how retries and scheduling work

`EnqueueOptions` controls how BullMQ will execute the job:

- **`jobId`**: explicit logical identifier; by default the `Producer` creates a unique ID from `workflowId`, `stepId`, and a timestamp.
- **`attempts`**: how many times BullMQ should retry on failure.
- **`delayMs`**: schedule the job in the future (used for delayed steps or retry backoff).
- **`backoff`**: strategy (`fixed` / `exponential`) plus a base delay, which BullMQ uses between retries.
- **`removeOnComplete` / `removeOnFail`**: how aggressively to clean up finished/failed jobs from Redis.
- **`idempotencyKey`**: a logical key you can feed into higher‑level systems (e.g. DB‑backed idempotency) to prevent duplicate work.

Together, these options define **when** a step runs, **how often** it is retried, and how much historical job state is kept around.

### Queue creation and caching

`getQueue(name, cfg?)` is a small factory + cache around BullMQ `Queue`:

- It keeps a `Map<string, Queue>` so each queue name is only instantiated once per process.
- It wires in a `connection` built by `getRedisConnection`, and optional `defaultJobOptions`.
- `closeAllQueues()` iterates over all created queues, closes them, and clears the cache to allow clean shutdowns.

This design ensures that:

- All producers and consumers targeting the same logical queue share a single underlying BullMQ queue instance.
- Worker processes can shut down gracefully without leaking Redis connections.

### Producer: how jobs enter the system

The `Producer` wraps a BullMQ `Queue` and knows the conventions for this project:

- It always uses the job name `"step"` (so workers can focus entirely on payload, not routing by name).
- It fills in sane defaults for job options:
  - Generates a default `jobId` from `workflowId`, `stepId`, and `Date.now()` if you don’t provide one.
  - Defaults `attempts` to `3`, with an **exponential backoff** of `1000ms`.
  - Uses `removeOnComplete = 1000` and `removeOnFail = 500` to bound Redis storage use.

The idea is that callers usually only care about **what** to run (`JobPayload`) and **maybe** how many retries they want; the rest is standardized.

### BaseConsumer: how jobs are processed

`BaseConsumer` defines the template for workers:

- It creates a BullMQ `Worker` for a given `queueName` with:
  - `connection` from `getRedisConnection`.
  - `concurrency` and `lockDuration` controls (with reasonable defaults).
- Every incoming job is processed through a fixed pipeline:
  1. Convert `job.data` into a `JobPayload<T>`.
  2. Call `claim(payload, job)` – hook for acquiring locks, marking the job as “in progress”, etc.
  3. Call `handle(payload, job)` – **required** method where the real work happens.
  4. Call `onSuccess(payload, job, result)` on success.
  5. Call `onError(payload, job, err)` on failure, then rethrow so BullMQ can handle retries.
  6. Finally call `release(payload, job)` for cleanup.
- It also subscribes to the `failed` event and logs failures with the shared queue logger.

This gives you a consistent lifecycle and a single place to add cross‑cutting behavior (logging, metrics, tracing, idempotency, etc.) for all workers.

### ConsumerRegistrar: managing many consumers

`ConsumerRegistrar` is a tiny registry for `BaseConsumer` instances:

- `register(consumer)` adds a consumer to the list.
- `startAll()` starts all registered consumers.
- `closeAll()` stops all of them, swallowing individual close errors so shutdown is robust.

This is mainly a **composition helper** for worker processes: you can assemble multiple queue consumers in one service and control them as a group.

### How this package fits into the system

- Orchestrator / API code uses the `Producer` (and queue helpers) to turn **workflow state transitions** into **asynchronous jobs**.
- Worker services implement `BaseConsumer` subclasses to **execute workflow steps**, interact with the DB package, and emit history/metrics.
- Redis + BullMQ handle the heavy lifting of durability, retry, backoff, and scheduling, while this package encodes **project‑specific conventions** on top.

