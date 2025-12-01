## `@distributed-job-runner/db`

**Purpose:** this package is the single source of truth for all persistent data in the distributed job runner (workflows, workflow steps, timers, job attempts, histories, etc.).  
It hides the raw PostgreSQL connection details behind a small, consistent API using **Drizzle ORM**.

### How the client is created

- A shared `Pool` from `pg` is created using `DATABASE_URL` and optional `DB_MAX_CLIENTS`.
- `drizzle(pool)` wraps this pool into a type-safe `db` client (`NodePgDatabase`).
- In non‑production environments, the package will try to load `.env` from a few common locations so other packages don’t have to worry about that.

This means **all services share the same pool and Drizzle client**, which keeps connection management and migrations centralized.

### Transactions and consistency

The `withTransaction` helper wraps a full unit of work in a PostgreSQL transaction:

- It gets a dedicated `PoolClient` from the pool and calls `BEGIN`.
- It creates a temporary `NodePgDatabase` instance bound to that client.
- Your callback runs all queries against that transactional client.
- On success it commits; on error it rolls back and rethrows.

This pattern is used to guarantee that complex operations (for example: creating a workflow, its initial steps, and its timers) are **all‑or‑nothing**.

### Schema and repositories

- The `schema` export contains all Drizzle table definitions for the job runner (workflows, workflow steps, timers, job attempts, histories, idempotency keys, etc.).
- Concrete repositories (e.g. workflow, workflow-history, job-attempt, timer) are built on top of a shared `BaseRepository`.

The **design goal** is that higher‑level packages never construct ad‑hoc SQL – they talk to repositories that encode domain concepts and invariants.

### BaseRepository: how it works

`BaseRepository` is a generic class parameterized by a Drizzle table:

- It stores a reference to the `NodePgDatabase`, the table, and the primary key column.
- Common methods like `create`, `findById`, `findOne`, `findMany`, `update`, `updateById`, `delete`, `deleteById`, and `count` are implemented once.
- All queries are built using Drizzle’s query builder, so types flow from the schema into the repository API.

Soft‑delete support is built in:

- At runtime it checks whether the table has a `deletedAt` column.
- If present, it automatically appends `deletedAt IS NULL` to read and count queries.
- That means most of the codebase “just gets” soft‑delete behavior when it uses repositories, without duplicating conditions everywhere.

### How other packages use this

- **Queue / workers**: when a job is dequeued, its consumer typically uses repositories from this package to read and update workflow state, append history rows, and mark steps as completed or failed inside a transaction.
- **Timers / scheduling**: timer processing code can atomically move timers and update workflow status using `withTransaction` so the same logical “event” is consistently reflected across tables.

In short, this package provides the **durable backbone** of the system: every job execution, retry, and workflow transition eventually becomes a sequence of repository calls and transactions defined here.

