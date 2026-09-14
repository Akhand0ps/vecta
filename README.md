<div align="center">

  <h1>⚡ VECTA</h1>
  <p><strong>The modern, real-time collaboration and issue-tracking workspace for high-velocity teams.</strong></p>

  <p>
    <a href="#key-features">Features</a> •
    <a href="#system-architecture">Architecture</a> •
    <a href="#quickstart">Quickstart</a> •
    <a href="#monorepo-structure">Monorepo</a> •
    <a href="#api-reference">API Reference</a> •
    <a href="#websocket-protocol">WebSocket Engine</a> •
    <a href="#contributing">Contributing</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Bun-1.4.0-black?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" />
    <img src="https://img.shields.io/badge/Turborepo-2.x-000000?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
    <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  </p>

</div>

---

## 💡 Overview

**Vecta** is an open-source, enterprise-ready project management platform engineered to deliver the speed of Linear with the flexibility of modern collaborative canvases. 

Traditional task management platforms suffer from high latency, rigid organizational hierarchies, and bloated interfaces. Vecta strips away the noise: built on a high-throughput **Bun + Turborepo** monorepo, it pairs a distributed **WebSocket event mesh** with **PostgreSQL + Prisma 7** and **Redis** to ensure sub-millisecond real-time presence, state synchronization, and rock-solid multi-tenant access control.

---

## ✨ Key Features

### 🚀 Real-Time Board Presence
- **Live User Sync**: Powered by a dedicated WebSocket microservice (`apps/ws`), every board connection maintains live room presence.
- **Dynamic Awareness**: Instantly broadcast team member join/leave states and concurrent board activity without polling.

### 🏢 Multi-Tenant Workspaces & RBAC
- **Isolated Organizations**: Enterprise-grade multi-tenancy with distinct organizational boundaries.
- **Granular Permissions**: Built-in Role-Based Access Control (`ADMIN` vs. `MEMBER`) governing invite generation, board management, and settings.
- **Cryptographic Invitations**: Secure, SHA-256 token-hashed email invites with single-click verification and revocation capabilities.

### 📋 Fluid Kanban Workflow
- **Auto-Provisioned Swimlanes**: Instant `UPCOMING`, `IN_PROGRESS`, and `DONE` pipelines upon board creation.
- **Cross-Section Movement**: Move issues seamlessly between sections with transactional consistency.
- **Assignee Audit Logs**: Track active assignees and historical assignment transitions (`IssueMapping`) per card.
- **Threaded Discussions**: Nested comment feeds attached directly to issues for contextual discussions.

### 🔒 Enterprise-Grade Auth & Security
- **Passwordless OTP Authentication**: One-Time Passwords delivered via email with Redis-backed expiration (2 min TTL).
- **Brute-Force Lockout**: Dynamic Redis attempt-counter limiting OTP guesses to 3 attempts before revocation.
- **Hashed Session Architecture**: Zero raw session tokens in the database. Tokens are hashed with SHA-256 before storage with support for persistent (`rememberMe`) httpOnly cookies.
- **S3 Asset Pipeline**: Secure avatar and attachment uploads direct to AWS S3 using authenticated streams.

### 💌 Transactional Email Engine
- **Resend Integration**: High-deliverability transactional emails with custom, responsive HTML templates for invites, OTP verification, and welcome notifications.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Clients["Client Layer"]
        Frontend["React 19 SPA<br/>(Bun + React Router)"]
    end

    subgraph Gateways["Real-Time & API Layer"]
        WSServer["WebSocket Server<br/>(apps/ws :3002)<br/>Room Presence & Broadcasts"]
        APIServer["REST API Gateway<br/>(apps/backend :3000)<br/>Express 5 + Bun"]
    end

    subgraph Data["Persistence & Cache"]
        Postgres[("PostgreSQL 16<br/>(Prisma 7 + pg adapter)")]
        RedisCache[("Redis 7<br/>OTP Rate-Limit & Sessions")]
    end

    subgraph External["Cloud Services"]
        S3["AWS S3<br/>Avatars & Assets"]
        Resend["Resend API<br/>Transactional Emails"]
    end

    Frontend -->|WebSocket Connections| WSServer
    Frontend -->|HTTP / Cookies| APIServer
    APIServer -->|Prisma Client| Postgres
    APIServer -->|Rate-Limiting & Tokens| RedisCache
    APIServer -->|S3 Upload Stream| S3
    APIServer -->|Send Notification| Resend
    WSServer -.->|State Lookup| Postgres
```

---

## 📦 Monorepo Structure

Vecta is orchestrated with [Turborepo](https://turbo.build/repo) and [Bun](https://bun.sh/) workspaces for optimized caching, fast dependency resolution, and strict module boundaries:

```
trello/
├── apps/
│   ├── backend/          # Express 5 REST API, Auth, RBAC, Multer & Controllers
│   ├── frontend/         # React 19 Client with Bun bundler & WebSocket client
│   └── ws/               # High-throughput WebSocket server for live presence
├── packages/
│   ├── db/               # Prisma 7 schema, PostgreSQL client & Redis singleton
│   ├── mailer/           # Resend email client & responsive HTML templates
│   └── storage/          # AWS S3 SDK wrapper for asset uploads
├── docker-compose.yml    # Local PostgreSQL 16 & Redis 7 services
├── turbo.json            # Monorepo build and pipeline execution rules
└── package.json          # Root scripts and workspace declarations
```

### Packages & Applications Matrix

| Package / App | Type | Technologies | Purpose |
| :--- | :--- | :--- | :--- |
| **`apps/backend`** | Service | Express 5, Bun, TypeScript | Core REST API, session authentication, RBAC, asset handling |
| **`apps/frontend`** | Application | React 19, React Router 8, Bun | User interface and live board interaction |
| **`apps/ws`** | Microservice | `ws`, TypeScript, Bun | Real-time presence and board event broadcasting |
| **`packages/db`** | Package | Prisma 7, `@prisma/adapter-pg`, Redis | Central database schema, migrations, and caching client |
| **`packages/mailer`**| Package | Resend SDK, HTML templates | Email dispatch for onboarding, OTP, and workspace invites |
| **`packages/storage`**| Package | `@aws-sdk/client-s3` | Scalable cloud blob and file upload pipeline |

---

## ⚡ Quickstart

Get a local Vecta instance running in under 2 minutes.

### Prerequisites

- [Bun](https://bun.sh/) (>= 1.4.0)
- [Docker & Docker Compose](https://www.docker.com/)
- Node.js (>= 24, optional if using Bun runtime)

### 1. Clone & Install

```bash
git clone https://github.com/Akhand0ps/Vecta.git
cd Vecta
bun install
```

### 2. Boot Infrastructure

Spin up PostgreSQL 16 and Redis 7 in detached mode:

```bash
docker compose up -d
```

### 3. Configure Environment

Copy the example environment file into the backend workspace:

```bash
cp .env.example apps/backend/.env
```

Ensure your `apps/backend/.env` is configured:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trellodb?schema=public"
REDIS_URL="redis://localhost:6379"
PORT=3000
WS_PORT=3002
JWT_SECRET_TOKEN="your-secret-token"
RESEND_API_KEY="your-resend-api-key"
AWS_REGION="ap-south-1"
```

### 4. Migrate Database & Generate Prisma Client

```bash
# Push migrations to your local Postgres
cd packages/db
bunx prisma migrate dev

# Generate typed client
bunx prisma generate
cd ../..
```

### 5. Launch Development Environment

Run all applications and packages concurrently with Turborepo:

```bash
bun dev
```

Your services are now live:
- **Web App**: `http://localhost:3000` (or configured dev port)
- **API Server**: `http://localhost:3000`
- **WebSocket Gateway**: `ws://localhost:3002`

---

## 🔌 API Reference

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user account & dispatch welcome email | No |
| `POST` | `/auth/login` | Request a 6-digit OTP code sent via email | No |
| `POST` | `/auth/verify` | Verify OTP, apply rate-limiting, and issue secure session cookie | No |
| `POST` | `/auth/avatar` | Upload user profile picture to AWS S3 | Yes (`Session`) |

### Organizations (`/org`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/org` | Create a new organization (sets creator as `ADMIN`) | Yes |
| `GET` | `/org` | List organizations user is a member of | Yes |
| `GET` | `/org/:orgId` | Fetch organization details and boards | Yes |
| `DELETE`| `/org/:orgId` | Delete organization (Admin only) | Yes |

### Boards & Sections (`/board`, `/section`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/board/:orgId` | Create board with default `UPCOMING`, `IN_PROGRESS`, `DONE` | Yes |
| `GET` | `/board/:orgId` | List all boards for an organization | Yes |
| `GET` | `/board/:orgId/:boardId` | Get board details, sections, and issues | Yes |
| `DELETE`| `/board/:orgId/:boardId` | Delete board | Yes |
| `GET` | `/section/:boardId/:sectionId` | Fetch specific section metadata and cards | Yes |

### Issues & Comments (`/issue`, `/comment`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/issue/:boardId` | Create new issue within a board | Yes |
| `GET` | `/issue/all/:boardId` | Fetch all issues across board swimlanes | Yes |
| `PUT` | `/issue/move/:boardId/:sectionId/:issueId` | Move issue to a new section | Yes |
| `POST` | `/issue/:issueId/assign` | Assign member to issue | Yes |
| `GET` | `/issue/:issueId/assignees/history` | Get assignee audit trail | Yes |
| `POST` | `/comment/:issueId` | Post a comment on an issue | Yes |
| `GET` | `/comment/:issueId` | List all comments on an issue | Yes |

### Team Invitations (`/invite`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/invite` | Send secure email invitation to join organization | Yes (`ADMIN`) |
| `GET` | `/invite/verify/:token` | Accept invitation using cryptographically hashed token | No |
| `PUT` | `/invite/revoke/:userId` | Revoke pending workspace invitation | Yes (`ADMIN`) |

---

## 📡 WebSocket Protocol

The WebSocket microservice runs on `ws://localhost:3002` and handles live presence rooms mapped by `boardId`.

### Client-to-Server Events

#### Join Board Room
```json
{
  "type": "join",
  "boardId": "board-uuid-1234"
}
```

### Server-to-Client Events

#### Initial Room State
Sent immediately to the joining client with existing active participants:
```json
{
  "type": "initial_state",
  "users": [
    { "id": 0.4928174 }
  ]
}
```

#### User Joined Notification
Broadcasted to all other active sockets in the room:
```json
{
  "type": "join",
  "id": 0.8492019
}
```

#### User Left Notification
Broadcasted when a socket disconnects:
```json
{
  "type": "leave",
  "id": 0.8492019
}
```

---

## 🛡️ Security & Reliability Engineering

- **Zero-Plaintext Secret Storage**: Session tokens and invite links are hashed via `SHA-256` before writing to the database, preventing token theft if the database is exposed.
- **Brute-Force Resistance**: OTP verification utilizes Redis counters with automatic key expiration (`EX: 120`). Exceeding 3 attempts invalidates the OTP immediately.
- **HTTP-Only Cookies**: Session credentials are sent via strictly configured `httpOnly` cookies with partitioned max-age based on "Remember Me" preferences.
- **Atomic Relations**: Relational constraints and cascading deletes in PostgreSQL guarantee no orphaned issues, boards, or invalid memberships.

---

## 🛠️ Monorepo Commands

All workflows are powered by Turborepo:

| Command | Action |
| :--- | :--- |
| `bun dev` | Start all apps and packages in watch mode |
| `bun run build` | Build all services for production |
| `bun run lint` | Run ESLint across all packages |
| `bun run check-types` | Validate TypeScript types across the monorepo |
| `bun run format` | Format repository code using Prettier |

---

## 🗺️ Roadmap

- [ ] **Drag & Drop Canvas**: Smooth drag-and-drop interactions with `@hello-pangea/dnd` or `dnd-kit`.
- [ ] **CRDT Collaborative Editing**: Rich text document and description editing with Yjs.
- [ ] **Granular Notifications**: Slack & Discord webhook integrations.
- [ ] **Custom Workflows**: Configurable Kanban column states and custom automation triggers.
- [ ] **SAML / SSO**: Enterprise single sign-on with Okta and Google Workspace.

---

## 🤝 Contributing

Contributions are what make the open-source community an incredible place to learn, inspire, and build. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <br />
  <p>Crafted with ❤️ by the <strong>Vecta</strong> team.</p>
</div>
