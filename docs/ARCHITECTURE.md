# MissionX Architecture Documentation

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

---

## 3. Mission Engine Architecture (Phase 2)

### 3.1 Data-Driven Core Principle
Mission logic is **never hardcoded inside frontend or 3D components**. All mission rules, telemetry bounds, staged challenges, unlock conditions, and reward policies reside authoritatively in the **Mission Engine**.

The system operates on an event-driven flow:

```
[ 3D Object / Debug Workbench ]
              │ (Click / Inspect / Answer)
              ▼
[ Client Interaction Bus ] (POST /api/missions/:id/interactions/:interactionId)
              │
              ▼
[ Server-Side Mission Engine ]
  ├─ 1. Load Authoritative Mission Definition (Registry / DB)
  ├─ 2. Load Student Progress (Mongoose)
  ├─ 3. Validate Interaction Availability (Stage lock check)
  ├─ 4. Validate Answer (Server-side tolerance & matching)
  ├─ 5. Evaluate Unlock Conditions (UnlockService)
  ├─ 6. Grant Rewards & XP (RewardService)
  └─ 7. Emit Strongly Typed Events (MissionEventService & Socket.IO)
              │
              ▼
[ Authoritative State Saved to MongoDB ]
              │
              ▼
[ Realtime Broadcast / Client State Sync ]
  ├─ Frontend HUD Updates (Score, Stage, Clues)
  └─ Future 3D Scene Reacts (Doors open, LED beacons toggle, fan spins)
```

### 3.2 Key Engine Components (`apps/api/src/services/mission/`)
1. **`MissionEngine.ts`**: The central orchestrator that resolves definitions, validates preconditions, executes question evaluation, advances stage state, and commits progress.
2. **`MissionValidator.ts`**: Server-authoritative answer validator supporting multiple choice, numeric values with floating-point tolerance, case-insensitive text/code, and sequences.
3. **`UnlockService.ts`**: Declarative condition evaluator supporting `STAGE_COMPLETED`, `QUESTION_CORRECT`, `OBJECT_INSPECTED`, `CLUE_REVEALED`, `ALL_REQUIRED_INTERACTIONS`, and `CODE_MATCH`.
4. **`RewardService.ts`**: Manages atomic distribution of XP, game score, clues, and badges.
5. **`MissionEventService.ts`**: Factory for strongly typed events emitted over WebSocket channels and persisted to the progress audit trail.
6. **`MissionRegistry.ts`**: Single source of truth for mission configurations (such as "Rescue the Server Room" with 4 diagnostic stages).

### 3.3 Security & Anti-Cheat Guarantees
- **Sanitized Client Views**: Correct answers, regexes, and tolerances are stripped before transmission to the frontend (`ClientQuestion`).
- **Server Authority**: Client attempts to inject fake scores, skip stages, or mutate completed lists are ignored; state transitions are computed strictly by server logic.
- **Session Isolation**: Student progress records are tied to authenticated JWT claims; cross-student progress mutation is strictly blocked.

---

## 4. Security & Authentication Model
- **Roles**: `STUDENT` and `ADMIN`.
- **Registration**: All incoming user registrations are strictly set to `STUDENT` role on the server regardless of request inputs.
- **Passwords**: Hashed with bcrypt (10 salt rounds). Plaintext passwords and `passwordHash` are never leaked to clients.
- **Tokens**: JSON Web Tokens (JWT) signed with `JWT_SECRET` and validated via `requireAuth` middleware.
- **Admin Guard**: Protected by `requireAdmin` middleware enforcing role checks.

---

## 5. Database Schema (Mongoose)
- **User**: Name, unique lowercase email, passwordHash, role, and gamification stats (`xp`, `missionsCompleted`, `missionsStarted`, `averageScore`).
- **Mission**: Title, unique slug, domain, difficulty, description, briefing, learning objectives, estimated duration, thumbnail, published state, version, and creator.
- **Progress**: Compound unique index on `{ studentId, missionId }`. Tracks `missionVersion`, `currentStage`, `completedStages`, `completedInteractions`, `answeredQuestions`, `unlockedObjects`, `revealedClues`, `usedHints`, `rewards`, `eventLog`, `score`, `attempts`, `hintsUsed`, `elapsedTime`, `status`, `startedAt`, and `completedAt`.
