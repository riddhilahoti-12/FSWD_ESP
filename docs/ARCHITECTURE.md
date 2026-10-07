# MissionX Architecture Documentation (Phase 1)

## 1. System Overview
MissionX is an educational 3D escape-room platform where students solve technical engineering missions inside interactive virtual environments with IoT hardware context.

## 2. Monorepo Organization
```
MISSIONX/
├── apps/
│   ├── web/        # Next.js 14 App Router, React 18, Tailwind CSS, TanStack Query, Zustand
│   └── api/        # Express.js + TypeScript, MongoDB/Mongoose, Socket.IO
├── packages/
│   └── shared/     # Shared TypeScript contracts, Zod schemas, and API definitions
├── iot/
│   ├── mocks/      # Future mock IoT hardware adapters
│   └── wokwi/      # Future Wokwi ESP32 circuits and firmware
├── docs/           # System documentation
├── .env.example    # Configuration template
├── README.md       # Project guide and instructions
└── package.json    # Monorepo workspaces definition
```

## 3. Security & Authentication Model
- **Roles**: `STUDENT` and `ADMIN`.
- **Registration**: All incoming user registrations are strictly set to `STUDENT` role on the server regardless of request inputs.
- **Passwords**: Hashed with bcrypt (10 salt rounds). Plaintext passwords and `passwordHash` are never leaked to clients.
- **Tokens**: JSON Web Tokens (JWT) signed with `JWT_SECRET` and validated via `requireAuth` middleware.
- **Admin Guard**: Protected by `requireAdmin` middleware enforcing role checks.

## 4. Database Schema (Mongoose)
- **User**: Name, unique lowercase email, passwordHash, role, and gamification stats (`xp`, `missionsCompleted`, `missionsStarted`, `averageScore`).
- **Mission**: Title, unique slug, domain, difficulty, description, briefing, learning objectives, estimated duration, thumbnail, published state, version, and creator.
- **Progress**: Compound unique index on `{ studentId, missionId }`. Tracks currentStage, completedStages, score, attempts, hintsUsed, elapsedTime, status (`NOT_STARTED` | `IN_PROGRESS` | `COMPLETED`), startedAt, and completedAt.
