# InteriorG — Enterprise DevSecOps & Architectural Commerce Platform

[![Live Application](https://img.shields.io/badge/Production%20Deployment-interiorg.pages.dev-0f2444?style=for-the-badge&logo=cloudflare&logoColor=white)](https://interiorg.pages.dev)
[![DevSecOps CI/CD](https://img.shields.io/badge/CI%2FCD%20Pipeline-GitHub%20Actions%20%7C%20Docker-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](#-devsecops-cicd-pipeline-implementation)
[![Docker](https://img.shields.io/badge/Containers-Docker%20Compose%20%7C%20Alpine-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#-containerization--docker-implementation)
[![Security Hardened](https://img.shields.io/badge/Security-PBKDF2%20%7C%20RBAC%20%7C%20Helmet%20%7C%20RateLimit-emerald?style=for-the-badge&logo=shield&logoColor=white)](#-security-implementation--devsecops-toolchain)
[![Tests Passing](https://img.shields.io/badge/Automated%20Tests-21%2F21%20Passing-brightgreen?style=for-the-badge&logo=jest&logoColor=white)](#-testing--quality-assurance)

> **InteriorG** is an enterprise-grade omnichannel e-commerce and architectural studio platform engineered with a strict **DevSecOps lifecycle**. It incorporates automated GitHub Actions CI/CD pipelines, multi-container Docker orchestration, edge-first distributed computing (Cloudflare Pages & Workers), dual-engine persistence (PostgreSQL ACID transactions + MongoDB document audits), and defense-in-depth security controls.

---

## 📌 Executive Summary (Resume Highlights)

- **DevSecOps & CI/CD Engineering**: Architected a 5-stage automated GitHub Actions pipeline executing secret detection, software composition analysis (SCA via `npm audit`), static application security testing (SAST via `tsc --noEmit` & Prisma validation), containerized PostgreSQL & MongoDB service tests, and automated Docker container image builds.
- **Containerization & Microservices**: Implemented multi-stage Dockerfiles (`apps/api` and `apps/web`) with Alpine Linux base images, container networking, health checks, persistent volumes, and Cloudflare Tunnel (`cloudflared`) sidecars for secure zero-trust edge ingress.
- **Defense-in-Depth Security**: Enforced cryptographic PBKDF2 password derivation (100,000 iterations, SHA-256 HMAC), HTTP security headers via Helmet, API rate limiting, strict CORS boundaries, multi-tier Role-Based Access Control (RBAC), and physical separation of customer and staff login portals (`/admin/login`, `/stock/login`).
- **High-Performance Distributed Architecture**: Deployed a zero-cost edge tier on Cloudflare Pages and Workers ESM with sub-50ms global latency, progressive infinite scrolling with `IntersectionObserver`, and 360° Three.js panoramic visualization.
- **ACID Financial & Stock Integrity**: Designed PostgreSQL serializable transactions and row-level locks (`SELECT ... FOR UPDATE`) preventing race conditions and overselling during high-concurrency checkouts.

---

## 📑 Table of Contents
1. [Architecture & System Design](#-architecture--system-design)
2. [DevSecOps CI/CD Pipeline Implementation](#-devsecops-cicd-pipeline-implementation)
3. [Security Implementation & DevSecOps Toolchain](#-security-implementation--devsecops-toolchain)
4. [Containerization & Docker Implementation](#-containerization--docker-implementation)
5. [Key Application Portals](#-key-application-portals)
6. [Step-by-Step Implementation & Installation Process](#-step-by-step-implementation--installation-process)
7. [Testing & Quality Assurance](#-testing--quality-assurance)
8. [Production Deployment Workflow](#-production-deployment-workflow)
9. [Author & Contact](#-author--contact)

---

## 🏛️ Architecture & System Design

The system implements a **hybrid distributed edge architecture**, decoupling client-facing high-throughput edge nodes from transactional core persistence services:

```
                                ┌──────────────────────────────────────────────┐
                                │          Global Internet Traffic             │
                                └──────────────────────┬───────────────────────┘
                                                       │
                                        HTTPS / TLS 1.3 Routing
                                                       ▼
                                ┌──────────────────────────────────────────────┐
                                │         Cloudflare Global Edge Network       │
                                │   • DDoS Mitigation & SSL/TLS Termination    │
                                │   • Static CDN Cache (Vite / PWA Bundles)    │
                                └──────────────────────┬───────────────────────┘
                                                       │
                                  ┌────────────────────┴────────────────────┐
                                  ▼                                         ▼
            ┌─────────────────────────────────────────┐   ┌─────────────────────────────────────────┐
            │       Client Application (SPA / PWA)    │   │      Cloudflare Edge Worker API         │
            │  • React 18 & TypeScript (Vite 5)       │   │  • Low-Latency PBKDF2 Salted Auth       │
            │  • Three.js 360° Studio & AR Tools      │   │  • Living Space Hierarchy Engine        │
            │  • Progressive Infinite Scroll Grid     │   │  • Edge Telemetry & Analytics Store     │
            │  • Unauthenticated Bag Sync Engine      │   │  • In-Memory & Cloudflare KV Backend    │
            └─────────────────────────────────────────┘   └────────────────────┬────────────────────┘
                                                                               │
                                                                   REST API Proxy / Tunnel
                                                                               ▼
                                                          ┌─────────────────────────────────────────┐
                                                          │      Core Backend Services (Docker)     │
                                                          │  • Express 5 + Helmet + Rate Limiter    │
                                                          │  • Prisma ORM + PostgreSQL 17 (ACID)    │
                                                          │  • Mongoose + MongoDB 7 (Audits/Design) │
                                                          └─────────────────────────────────────────┘
```

---

## 🚀 DevSecOps CI/CD Pipeline Implementation

The repository is governed by an automated, multi-stage **GitHub Actions CI/CD pipeline** defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Every code change pushed to `main` or submitted via Pull Request undergoes rigorous automated security verification:

```
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                      AUTOMATED GITHUB ACTIONS DEVSECOPS PIPELINE                       │
 └────────────────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
 ┌─────────────────────────┐
 │ Stage 1: Security Audit │ ──▶ • Git Secret Leak Verification (Zero .env commits)
 │       (SCA / Secrets)   │     • Software Composition Analysis (npm audit --audit-level=critical)
 └────────┬────────────────┘
          │
          ▼
 ┌─────────────────────────┐
 │ Stage 2: Static Analysis│ ──▶ • Prisma Schema Validation (npx prisma validate)
 │         (SAST)          │     • Monorepo Strict Typechecking (tsc --noEmit on API & Web)
 └────────┬────────────────┘
          │
          ▼
 ┌─────────────────────────┐
 │ Stage 3: Test Execution │ ──▶ • Spawns PostgreSQL 16 Alpine & MongoDB 7.0 Service Containers
 │  (Integration & Unit)   │     • Runs 21 Automated Unit & Integration Tests (npm test)
 └────────┬────────────────┘
          │
          ▼
 ┌─────────────────────────┐
 │ Stage 4: Docker Build   │ ──▶ • Builds Multi-Stage Dockerfile for Backend API
 │  (Container Validation) │     • Builds Multi-Stage Dockerfile for Frontend Web Storefront
 └────────┬────────────────┘
          │
          ▼
 ┌─────────────────────────┐
 │ Stage 5: Compile & Ship │ ──▶ • Generates Production Distribution Bundles
 │  (Artifact Packaging)   │     • Archives Production Artifacts for Cloudflare Pages Deployment
 └─────────────────────────┘
```

### Pipeline Stages in Detail

| Pipeline Stage | Purpose | Implementation Details |
|---|---|---|
| **1. Security Audit & Secret Detection** | Pre-build security verification | Inspects git tree to enforce zero `.env` tracking; runs Software Composition Analysis (`npm audit`) against all workspace dependencies. |
| **2. Static Analysis (SAST)** | Codebase integrity & schema checks | Validates Prisma database schema; executes strict TypeScript typecheck (`tsc --noEmit`) across `apps/api` and `apps/web`. |
| **3. Automated Testing** | End-to-end integration validation | Boots ephemeral PostgreSQL 16 Alpine and MongoDB 7.0 Docker service containers; executes all 21 monorepo tests. |
| **4. Docker Container Verification** | Container build & config validation | Executes Docker Buildx for API and Web images to ensure zero Dockerfile regressions or broken layer caches. |
| **5. Production Compilation** | Artifact packaging | Compiles optimized production bundles (Vite + Rollup + esbuild worker bundle) and archives them via `actions/upload-artifact@v4`. |

---

## 🔒 Security Implementation & DevSecOps Toolchain

The following table provides the complete inventory of security tools, packages, and controls implemented in this project, including their installation and execution:

| Security Domain | Tool / Library | Installation Command | How It Is Implemented in Project |
|---|---|---|---|
| **HTTP Security Headers** | `helmet` | `npm install helmet -w apps/api` | Configured in `server.ts` to enforce HTTP Strict Transport Security (HSTS), Content Security Policy (CSP), `X-Frame-Options: DENY`, and MIME type sniffing protection. |
| **Brute-Force & Rate Limiting** | `express-rate-limit` | `npm install express-rate-limit -w apps/api` | Implemented in `server.ts` to restrict repeated requests to sensitive endpoints (500 req/min per IP with window tracking). |
| **Cross-Origin Security** | `cors` | `npm install cors -w apps/api` | Enforces origin validation and credentialed cross-origin request policies between storefront and backend. |
| **Input Validation & Sanitization** | `zod` | `npm install zod -w apps/api` | Runtime schema validation across incoming API request bodies, preventing SQL injection, malformed types, and parameter pollution. |
| **Password Derivation (Edge)** | Web Crypto `crypto.subtle` | Built into Node.js 18+ / Cloudflare Workers | **PBKDF2 with 100,000 rounds** using HMAC-SHA-256 and unique per-user cryptographically random salts (`crypto.randomUUID()`). |
| **Password Hashing (API)** | `bcryptjs` | `npm install bcryptjs -w apps/api` | Salted password hashing for persistent PostgreSQL user authentication. |
| **Token Authentication** | `jsonwebtoken` | `npm install jsonwebtoken -w apps/api` | Stateless signed HMAC-SHA-256 JWT bearer tokens containing user ID, role claim, and strict expiration times. |
| **Vulnerability Scanning (SCA)** | `npm audit` | Built into `npm` CLI (`npm audit`) | Integrated into GitHub Actions CI pipeline to scan dependency trees for known CVE vulnerabilities. |
| **Zero-Trust Ingress** | Cloudflare Tunnel (`cloudflared`) | `cloudflare/cloudflared:latest` (Docker) | Establishes outbound-only HTTPS tunnels between containers and Cloudflare Edge; zero open inbound ports required on the host firewall. |
| **Secret Leakage Prevention** | Git ignore rules & Git check | Configured via `.gitignore` and CI scan | Multi-layer `.gitignore` rules prevent `.env`, `.env.local`, and `.env.production` files from ever entering source control. |

---

## 🐳 Containerization & Docker Implementation

The platform is containerized using multi-container **Docker Compose** configurations optimized for both development and production environments.

### Services Defined in `docker-compose.yml`

```yaml
services:
  # 1. Relational Database with persistent volume storage
  postgres:
    image: postgres:17-alpine
    container_name: interior-postgres
    ports: ["5433:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  # 2. Document Database for audits, customizer designs & reviews
  mongodb:
    image: mongo:7.0
    container_name: interior-mongo
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]

  # 3. Core Node.js / Express REST API Microservice
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: interior-api
    ports: ["4001:4000"]
    depends_on: [postgres, mongodb]

  # 4. React 18 / Vite / PWA Web Application
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: interior-web
    ports: ["5173:5173"]
    depends_on: [api]

  # 5. Cloudflare Tunnel Zero-Trust Ingress Sidecar
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: interior-cloudflared
    depends_on: [web, api]
```

### Docker Commands

```bash
# Start all container services in detached mode
docker compose up -d

# Check running container health and status
docker compose ps

# View live container logs
docker compose logs -f api

# Stop and gracefully tear down all containers
docker compose down
```

---

## 🖥️ Key Application Portals

The application implements strict **Role-Based Access Control (RBAC)** across three distinct interfaces:

### 1. Customer Storefront & Studio (`/`)
- High-speed product discovery categorized by living spaces (Living Room, Bedroom, Balcony, Terrace, etc.).
- Progressive infinite scroll rendering 8-piece batches (matching 2x4 mobile layout and responsive desktop grids).
- Interactive 360° Three.js Room Studio with wall roll square footage calculator.
- Unauthenticated guest cart preserved in session memory and merged automatically upon user authentication.

### 2. Executive Administration Portal (`/admin/login`)
- Dedicated corporate login portal completely separated from customer pages.
- Access to financial revenue charts, transaction ledgers, CSV report exports, and site-wide traffic telemetry.
- Role restricted to `ADMIN`. Unauthenticated requests to `/admin/*` are automatically intercepted and routed here.

### 3. Shop & Stock Manager Portal (`/stock/login`)
- Dedicated operations login portal for warehouse and showroom floor managers.
- Real-time inventory tracking, safety stock threshold warnings, stock movements, and order dispatch workflows.
- Role restricted to `STOCK_MANAGER` and `ADMIN`. Unauthenticated requests to `/stock/*` are automatically routed here.

---

## 📋 Step-by-Step Implementation & Installation Process

Follow these steps to set up, build, test, and run the project locally:

### Step 1: Clone the Repository
```bash
git clone https://github.com/golait123/interior-ecommerce.git
cd interior-ecommerce
```

### Step 2: Configure Environment Variables
Copy the sanitized environment configuration template. **Never commit actual production secrets to Git.**

```bash
# Root environment configuration
cp .env.example .env

# Web application environment configuration
cp .env.example apps/web/.env
```

Review `.env` and adjust database credentials and secrets as needed:
```ini
DATABASE_URL="postgresql://interior:interior_dev@localhost:5432/interior_ecommerce?schema=public"
JWT_SECRET="replace-with-a-long-random-secret-at-least-48-chars"
PORT=4000
NODE_ENV=development
WEB_URL=http://localhost:5173
```

### Step 3: Install Workspace Dependencies
```bash
# Deterministic dependency installation across the monorepo workspace
npm install
```

### Step 4: Provision Database & Run Migrations
```bash
# Start PostgreSQL container via Docker
docker compose up -d postgres mongodb

# Generate Prisma client bindings
npm run db:generate

# Push schema migrations to the database
npm run db:push

# Seed initial catalog categories and spaces
npm run db:seed
```

### Step 5: Run Automated Tests & Static Analysis
```bash
# Execute static typecheck across all workspaces (API & Web)
npm run typecheck

# Run complete automated test suite (21 unit and integration tests)
npm test
```

### Step 6: Start Local Development Servers
```bash
# Concurrently launches the Express API (port 4000) and Vite Web Storefront (port 5173)
npm run dev
```
- Storefront URL: `http://localhost:5173`
- API Endpoint: `http://localhost:4000/api/v1`
- Health Check: `http://localhost:4000/api/v1/health`

---

## 🧪 Testing & Quality Assurance

The codebase includes **21 automated unit and integration tests** executed across the monorepo workspaces:

```bash
# Run tests across both apps/api and apps/web
npm test
```

### Test Suite Execution Output
```
> test
> npm run test -w apps/api && npm run test -w apps/web

▶ Architectural Calculations
  ✔ calculates primary wall area accurately
  ✔ calculates billable area with 10% wastage
  ✔ computes wallpaper pricing with 18% GST
✔ Architectural Calculations

▶ Authentication & Security
  ✔ signs and verifies JWT tokens correctly
  ✔ rejects invalid or tampered JWT tokens
  ✔ hashes and compares passwords securely with bcrypt
✔ Authentication & Security

▶ MongoDB Data Model Verification
  ✔ verifies default roles and permissions
  ✔ validates 360 panorama room presets
✔ MongoDB Data Model Verification
ℹ apps/api: 8 tests passed, 0 failed

▶ Cloudflare KV Authentication Unit Tests
  ✔ hashes password with PBKDF2 (100k iterations) and verifies correctly
  ✔ normalizes mobile keyboard case variations on email
  ✔ enforces ACID consistency on user duplicate registration
  ✔ verifies CIA triad compliance: Confidentiality, Integrity, Availability
  ✔ strictly segregates public patron login from dedicated staff portals
  ✔ redirects unauthenticated routes to their respective dedicated login portal
✔ Cloudflare KV Authentication Unit Tests

▶ Storefront Pricing & Cart Logic
  ✔ formats Indian Rupee (INR) currency correctly
  ✔ calculates cart item subtotal and totals
  ✔ computes 3D room panorama aspect ratio
  ✔ preserves pending unauthenticated item and restores into cart on login
  ✔ strictly isolates products by selected room/space (Bedroom, Living Room, Pooja, etc.)
  ✔ returns all items across rooms when All Interior or All Exterior is selected
  ✔ progressively batches items for infinite scroll (8 items per scroll batch)
✔ Storefront Pricing & Cart Logic
ℹ apps/web: 13 tests passed, 0 failed

Total: 21 tests passed, 0 failed
```

---

## ☁️ Production Deployment Workflow

The live application is hosted on **Cloudflare Pages with Cloudflare Edge Workers**:

```bash
# 1. Navigate to web application directory
cd apps/web

# 2. Build production assets and compile edge worker bundle
npm run build

# 3. Deploy to Cloudflare Pages via Wrangler CLI
npx wrangler pages deploy dist --project-name interiorg --commit-dirty=true
```

- **Live URL**: [https://interiorg.pages.dev](https://interiorg.pages.dev)
- **Admin Portal**: [https://interiorg.pages.dev/admin/login](https://interiorg.pages.dev/admin/login)
- **Shop Manager Portal**: [https://interiorg.pages.dev/stock/login](https://interiorg.pages.dev/stock/login)

---

## 👤 Author & Contact

**Kapil Golait**  
- **GitHub**: [@golait123](https://github.com/golait123)  
- **Repository**: [https://github.com/golait123/interior-ecommerce](https://github.com/golait123/interior-ecommerce)  
- **Live Platform**: [https://interiorg.pages.dev](https://interiorg.pages.dev)  
- **Email**: [kapilgolait@gmail.com](mailto:kapilgolait@gmail.com)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
