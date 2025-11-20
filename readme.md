# 🔐Intelligent Security Gateway & Rate Limiter

A plug-and-play Node.js middleware to protect applications from DDoS, Spam, and Abuse,
featuring a built-in Admin Dashboard.

## 📖Overview
This project is a **Monorepo** containing a high-performance security middleware and a management
dashboard. It is designed to be dropped into any Express/Node.js application to provide immediate
protection.

### Key Features:
- **Zero External Database**: Uses Redis for both caching (rate limits) and persistence (blocked
IPs/Admin credentials).
- **Dual-Layer Protection**:
    - **Layer 1**: IP-based Rate Limiting (DDoS Protection).
    - **Layer 2**: Role/Token-based Rate Limiting (Business Logic).
- **Sidecar Dashboard**: A React-based Admin UI runs on a separate port to manage security rules in
real-time.
- **Fail-Safe**: Designed to handle high traffic with Leaky Bucket algorithm.

️
## 🏗️ Monorepo Structure

We use PNPM Workspaces and Turborepo for high-speed builds.

    security-gateway/
    ├── package.json # Root configuration
    ├── pnpm-workspace.yaml # Workspace definitions
    ├── turbo.json # Build pipeline settings
    │
    ├── packages/
    │   ├── core/ # 📦 NPM PACKAGE (The Brain)
    │   │   ├── src/
    │   │   │   ├── middleware/ # Express middlewares (Guard, RateLimit)
    │   │   │   ├── db/ # Redis connection & repositories
    │   │   │   ├── dashboard/ # Internal Express server for Admin UI
    │   │   │   └── index.ts # Main entry point
    │   │   └── public/ # Static UI files (copied from ui package)
    │   │
    │   └── ui/ # 💻 ADMIN DASHBOARD (React + Vite)
    │       ├── src/ # Frontend source code
    │       └── dist/ # Build output
    │
    └── examples/
        └── test-app/ # 🧪 PLAYGROUND
            └── server.ts # Example usage of the package

## ⚙️Technical Architecture
1. **The Flow**
    
    The package operates in two modes simultaneously:
    1. **Middleware Mode (Main Port)**: Intercepts incoming traffic on the user's application.
    2. **Dashboard Mode (Sidecar Port)**: Serves the Admin UI and API.

            User[End User] -->|Request (Port 3000)| Middleware[Security Gateway]
            Middleware -->|Check| Redis[(Redis Store)]

            Middleware -- Blocked --> Reject[403/429 Error]
            Middleware -- Allowed --> App[User Application]

            Admin[Admin User] -->|Login (Port 9000)| Dashboard[Admin UI Server]
            Dashboard -->|Manage| Redis

2. **Redis Data Schema (Persistence & Cache)**

    We use Redis as the single source of truth.

| Type   | Key Pattern                 | Purpose                                  | TTL                     |
|--------|------------------------------|-------------------------------------------|--------------------------|
| **Set**    | `gateway:blocked:ips`         | List of permanently blocked IPs            | ❌ No (Persistent)       |
| **Set**    | `gateway:blocked:countries`   | List of blocked Country Codes (IN, US)    | ❌ No (Persistent)       |
| **Hash**   | `gateway:admins`              | Stores `username → hashed_password`        | ❌ No (Persistent)       |
| **Hash**   | `gateway:limits:ip:{ip}`      | Leaky Bucket state (tokens, timestamp)     | ✅ Yes (Window size)     |
| **Stream** | `gateway:logs`                | Recent traffic logs for analytics          | ✅ Capped (e.g., last 10k) |


## 🗺️Development Roadmap (Step-by-Step)
Follow this plan incrementally to build the system.

**Phase 1: Monorepo Setup & Skeleton**
- **Step 1**: Initialize `pnpm init` and configure `pnpm-workspace.yaml`.
- **Step 2**: Create folder structure: `packages/core` , `packages/ui` , `examples/test-app` .
- **Step 3**: Configure TypeScript ( `tsconfig.json` ) for all packages.
- **Step 4**: Link packages using workspace protocol ( "`workspace:*`" ).

**Phase 2: Redis Core & Persistence**
- **Step 5**: Install `ioredis` in `core` . Create `src/db/redis.ts` to handle dynamic connections
(connection string passed via config).
- **Step 6**: Create `src/db/repository.ts` with helper methods:
    - `seedAdmin(user, pass)` : Hashes password and stores in Redis if empty.
    - `getAdmin(user)` : Fetches credentials for login.
    - `blockIp(ip) / unblockIp(ip)` .
    - `blockCountry(code) / unblockCountry(code)` .

**Phase 3: The Middleware Logic (The Shield)**
- **Step 7**: Create `extractor.ts` : Middleware to extract IP & Country (using `geoip-lite` ) and attach to `req` .
- **Step 8**: Create `guard.ts` :
    - Check if IP exists in `gateway:blocked:ips` .
    - Check if Country exists in `gateway:blocked:countries` .
    - Return `403 Forbidden` if matched.
- **Step 9**: Create `rate-limit.ts` : Implement **Leaky Bucket Algorithm** using Redis counters.

**Phase 4: Admin Backend API**
- **Step 10**: Create `src/dashboard/server.ts` (An internal Express app).
- **Step 11**: Implement Auth Routes:
    - `POST /api/login` : Verify against Redis Hash -> Issue JWT.
- **Step 12**: Implement Management Routes (Protected by JWT):
    - `GET /api/stats` : Fetch Redis stats.
    - `POST /api/block` : Call repository methods.

**Phase 5: The Dashboard UI (Frontend)**
- **Step 13**: Initialize React+Vite in `packages/ui` .
- **Step 14**: Create Login Page (Integrate with `/api/login` ).
- **Step 15**: Create Dashboard:
    - Charts for traffic.
    - Table to manage Blocked IPs.
- **Step 16**: Configure Build: Add script to build React app and copy `dist` files to `packages/core/public` .

**Phase 6: Integration & Publishing**
- **Step 17**: Update `core` to serve static files from `public/` on the Dashboard port.
- **Step 18**: Export the main class `SecurityGateway` from `index.ts` .
- **Step 19**: Test using `examples/test-app` .

## 📦Usage Example
How a developer will use this package:

    import express from 'express';
    import { SecurityGateway } from '@bhupen/gateway';

    const app = express();

    // 1. Initialize Gateway
    const gateway = new SecurityGateway({
        redisUrl: process.env.REDIS_URL,
        dashboardPort: 9000,
        auth: {
            username: "admin",
            password: "secure_password"
        },
        limiter: {
            max: 100,
            window: '1m'
        }
    });

    // 2. Apply Middleware
    app.use(gateway.middleware());

    // 3. Start Dashboard
    gateway.startDashboard();

    app.get('/', (req, res) => res.send('My Protected App ️'));

    app.listen(3000);
