# InteriorG — Enterprise Architectural & Living Interior Commerce Platform

[![Live Application](https://img.shields.io/badge/Live%20Storefront-interiorg.pages.dev-0f2444?style=for-the-badge&logo=cloudflare&logoColor=white)](https://interiorg.pages.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Cloudflare Pages & Workers](https://img.shields.io/badge/Cloudflare-Edge%20KV%20%26%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-ACID%20Transactions-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Security Pass](https://img.shields.io/badge/Security-PBKDF2%20%7C%20RBAC%20%7C%20TLS%201.3-emerald?style=for-the-badge&logo=shield&logoColor=white)](#security-architecture--implementation)
[![Tests Passing](https://img.shields.io/badge/Unit%20Tests-13%2F13%20Passing-brightgreen?style=for-the-badge&logo=jest&logoColor=white)](#testing--quality-assurance)

> **InteriorG** is a modern omnichannel e-commerce and architectural studio platform designed for custom wall murals, luxury solid-wood furniture, and living botanical interior decors. Engineered as a high-availability, zero-paid-tier distributed system utilizing **Cloudflare Pages, Edge Workers KV, React 18, and PostgreSQL transactions**.

---

## 📑 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Key Portals & Features](#key-portals--features)
3. [Technology Stack & Tooling](#technology-stack--tooling)
4. [Security Architecture & Implementation](#security-architecture--implementation)
5. [Step-by-Step Installation & Setup](#step-by-step-installation--setup)
6. [Testing & Quality Assurance](#testing--quality-assurance)
7. [Cloudflare Edge Deployment](#cloudflare-edge-deployment)
8. [Core Architectural Decisions (Recruiter Highlights)](#core-architectural-decisions-recruiter-highlights)
9. [Author & Contact](#author--contact)

---

## 🏛️ Architecture Overview

The system is constructed with a modern **Edge-First hybrid distributed architecture**. Storefront static assets, edge caching, and low-latency API handlers run on globally distributed Cloudflare edge runtimes with sub-50ms latency across 300+ edge locations worldwide.

```
                                ┌──────────────────────────────────────────────┐
                                │               Global End-Users               │
                                └──────────────────────┬───────────────────────┘
                                                       │
                                        HTTPS / TLS 1.3 Routing
                                                       ▼
                                ┌──────────────────────────────────────────────┐
                                │         Cloudflare Global Edge Network       │
                                │   • DDoS Mitigation & SSL/TLS Termination    │
                                │   • CDN Static Asset Delivery (Vite/PWA)     │
                                └──────────────────────┬───────────────────────┘
                                                       │
                                  ┌────────────────────┴────────────────────┐
                                  ▼                                         ▼
            ┌─────────────────────────────────────────┐   ┌─────────────────────────────────────────┐
            │       Client Application (SPA / PWA)    │   │      Cloudflare Edge Worker API         │
            │  • React 18 & TypeScript                │   │  • Fast Edge Auth (PBKDF2 Salted)       │
            │  • 360° Studio & Three.js Visualizer    │   │  • Catalog & Space Hierarchy Resolver   │
            │  • Infinite Scroll & Smart Filters      │   │  • Real-Time Traffic Telemetry Engine   │
            │  • Unauthenticated Cart Sync            │   │  • Cloudflare KV Database Persistence   │
            └─────────────────────────────────────────┘   └────────────────────┬────────────────────┘
                                                                               │
                                                                       Prisma ORM Client
                                                                               ▼
                                                          ┌─────────────────────────────────────────┐
                                                          │          PostgreSQL Database            │
                                                          │  • ACID Serializable Stock Locks        │
                                                          │  • Multi-Tier Role RBAC Tables          │
                                                          │  • Immutable Audit & Movement Logs      │
                                                          └─────────────────────────────────────────┘
```

---

## 🌟 Key Portals & Features

### 1. Customer Sanctuary (Public Storefront & Visualizer)
- **Living Space Hierarchy Filter**: Categorized across **Interior** (Living Room, Bedroom, Dining, Study, Pooja Room, Hall) and **Exterior** (Balcony, Lawn, Patio, Terrace, Parking) with zero cross-contamination.
- **Progressive Infinite Scroll**: 8-item batch progressive loading matching mobile 2x4 orientation and desktop responsive grids with `IntersectionObserver`.
- **360° Room Studio & AR Visualization**: Interactive wall projection tools with dynamic wall-roll square footage calculators.
- **Frictionless Unauthenticated Cart Preservation**: Visitors can configure custom wallpapers and add items to bag; upon authentication, pending selections are safely merged into their persistent account.

### 2. Executive Administration Portal (`/admin/login`)
- **Restricted Access URL**: Isolated corporate login strictly decoupled from public customer flows.
- **Financial Analytics & Revenue Ledger**: Annual, quarterly, and monthly breakdowns with CSV export capabilities.
- **Live Traffic Telemetry**: Real-time pageview monitoring, active device breakdown, and geographic session analytics.
- **Global Catalog Management**: Modal-driven product authoring with instant edge cache invalidation.

### 3. Shop & Stock Manager Portal (`/stock/login`)
- **Warehouse & Floor Inventory**: Real-time stock counts, reserved stock monitoring, and safety stock threshold warnings.
- **Transactional Stock Movements**: Stock adjustments write directly to ledger with strict audit trails.
- **Order Dispatch & Logistics Tracking**: Order stage lifecycle management (Draft, Processing, Packed, Shipped, Delivered).

---

## 🛠️ Technology Stack & Tooling

| Domain | Technology / Tool | Version | Purpose in Architecture |
|---|---|---|---|
| **Frontend Framework** | React | `18.3.x` | Declarative component UI and concurrent rendering |
| **Language** | TypeScript | `5.5.x` | Strict end-to-end type safety and interface contracts |
| **Build & Tooling** | Vite & Rollup | `5.4.x` | Next-generation fast HMR, tree-shaking, and asset bundling |
| **Styling & Design** | Tailwind CSS | `4.x` | Utility-first responsive design system with custom luxury tokens |
| **State & Cache** | TanStack React Query | `5.x` | Asynchronous server state, optimistic mutations, and background refetching |
| **Routing** | React Router | `6.x` | Declarative client-side routing, protected gatekeepers, and deep linking |
| **Icons & Media** | Lucide React | `latest` | High-fidelity featherweight vector iconography |
| **3D & Canvas** | Three.js / HTML5 Canvas | `latest` | 360° panoramic room texture projection and wallpaper roll calculator |
| **Edge Compute** | Cloudflare Workers | `ESM ES2022` | Ultra-low latency serverless edge API endpoints |
| **Edge Deployment** | Cloudflare Pages & Wrangler | `4.156.x` | Zero-cost edge deployment, CDN caching, and automated builds |
| **Database & ORM** | PostgreSQL & Prisma | `5.x` | Relational storage with strict foreign keys and ACID transactions |
| **Testing Engine** | Node.js Test Runner & `tsx` | `v20+` | Zero-dependency native unit and integration testing |

---

## 🔒 Security Architecture & Implementation

Security is engineered into the platform using **Defense-in-Depth** and **Zero-Trust** architectural principles:

```
                                  ┌──────────────────────────────────────────┐
                                  │   Zero-Leakage Secret Isolation Policy   │
                                  │   Strict .gitignore / No .env Commits    │
                                  └────────────────────┬─────────────────────┘
                                                       │
                                                       ▼
                                  ┌──────────────────────────────────────────┐
                                  │     Role-Based Access Control (RBAC)     │
                                  │    CUSTOMER  |  STOCK_MANAGER  |  ADMIN  │
                                  └────────────────────┬─────────────────────┘
                                                       │
                                                       ▼
                                  ┌──────────────────────────────────────────┐
                                  │    PBKDF2 Cryptographic Password Hash    │
                                  │  100,000 Iterations • SHA-256 HMAC Salt  │
                                  └────────────────────┬─────────────────────┘
                                                       │
                                                       ▼
                                  ┌──────────────────────────────────────────┐
                                  │     ACID Row-Locking Stock Mutator       │
                                  │  Prevents Overselling & Race Conditions  │
                                  └──────────────────────────────────────────┘
```

### 1. Cryptographic Password Hashing (PBKDF2)
- Passwords are never stored in plaintext or weak single-pass MD5/SHA1 hashes.
- Utilizes the **Web Crypto API (`crypto.subtle`)** executing **PBKDF2** with:
  - **Algorithm**: `PBKDF2` with `HMAC-SHA-256`
  - **Iterations**: `100,000` rounds
  - **Entropy**: Cryptographically secure unique random salt (`crypto.randomUUID()`) per user.
  - **Stored Format**: `pbkdf2:<salt>:<hex-digest>`

### 2. Multi-Tier Role-Based Access Control (RBAC)
- **Role Hierarchy**:
  - `CUSTOMER`: Limited to browsing catalog, managing personal orders, updating addresses, and checkout.
  - `STOCK_MANAGER`: Authorized for stock reservations, warehouse floor counts, and delivery tracking.
  - `ADMIN`: Full clearance for revenue ledgers, traffic logs, user accounts, and global catalog mutations.
- **Route Gatekeepers (`ProtectedRoute`)**: Unauthenticated requests to `/admin/*` are automatically intercepted and routed to the dedicated `/admin/login` portal; unauthenticated requests to `/stock/*` are intercepted and routed to `/stock/login`.

### 3. Portal Decoupling & Zero-Credential Leakage
- **Public Patron Login Sanitization**: The customer login page (`/login`) is strictly scrubbed of all staff and management credentials.
- **Dedicated Staff Portal**: Corporate access is segregated into [`/admin/login`](https://interiorg.pages.dev/admin/login) and [`/stock/login`](https://interiorg.pages.dev/stock/login).
- If an unauthorized customer role attempts to authenticate via the staff portal, access is immediately revoked with an audit warning, and the user is redirected to the customer sanctuary.

### 4. ACID Concurrency & Stock Overselling Prevention
- Inventory operations utilize PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) within serializable database transactions.
- Prevents race conditions during high-concurrency flash sales; stock availability is evaluated at checkout, reserved atomically, and automatically released if payment drops.

### 5. Environment Secrets Hygiene
- **Strict `.gitignore` Policy**: Rules prevent `.env`, `.env.local`, and any local credential files from ever entering git tracking.
- Only `.env.example` (containing sanitized parameter keys with empty placeholder values) is committed to guide local setups.

---

## 🚀 Step-by-Step Installation & Setup

### Prerequisites
- **Node.js**: `v18.17.0` or `v20.x` or later
- **npm**: `v9.x` or later
- **Git**: Installed and configured
- **Docker** *(Optional, for local PostgreSQL database)*

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/golait123/interior-ecommerce.git
cd interior-ecommerce
```

---

### Step 2: Configure Environment Variables
Copy the template configuration files. **Never commit actual production secrets to Git.**

```bash
# Root environment configuration
cp .env.example .env

# Frontend web app configuration
cp .env.example apps/web/.env
```

Review `.env` and configure your local settings:
```ini
# Database (PostgreSQL)
DATABASE_URL="postgresql://interior:interior_dev@localhost:5432/interior_ecommerce?schema=public"

# Auth Secret (Minimum 48 characters)
JWT_SECRET="replace-with-a-long-random-secret-at-least-48-chars"

# Server Configuration
PORT=4000
NODE_ENV=development
WEB_URL=http://localhost:5173
```

---

### Step 3: Install Dependencies
Install dependencies across the monorepo workspace:

```bash
# Install root and workspace dependencies
npm install

# Install web app dependencies
cd apps/web
npm install
cd ../..
```

---

### Step 4: Database Setup & Schema Migrations (Optional for Full API Mode)
If running with the PostgreSQL backend:

```bash
# Start local PostgreSQL container via Docker
docker compose up -d postgres

# Generate Prisma client bindings
npm run db:generate

# Execute database schema migrations
npm run db:migrate

# Seed catalog categories, spaces, and initial products
npm run db:seed
```

---

### Step 5: Run the Development Server

#### Option A: Running the Edge Storefront (Fastest, Zero Docker Required)
The web application includes an edge worker mock runtime supporting instant offline development:

```bash
cd apps/web
npm run dev
```
Open your browser at: **`http://localhost:5173`**

#### Option B: Running the Full Stack (API + Storefront)
```bash
# From the repository root
npm run dev
```
- **Web Storefront**: `http://localhost:5173`
- **Backend API**: `http://localhost:4000`
- **Health Check**: `http://localhost:4000/api/v1/health`

---

## 🧪 Testing & Quality Assurance

The repository includes a suite of automated unit tests covering cryptographic security, ACID transaction integrity, cart persistence, and catalog filtering.

### Execute Automated Test Suite
```bash
cd apps/web
npm test
```

### Verified Test Cases
```
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

ℹ tests: 13 passed, 0 failed
```

### Run Static Analysis & Type Checking
```bash
cd apps/web
npx tsc --noEmit
```

---

## ☁️ Cloudflare Edge Deployment

The production environment is deployed as a high-performance, globally distributed application on **Cloudflare Pages with Cloudflare Workers**:

```bash
# 1. Navigate to web application directory
cd apps/web

# 2. Build production assets and compile edge worker bundle
npm run build

# 3. Deploy to Cloudflare Pages (Requires Cloudflare API token or CLI login)
npx wrangler pages deploy dist --project-name interiorg --commit-dirty=true
```

Live Production Deployment: **[interiorg.pages.dev](https://interiorg.pages.dev)**

---

## 💡 Core Architectural Decisions (Recruiter Highlights)

| Challenge | Engineering Solution | Business & User Impact |
|---|---|---|
| **Zero Infrastructure Cost** | Leveraged Cloudflare Pages, Edge Worker ESM, and in-memory KV fallbacks. | Zero server hosting bills, sub-50ms worldwide asset delivery, and instant auto-scaling. |
| **High Concurrency Stock Overselling** | PostgreSQL serializable transactions with row-level locks (`SELECT ... FOR UPDATE`). | Guarantees absolute inventory accuracy; eliminates double-booking during flash sales. |
| **Enterprise Security & Privacy** | Multi-tier RBAC with dedicated portals (`/admin/login`, `/stock/login`) and PBKDF2 (100k rounds). | Eliminates credential leakage on public forms; protects company telemetry and ledgers. |
| **Mobile Catalog Usability** | 2x4 responsive grid with progressive `IntersectionObserver` infinite scrolling. | Seamless mobile shopping experience without layout shifting or heavy initial payload penalties. |
| **Frictionless Conversion Flow** | Unauthenticated guest cart preserved across sessions and merged upon sign-in. | Prevents cart abandonment; eliminates user frustration of re-searching items after login. |

---

## 👤 Author & Contact

**Kapil Golait**  
- **GitHub**: [@golait123](https://github.com/golait123)  
- **Repository**: [https://github.com/golait123/interior-ecommerce](https://github.com/golait123/interior-ecommerce)  
- **Live Application**: [https://interiorg.pages.dev](https://interiorg.pages.dev)  
- **Inquiries**: [kapilgolait@gmail.com](mailto:kapilgolait@gmail.com)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
