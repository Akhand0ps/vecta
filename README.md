# Vecta

Real-time collaborative project management workspace for engineering teams.

[Overview](#overview) &middot; [How It Works](#how-it-works) &middot; [Architecture](#architecture) &middot; [Features](#features) &middot; [Tech Stack](#tech-stack) &middot; [Quickstart](#quickstart) &middot; [API & WebSocket Protocol](#api--websocket-protocol) &middot; [Monorepo Layout](#monorepo-layout)

---

## Overview

Vecta is an open-source, real-time project management and team collaboration platform. Built as a high-velocity alternative to Trello, it combines an event-driven WebSocket presence engine with a multi-tenant REST API to deliver instant board synchronization, role-based workspace boundaries, and sub-millisecond local workflows.

The platform is designed as an active state machine rather than a static database, providing a solid foundation for real-time team collaboration and future automated developer workflows.

---

## How It Works

Vecta structures projects hierarchically across multi-tenant organizations:

```
Organization (Org)
 ├── Memberships (User <-> Role: ADMIN | MEMBER)
 ├── Invitations (Hashed token links, expiration, revocation)
 └── Boards
      ├── Dynamic Sections / Customizable Pipelines (Configurable per org needs)
      │    └── Issues / Tasks (Cards)
      │         ├── Issue Mappings (Active & historic assignee logs)
      │         ├── Comments (Threaded discussions)
      │         └── Stored Files (Cloud media via S3)
      └── Presence Rooms (Socket mesh via apps/ws on port 3002)
```

1. **Organizations**: Multi-tenant workspaces where users create and manage distinct organizations with granular member roles (`Admin` or `Member`).
2. **Boards & Custom Sections**: Dynamic project canvases with customizable section pipelines configured to match each organization's unique workflow requirements.
3. **Issues & Assignments**: Cards with descriptions, file attachments, comment feeds, and tracked assignees (`ACTIVE` vs. `INACTIVE`).
4. **Live Presence**: When teammates open a board, they connect to an independent WebSocket room, broadcasting active presence without polling.

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
|   * Multi-tenant relational      * OTP cache & 120s TTL       * Media storage   |
|     schema & cascade rules       * 3-strike brute-force lock  * Transactional   |
|   * Hashed sessions & tokens     * Ephemeral state              HTML emails     |
+---------------------------------------------------------------------------------+
```

---

## Features

### Collaboration & Real-Time Presence
- **Dedicated WebSocket Engine**: Standalone daemon (`apps/ws`) managing concurrent room presence per board.
- **Instant Peer Broadcasts**: Notifies connected teammates immediately when users join or disconnect from a board.
- **Contextual Discussions**: Threaded comment streams attached directly to individual task cards.

### Workspace & Project Management
- **Multi-Tenant Scoping**: All boards, cards, and invitations are strictly scoped to an Organization.
- **Role-Based Access Control**: Dual-tier permissions (`ADMIN` vs. `MEMBER`) governing team management, settings, and board deletion.
- **Assignment Audit Trails**: Every card tracks both active assignees and historical assignment transitions (`IssueMapping`).

### Security & Infrastructure
- **Passwordless OTP Authentication**: Email-delivered One-Time Passwords with a 120-second sliding TTL in Redis.
- **Brute-Force Protection**: Redis-backed attempt counters limit OTP entries to 3 attempts before revoking the code.
- **Zero-Plaintext Secret Storage**: Session tokens and organization invite links are hashed with `SHA-256` before persistence.
- **Secure Cookie Sessions**: Session credentials are transmitted via partitioned, `httpOnly` secure cookies.
- **Cloud File Storage**: Direct multipart streaming to AWS S3 with deterministic, collision-resistant UUID key partitioning.
- **Transactional Emails**: Pre-configured HTML email templates powered by Resend for invites, verification, and onboarding.

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Monorepo & Runtime** | Bun 1.4 + Turborepo 2 | Monorepo task orchestration, fast package management, hot reload |
| **Frontend** | React 19 + React Router 8 | Reactive single-page client and WebSocket presence listener |
| **Backend REST API** | Express 5 + TypeScript | Business logic, authentication, RBAC, and file uploads |
| **Real-Time Presence** | `ws` (Native WebSockets) | Independent real-time presence microservice on port 3002 |
| **Database & ORM** | PostgreSQL 16 + Prisma 7 | Multi-tenant schema with `@prisma/adapter-pg` driver adapter |
| **Cache & Security** | Redis 7 | OTP lifecycle, rate-limiting, and ephemeral state tracking |
| **Cloud Storage** | AWS S3 (`@aws-sdk/client-s3`) | Object storage for avatars and card attachments |
| **Transactional Email** | Resend SDK | Responsive HTML email templates for onboarding and invites |

---

## Quickstart

### Prerequisites

- [Bun](https://bun.sh) (v1.4+)
- [Docker](https://www.docker.com) and Docker Compose
- Node.js (v24+, optional if running directly on Bun)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Akhand0ps/Vecta.git
cd Vecta
bun install
```

### 2. Boot Local Infrastructure

Start PostgreSQL 16 and Redis 7 in detached mode:

```bash
docker compose up -d
```

### 3. Set Up Environment Variables

Copy the template environment file into the backend workspace:

```bash
cp .env.example apps/backend/.env
```

Verify your environment configuration in `apps/backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trellodb?schema=public"
REDIS_URL="redis://localhost:6379"
PORT=3000
WS_PORT=3002
JWT_SECRET_TOKEN="your-secure-token"
RESEND_API_KEY="your-resend-api-key"
AWS_REGION="ap-south-1"
```

### 4. Apply Database Migrations & Generate Prisma Client

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

The services will be available at:
- **Web App**: `http://localhost:3000`
- **REST API**: `http://localhost:3000`
- **WebSocket Server**: `ws://localhost:3002`

---

## API & WebSocket Protocol

### REST Route Summary

```
/auth
  POST   /register             Create account & send welcome email
  POST   /login                Generate 6-digit OTP & send via email
  POST   /verify               Verify OTP, rate-limit & issue session cookie
  POST   /avatar               Upload user avatar to AWS S3 (Auth required)

/org
  POST   /                     Create organization (sets creator as ADMIN)
  GET    /                     List organizations for current user
  GET    /:orgId               Fetch organization details and boards
  DELETE /:orgId               Delete organization (ADMIN only)

/board & /section
  POST   /board/:orgId         Create board (auto-creates UPCOMING, IN_PROGRESS, DONE)
  GET    /board/:orgId         List boards in organization
  GET    /board/:orgId/:boardId Full board detail with sections and issues
  DELETE /board/:orgId/:boardId Delete board
  GET    /section/:boardId/:sectionId Retrieve section metadata and cards

/issue & /comment
  POST   /issue/:boardId       Create issue in board
  GET    /issue/all/:boardId   Fetch all issues for a board
  PUT    /issue/move/...       Move issue to target section
  POST   /issue/:id/assign     Assign team member to issue
  POST   /issue/:id/unassign   Unassign team member
  GET    /issue/:id/assignees/active Active assignees on issue
  GET    /issue/:id/assignees/history Full assignment audit history
  POST   /comment/:issueId     Add comment to issue thread
  GET    /comment/:issueId     List comments on issue

/invite
  POST   /invite               Generate hashed email invite (ADMIN only)
  GET    /invite/verify/:token Accept invitation via verification token
  PUT    /invite/revoke/:userId Revoke pending invitation (ADMIN only)
```

### WebSocket Protocol (`ws://localhost:3002`)

The WebSocket daemon manages real-time room presence through typed JSON messages:

```json
// 1. Client joins a board room
{
  "type": "join",
  "boardId": "board-uuid"
}

// 2. Server responds with active participants currently in the room
{
  "type": "initial_state",
  "users": [
    { "id": 0.482 }
  ]
}

// 3. Server broadcasts member presence updates to all peers in the room
{ "type": "join",  "id": 0.912 }
{ "type": "leave", "id": 0.912 }
```

---

## Monorepo Layout

```
├── apps/
│   ├── backend/          # Express 5 REST API, controllers, auth middleware, and routes
│   ├── frontend/         # React 19 single-page application and presence hooks
│   └── ws/               # Dedicated native WebSocket presence server
├── packages/
│   ├── db/               # Prisma 7 schema, PostgreSQL pg-adapter, and Redis client
│   ├── mailer/           # Resend email client and responsive HTML templates
│   └── storage/          # AWS S3 upload wrapper and file utilities
├── docker-compose.yml    # Local PostgreSQL 16 and Redis 7 definitions
├── turbo.json            # Turborepo task pipeline configuration
└── package.json          # Root scripts and workspace declarations
```

---

## Development Commands

All workspace tasks are managed through Turborepo:

```bash
bun dev              # Run all applications and microservices in watch mode
bun run build        # Compile production assets and bundles
bun run lint         # Execute ESLint across all workspaces
bun run check-types  # Validate TypeScript types across the monorepo
bun run format       # Format codebase using Prettier
```

---

## License

Distributed under the [MIT License](LICENSE).
