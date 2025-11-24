# **Distributed Job Runner (Workflow Engine)**

*A production-grade workflow orchestration engine built to showcase senior-level distributed systems engineering.*

---

## 🚀 **Why This Project Exists**

Modern backend systems need **reliable orchestration** — not just queues and cron jobs, but full workflows with retries, compensations, timers, and operational visibility. Companies like Uber, Netflix, Stripe, and AWS use internal workflow engines (Cadence, Conductor, Step Functions) for exactly this reason.

This project demonstrates that I can design and implement the same class of system:
**a durable, observable, crash-resilient distributed workflow engine.**

This is not a queue wrapper or a simple job runner — it’s a *control plane* for reliable distributed execution.

---

## 🧠 **Motivation**

Traditional background job queues fall apart when pipelines grow complex:

* Multi-step workflows
* External API dependencies
* Long-running tasks
* Retries and compensations
* Delayed / scheduled steps
* Operational visibility & debugging

Most real engineering teams eventually build a workflow engine around their queueing system.
This project is my version of that — designed clean, modular, resilient, and observable.

It proves I can build systems that don’t just run…
**they run correctly, consistently, and safely under failure.**

---

## 🧱 **How It’s Built (High-Level Overview)**

### ⛓ **Architecture Diagram (Mermaid)**

```mermaid
flowchart LR
    subgraph Client
        A[Start Workflow Request]
    end

    subgraph API[NestJS API\n(Control Plane)]
        B[Persist Workflow\n& Steps]
        C[Expose Admin APIs]
    end

    subgraph DB[Postgres\nSource of Truth]
        D[(Workflows)]
        E[(Workflow Steps)]
        F[(Timers)]
        G[(Idempotency Keys)]
        H[(History Events)]
    end

    subgraph Scheduler[Scheduler Service]
        I[Expand Workflow DSL]
        J[Enqueue First Step]
    end

    subgraph Queue[Redis + BullMQ]
        K[(Job Queue)]
        L[(Delayed Jobs)]
    end

    subgraph Worker[Distributed Workers\n(Data Plane)]
        M[Claim Step\n(DB Txn)]
        N[Run Handler]
        O[Write Result / Retry / Fail]
        P[Enqueue Next Step]
    end

    subgraph Reconciler[Reconciliation Loop]
        Q[Recover Missed Timers]
        R[Fix Orphaned Steps]
    end

    subgraph Dashboard[Next.js Dashboard]
        S[Workflow Timeline]
        T[Retry/Pause/Cancel]
    end

    A --> B --> D
    B --> Scheduler
    Scheduler --> I --> J --> K
    K --> Worker
    Worker --> M --> N --> O --> P --> K
    Worker --> E
    L --> Worker
    DB <-- Reconciler
    API --> Dashboard
```

---

## 🧠 **Key Engineering Concepts Implemented**

* ACID step claiming using DB transactions
* Idempotent side-effects with unique idempotency keys
* DB-backed durable timers (survive crashes)
* Exponential/linear retry strategies
* Compensation logic (reverse steps on failure)
* Queue-based backpressure & horizontal scaling
* Chaos-resistant execution and timer reconciliation
* Structured observability: tracing, metrics, logs

This is how real companies design resilient workflow systems.

---

## 🎯 **Expected Outcome**

By the time this project is complete, the system will:

### ✔ Execute multi-step workflows reliably

Sequential, parallel (future), delayed, compensating — fully orchestrated.

### ✔ Survive failures

Workers can crash → steps recover
Redis can restart → timers recovered from DB
Process killed → workflow state remains correct

### ✔ Provide deep real-time visibility

Timeline view
Retry history
Failure diagnostics
Step-level logs

### ✔ Handle load predictably

Benchmarking verifies:

* workflow throughput
* worker scalability
* retry behavior
* queue latency
* timer drift

### ✔ Demonstrate strong systems engineering fundamentals

This repo is a **signal** that I can design, reason about, and implement scalable distributed systems.

---

## 🏆 **Why This Matters (For Hiring & Engineering Leadership)**

Recruiters don’t just look for “can you code”; they look for **can you design systems that won’t fall apart in production**.

This project demonstrates strengths that matter for senior + staff roles:

### **1. Ownership of Complex Systems**

You don’t get promoted for CRUD apps.
You get promoted for designing **foundational internal systems** like this.

### **2. Reliability & Correctness Thinking**

Workflow engines deal with:

* retries
* idempotency
* consistency
* failure modes
* observability
* concurrency

If you can reason about these, you can handle real-world, high-scale backend systems.

### **3. Architectural Thinking**

This project shows:

* separation of concerns (control plane vs data plane)
* durability guarantees
* distributed worker pools
* transactional safety
* scalable queue-driven architecture
* structured state machines

These are the skills hiring managers want in senior backend engineers.

### **4. Strong Signals in Interviews**

Almost nobody builds a workflow engine for fun.
Showing this on a resume communicates:

> “I’m not a feature implementer — I’m a systems thinker.”

It’s a cheat code for recruiter confidence.

### **5. This is the same architecture used at top companies**

You’re effectively shipping a simplified version of:

* Netflix Conductor
* Uber Cadence
* AWS Step Functions
* Stripe internal orchestrators

That’s *real* engineering work.

---

## 🧩 **Who This Project Is For**

This repository is directly targeted at:

* recruiters
* engineering managers
* staff-level interviewers
* teams evaluating my ability to build distributed, reliable backend systems

If you want proof of:

* systems design ability
* distributed architecture skills
* operational maturity
* debugging complex pipelines
* handling concurrency and failure
* understanding how real infrastructure works

— this project is designed to show exactly that.

---

## 🏁 **Closing Note**

This is not another SaaS toy.
This is a **reliable workflow engine**, built to demonstrate that I can architect, implement, and operationalize distributed systems — the kind that real companies depend on.

If you want a walkthrough of the system or want to discuss design choices, feel free to reach out.

---
