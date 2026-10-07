# MissionX — IoT-Enabled 3D Escape Room Platform

MissionX is an educational 3D escape room platform designed to transform engineering and computer science learning into immersive, hardware-integrated mission challenges. Students enter virtual facilities, inspect equipment, analyze simulated environmental telemetry, and solve staged technical puzzles.

---

## 🚀 Phase 1 Foundation

Phase 1 establishes the full-stack architecture, database models, student authentication, and core mission library flow.

### ✨ Implemented in Phase 1:
- **Clean Monorepo Architecture**: Partitioned into `apps/web` (Next.js 14 App Router), `apps/api` (Express + TypeScript), and `packages/shared` (TypeScript types + Zod schemas).
- **Authentication & Security**: Secure bcrypt password hashing, JWT bearer token flow, `STUDENT` and `ADMIN` role protection, and server-side role enforcement.
- **MongoDB & Mongoose Schemas**: `User`, `Mission`, and `Progress` models with stats and progress lifecycle tracking.
- **Database Seeding**: Automated, idempotent seeder provisioning demo Admin, demo Student, and the flagship first mission: **"Rescue the Server Room"**.
- **MissionX Visual Design System**: Dark navy backdrop, subtle cyan/blue glow accents, and responsive glassmorphism.
- **Frontend Core Routes**:
  - `/` — Interactive landing page detailing the 4 core learning pillars.
  - `/login` — Secure student login with quickfill demo account buttons.
  - `/register` — Student registration.
  - `/dashboard` — Real-time student dashboard displaying XP, active/completed missions, and stats.
  - `/missions` — Mission library listing published simulations from MongoDB.
  - `/missions/[slug]` — Mission details page with briefing, problem overview, and learning objectives.
  - `/missions/[slug]/play` — Mission staging area confirming active session and stage tracking.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Zustand, TanStack Query, Socket.IO Client |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose, MongoDB, Socket.IO, Helmet, CORS |
| **Validation** | Zod schemas shared across client and server |
| **Security** | bcryptjs, jsonwebtoken, CORS origin isolation, helmet HTTP headers |

---

## 📁 Project Structure

```
MISSIONX/
├── apps/
│   ├── web/                     # Next.js 14 frontend application
│   │   ├── src/
│   │   │   ├── app/             # App Router pages (/ , /login, /register, /dashboard, /missions, /missions/[slug])
│   │   │   ├── components/      # Reusable Navbar, Footer, MissionCard, and UI elements
│   │   │   ├── lib/             # Centralized typed API client
│   │   │   ├── providers/       # TanStack QueryClientProvider
│   │   │   └── store/           # Zustand client auth store
│   │   └── tailwind.config.ts   # Design tokens & color system
│   └── api/                     # Express + TypeScript backend application
│       ├── src/
│       │   ├── config/          # Environment & MongoDB connection
│       │   ├── controllers/     # Auth, Mission, and Progress controllers
│       │   ├── middleware/      # JWT auth guard, Admin guard, Zod validation, error handler
│       │   ├── models/          # User, Mission, and Progress Mongoose schemas
│       │   ├── routes/          # Express route definitions
│       │   ├── seed/            # Idempotent database seeder
│       │   └── server.ts        # Express + Socket.IO server bootstrap
├── packages/
│   └── shared/                  # Shared TypeScript interfaces, types, and Zod schemas
├── iot/
│   ├── mocks/                   # Placeholders for future mock hardware adapters
│   └── wokwi/                   # Placeholders for future Wokwi ESP32 simulations
├── docs/                        # Architecture guides
├── .env.example                 # Environment configuration template
├── README.md                    # Project documentation
└── package.json                 # Monorepo workspaces definition
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9+ or higher
- **MongoDB**: A running MongoDB instance (locally on `mongodb://localhost:27017` or MongoDB Atlas)

---

### 1. Environment Setup

Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

Ensure your MongoDB URI and port settings match:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/missionx
JWT_SECRET=your_jwt_super_secret_key_change_in_production
CLIENT_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### 2. Install Dependencies

Install all workspaces from the project root:
```bash
npm install
```

---

### 3. Seed the Database

Run the database seeder to populate the demo accounts and the flagship mission **"Rescue the Server Room"**:
```bash
npm run seed
```

**Default Seed Credentials:**
- **Demo Student**: `student@missionx.edu` / `StudentPass123!`
- **Demo Admin**: `admin@missionx.edu` / `AdminPass123!`

---

### 4. Running the Applications

#### Run the Backend API (Port 5000):
```bash
npm run dev:api
```
*Health Check*: `http://localhost:5000/api/health`

#### Run the Frontend Web Client (Port 3000):
In a separate terminal:
```bash
npm run dev:web
```
*Web App*: `http://localhost:3000`

---

## 🧪 Acceptance Verification

You can verify all acceptance criteria:
1. Access `http://localhost:3000` — Landing page renders with hero and mission preview.
2. Click **Login** — Sign in with `student@missionx.edu` / `StudentPass123!` (or register a new account).
3. Access **Dashboard** — Displays active student name, XP counters, and empty or active mission lists.
4. Click **Explore Missions** — The mission library loads **"Rescue the Server Room"** from MongoDB.
5. Click **START MISSION** — Mission details screen displays the briefing, problem description, and 6 learning objectives.
6. Click **ENTER MISSION** — A `Progress` document is created in MongoDB (`status: IN_PROGRESS`), and the student is routed to the staging area.
7. Return to **Dashboard** — Reflects the mission now in progress.
8. Click **Logout** — Session ends and state resets cleanly.

---

## 🔮 Upcoming Phases
- **Phase 2**: Mock IoT Adapter Engine & Real-Time Socket.IO Telemetry Streaming (DHT22 temperature & humidity, fan state, and water sensor).
- **Phase 3**: Staged Diagnostic Logic for "Rescue the Server Room" (Step 1: Diagnostics, Step 2: Cooling Breaker, Step 3: Water/Drainage, Step 4: Stabilization).
- **Phase 4**: React Three Fiber 3D Server Room Environment (Spacial racks, server LEDs, interactive consoles).
- **Phase 5**: Wokwi ESP32 Circuit Bridge & Physical Hardware MQTT Adapter.
