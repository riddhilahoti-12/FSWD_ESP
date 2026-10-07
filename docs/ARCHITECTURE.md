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

---

## 6. Real 3D Room Engine & Exploration System (Phase 3)

### 6.1 Architectural Decoupling: Mission Engine vs 3D Layer
The 3D room is strictly a **client presentation and interaction interface** for the authoritative Mission Engine:
```
3D OBJECT (Mesh / Raycaster)
        │
        ▼ (User Hover / Click)
INTERACTIVE OBJECT WRAPPER
        │
        ▼ (POST /api/missions/:id/interactions/:interactionId)
MISSION ENGINE (Authoritative Validation & Rules)
        │
        ▼ (Commit to DB)
AUTHORITATIVE MISSION STATE + EVENTS
        │
        ▼ (React Three Fiber / State Sync)
3D SCENE VISUALLY REACTS (Lighting, Fan Rotation, Animations, Door Unlock)
```

- **Zero Rule Leaks**: 3D equipment components contain zero gameplay validation rules or hardcoded answers.
- **State-Driven Presentation**: Equipment components accept reactive props derived from authoritative `MissionState`:
  - `CoolingFan`: `isActive` toggles continuous blade rotation via `useFrame` only when Stage 4 completes or cooling is energized.
  - `WarningBeacon`: Emissive strobe frequency and dynamic point light toggle `ACTIVE`, `WARNING`, and `OFF`.
  - `LockedCabinet`: Electronic lock LED changes from red to green, and door rotates open ~77° via `THREE.MathUtils.damp`.
  - `ExitDoor`: Pneumatic blast doors slide open laterally when `isExitUnlocked === true`.

### 6.2 Procedural Three.js Geometry (Zero External CDN Dependencies)
All 3D datacenter assets are constructed purely from procedural Three.js geometries (`BoxGeometry`, `CylinderGeometry`, `PlaneGeometry`, `RingGeometry`, `SphereGeometry`):
- **Structural Shell**: 14m (W) × 18m (D) × 5.5m (H) room with raised anti-static datacenter floor tiles, dark acoustic dampening wall panels, corner pillars, and acoustic baffle drop ceiling.
- **Cable Trays**: Overhead yellow fiber raceways and suspended wire mesh cable ladders.
- **Server Racks**: Dual cold/hot aisle rows of 42U server cabinets with rack-mount blade modules, perforated tinted glass doors, and 24 instanced activity LEDs with asynchronous blinking frequencies.
- **Lighting**: Cool fluorescent overhead luminaires, balanced ambient illumination, and alert point lights.
- **Environment**: Lightweight HVAC atmospheric dust motes with cyclic bounding box wraparound.

### 6.3 Exploration Camera & Collision Detection
- **First-Person Controls**: Pointer lock mouse-look combined with `W`, `A`, `S`, `D` keyboard traversal.
- **Collision Boundary Clamping**: Student camera eye height is locked at 1.65m. Traversal is bounded to `X: [-6.0, 6.0]` and `Z: [-7.8, 7.8]`.
- **Bounding Box Obstacle Exclusion**: Camera cannot walk through the server rack rows, CRAC blower housing, or equipment cabinet.
- **Modal Input Pausing**: When inspection panels or questions open, movement input is automatically paused to permit clean pointer interaction.

### 6.4 Custom Cursor & Interaction System
- **Custom Dual-Circle Reticle**: Center aiming reticle composed of an outer pulsing tracking ring, an inner focus dot, and an optional semantic hover badge.
- **Interactive Object Raycasting**: `InteractiveObject` listens to pointer events, computes outline highlight wireframes, and exposes unified click handling.
- **Interaction Prompt**: Floating contextual HUD indicator near screen center indicating target hardware name and interaction status.

### 6.5 Web Audio API Procedural Sound Engine
Zero external audio file assets or copyrighted sound dependencies. A lightweight synthesizer generates procedural sound effects:
- `playClick`: Short high-frequency sine pip.
- `playUnlock`: Two-tone ascending chime (C5 -> G5).
- `playAlert`: Pulsing industrial sawtooth alarm burst.
- `playCompletion`: Four-tone harmonic completion arpeggio (C5 -> E5 -> G5 -> C6).
- **Global Mute**: Persistent client-side audio toggle (`soundEffects.toggleMute()`).

### 6.6 Performance & WebGL Fallback
- **Frame Budget**: Reusable instanced geometries and materials, clamped dynamic pixel ratio `[1, 1.5]`, power-preference `'high-performance'`.
- **SSR Safety**: `MissionCanvas` is dynamically imported via `next/dynamic` with `{ ssr: false }` to prevent hydration mismatches and server-side WebGL errors.
- **Hardware Fallback**: `WebGLFallback` detects missing WebGL/WebGL2 support and gracefully offers recovery links without crashing.

---

## 7. Phase 4 — Real IoT Simulation & Telemetry Engine

```
IoT Adapter (Mock / Wokwi / Physical)
               │
               ▼
           IoTService
               │
               ├───────────────────► TelemetryService (Cache + 60-sample ring buffer)
               ▼                               │
         Mission Engine                        ▼
               │                          MongoDB (Throttled append-only)
               ▼                               │
           Socket.IO ◄─────────────────────────┘
               │ (iot:telemetry)
               ▼
    Next.js / Zustand (useIoTStore)
               │ (Selective subscriptions)
               ▼
       3D Server Room Equipment
       - Live OLED temp/humidity displays
       - Actuator-driven fan spinning
       - Beacon strobe & buzzer alert
```

### 7.1 Architecture & Adapters
- **Adapter Abstraction**: `IoTService` delegates to registered `IoTAdapter` implementations (`MockIoTAdapter`, `WokwiAdapter`, `PhysicalESP32Adapter`).
- **Mock Simulation Engine**: Runs an authentic 1.5-second physics loop with realistic Brownian jitter and 5 simulation modes (`NORMAL`, `OVERHEATING`, `COOLING`, `WATER_ALERT`, `RECOVERY`).
- **Wokwi & Physical Boundaries**: `WokwiAdapter` and `PhysicalESP32Adapter` provide clean stubs that report integration boundaries without faking online state or crashing.
- **Wokwi Project Artifacts**: Complete circuit schematic (`diagram.json`) and ESP32 firmware (`sketch.ino`) placed in `iot/wokwi/rescue-server-room/`.

### 7.2 Realtime Socket.IO & Bidirectional Flow
- **Room Subscriptions**: Students join `mission:{missionId}` on stage entry; administrators join `device:{deviceId}`.
- **Selective Zustand Subscriptions**: R3F components subscribe to individual primitives (e.g. `state.sensors.temperatureC`) preventing scene graph re-creation on every 1.5s tick.
- **Role-Based Command Guards**: Students can issue gameplay actions (`SET_FAN`), while simulation overrides (`SET_SIMULATION_MODE`, `SET_TEMPERATURE`) require `ADMIN` authorization.
- **Admin Simulator**: Technical workbench at `/simulator` for live telemetry graphs, hardware mode toggles, and override commands.


