<div align="center">

  <img src="./assets/logo.svg" alt="Vecta Logo" width="72" height="72" />

  <h1>Vecta</h1>

  <p><strong>Real-time collaborative workspace and issue tracking for engineering teams.</strong></p>

  <p>
    <a href="#features">Features</a> &middot;
    <a href="#architecture">Architecture</a> &middot;
    <a href="#tech-stack">Tech Stack</a> &middot;
    <a href="#getting-started">Getting Started</a> &middot;
    <a href="#monorepo-layout">Monorepo</a>
  </p>

</div>

---

## Overview

Vecta is an open-source, real-time collaboration and issue-tracking platform built for modern engineering teams. It pairs an event-driven WebSocket presence engine with a multi-tenant REST API, delivering instant board state synchronization, role-based workspace boundaries, and sub-millisecond local workflows.

The entire platform is built as a TypeScript monorepo orchestrated with **Bun** and **Turborepo**, backed by **PostgreSQL 16** (via Prisma 7 with pg-adapter), **Redis 7**, **AWS S3**, and **Resend**.

---

## Architecture

```
                    +------------------------------------------+
                    |           React 19 Single Page App       |
                    |            (Bun + React Router 8)        |
                    +--------------------+---------------------+
                                         |
               +-------------------------+-------------------------+
               | (WebSocket :3002)                                 | (HTTP / Cookies :3000)
               v                                                   v
+-----------------------------+                     +-----------------------------+
|      WebSocket Service      |                     |       REST API Gateway      |
|         (apps/ws)           |                     |        (apps/backend)       |
|  * In-memory presence rooms |                     |  * Session auth & RBAC      |
|  * Join / leave broadcasts  |                     |  * Issue & board management |
|  * Peer state mesh          |                     |  * Multipart S3 streaming   |
+--------------+--------------+                     +--------------+--------------+
               |                                                   |
               +-------------------------+-------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                                Data & Cloud Tier                                |
|                                                                                 |
|   PostgreSQL 16 (Prisma 7)       Redis 7                      AWS S3 / Resend   |
|   * Relational multi-tenancy     * OTP cache & 120s TTL       * Media storage   |
|   * Hashed sessions & tokens     * 3-strike brute-force lock  * Transactional   |
|   * Cascade integrity            * Ephemeral state              HTML emails     |
+---------------------------------------------------------------------------------+
```

---

## Features

- **Real-Time Board Presence**: Dedicated WebSocket daemon (`apps/ws`) tracking live participants on board canvases with instant peer broadcasts.
- **Multi-Tenant Workspaces**: Strict organizational scoping with Role-Based Access Control (`ADMIN` vs. `MEMBER`) governing permissions, boards, and settings.
- **Kanban Engine**: Auto-provisioned pipelines (`UPCOMING`, `IN_PROGRESS`, `DONE`), transactional issue transitions, and assignee audit histories (`IssueMapping`).
- **Hardened Authentication**: Passwordless OTP login via transactional email, Redis rate-limiting (3-strike lockout with 120s TTL), and SHA-256 token-hashed sessions.
- **Secure Cloud Storage**: Direct multipart streaming pipeline to AWS S3 for user avatars and attachments with collision-resistant UUID keys.
- **Transactional Emails**: Pre-configured responsive HTML templates powered by Resend for workspace invites, authentication codes, and onboarding.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime & Monorepo** | Bun 1.4 + Turborepo 2 | Monorepo task orchestration, fast installs, and hot reloading |
| **Frontend** | React 19 + React Router 8 | Reactive client application and WebSocket presence listener |
| **REST API** | Express 5 + TypeScript | Business logic, authentication, RBAC, and file uploads |
| **Real-Time Engine** | `ws` (Native WebSockets) | Independent real-time presence microservice on port 3002 |
| **Database & ORM** | PostgreSQL 16 + Prisma 7 | Multi-tenant schema with `@prisma/adapter-pg` driver adapter |
| **Cache & Security** | Redis 7 | OTP lifecycle, rate-limiting, and ephemeral room tracking |
| **Storage & Email** | AWS S3 + Resend | Cloud blob storage and transactional email pipeline |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.4+)
- [Docker](https://www.docker.com) & Docker Compose

### 1. Clone and Install

```bash
git clone https://github.com/Akhand0ps/Vecta.git
cd Vecta
bun install
```

### 2. Start Infrastructure

Boot local PostgreSQL 16 and Redis 7 containers:

```bash
docker compose up -d
```

### 3. Set Up Environment Variables

```bash
cp .env.example apps/backend/.env
```

Configure your `apps/backend/.env` with your database credentials:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trellodb?schema=public"
REDIS_URL="redis://localhost:6379"
PORT=3000
WS_PORT=3002
JWT_SECRET_TOKEN="your-secure-token"
RESEND_API_KEY="your-resend-api-key"
AWS_REGION="ap-south-1"
```

### 4. Migrate Database & Generate Client

```bash
cd packages/db
bunx prisma migrate dev
bunx prisma generate
cd ../..
```

### 5. Launch Development Services

```bash
bun dev
```

| Service | URL |
| :--- | :--- |
| **Frontend Application** | `http://localhost:3000` |
| **REST API Gateway** | `http://localhost:3000` |
| **WebSocket Presence Server** | `ws://localhost:3002` |

---

## Monorepo Layout

```
├── apps/
│   ├── backend/          # Express 5 REST API, controllers, and auth middleware
│   ├── frontend/         # React 19 client with real-time presence hooks
│   └── ws/               # Standalone WebSocket server for board presence
├── packages/
│   ├── db/               # Prisma 7 schema, PostgreSQL pg-adapter, Redis singleton
│   ├── mailer/           # Resend email client with responsive HTML templates
│   └── storage/          # AWS S3 file upload integration
├── docker-compose.yml    # Local PostgreSQL 16 and Redis 7 definitions
└── turbo.json            # Monorepo build and pipeline execution rules
```

---

## API & WebSocket Overview

### REST Endpoints Summary

```
/auth
  POST   /register             Create account & send welcome email
  POST   /login                Request 6-digit OTP via email
  POST   /verify               Verify OTP, rate-limit & issue session cookie
  POST   /avatar               Upload user avatar to AWS S3

/org
  POST   /                     Create organization (assigns creator as ADMIN)
  GET    /                     List organizations for authenticated user
  GET    /:orgId               Fetch organization details and boards
  DELETE /:orgId               Delete organization (Admin only)

/board & /section
  POST   /board/:orgId         Create board (auto-provisions UPCOMING, IN_PROGRESS, DONE)
  GET    /board/:orgId         List boards in organization
  GET    /board/:orgId/:boardId Full board detail with sections and issues
  DELETE /board/:orgId/:boardId Delete board
  GET    /section/:boardId/:sectionId Get section metadata and cards

/issue & /comment
  POST   /issue/:boardId       Create issue in board
  GET    /issue/all/:boardId   Fetch all board issues
  PUT    /issue/move/...       Move issue between sections
  POST   /issue/:id/assign     Assign team member to issue
  GET    /issue/:id/assignees/history View assignment audit history
  POST   /comment/:issueId     Add comment to issue thread
  GET    /comment/:issueId     List comments on issue

/invite
  POST   /invite               Generate cryptographically hashed email invite (Admin)
  GET    /invite/verify/:token Accept invitation via verification token
  PUT    /invite/revoke/:userId Revoke pending invitation (Admin)
```

### Real-Time Protocol (`ws://localhost:3002`)

```json
// 1. Client joins a board room
{ "type": "join", "boardId": "board-uuid" }

// 2. Server responds with initial active occupants
{ "type": "initial_state", "users": [{ "id": 0.482 }] }

// 3. Server broadcasts member presence changes to the room
{ "type": "join",  "id": 0.912 }
{ "type": "leave", "id": 0.912 }
```

---

## Monorepo Commands

```bash
bun dev              # Run all applications and microservices in watch mode
bun run build        # Build all workspaces for production
bun run lint         # Lint codebase across workspaces
bun run check-types  # Type-check TypeScript across the monorepo
bun run format       # Format code with Prettier
```

---

## License

MIT
