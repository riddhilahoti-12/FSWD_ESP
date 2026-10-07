# MissionX — IoT Architecture & Telemetry Engine (Phase 4)

## Overview & Core Principles

MissionX is designed around an **Adapter Architecture** for IoT hardware and simulation. The core gameplay loop and Mission Engine must never couple directly to any specific hardware platform, proprietary cloud bridge, or emulator. 

```
                          ┌──────────────────────────┐
                          │   Mission Engine / UI    │
                          └─────────────┬────────────┘
                                        │ Commands / Telemetry
                                        ▼
                          ┌──────────────────────────┐
                          │        IoTService        │
                          └─────────────┬────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│    MockIoTAdapter    │     │     WokwiAdapter     │     │ PhysicalESP32Adapter │
│    [IMPLEMENTED]     │     │   [BOUNDARY STUB]    │     │   [BOUNDARY STUB]    │
└──────────┬───────────┘     └──────────┬───────────┘     └──────────┬───────────┘
           ▼                            ▼                            ▼
  Virtual Physics Loop         Wokwi ESP32 WebSockets       MQTT Hardware Broker
```

---

## Implementation Status Matrix

| Component | Status | Description |
| :--- | :--- | :--- |
| **IoTService & IoTRegistry** | **IMPLEMENTED** | Central registry managing adapters, device routing, and lifecycle. |
| **MockIoTAdapter** | **IMPLEMENTED** | Realtime physics loop generating bounded jitter, 5 simulation modes, and commands. |
| **TelemetryService** | **IMPLEMENTED** | Ring buffer (60 samples), MongoDB throttled persistence (4s), Socket.IO publisher. |
| **CommandService** | **IMPLEMENTED** | Strict Zod validation and role-based execution guards (STUDENT vs ADMIN). |
| **Socket.IO Realtime Layer**| **IMPLEMENTED** | Rooms `mission:{missionId}` and `device:{deviceId}`, reconnect state recovery. |
| **3D R3F Room Integration** | **IMPLEMENTED** | Selective Zustand subscriptions updating equipment, LED beacons, fan animations. |
| **IoT Simulator Workbench** | **IMPLEMENTED** | Dedicated route `/simulator` for administrative observation and manual overrides. |
| **Wokwi Project Artifacts** | **SIMULATED** | Circuit schematic (`diagram.json`) and ESP32 firmware (`sketch.ino`) in `iot/wokwi/`. |
| **WokwiAdapter** | **PLANNED** | Defined boundary stub; reports unconfigured boundary without crashing. |
| **PhysicalESP32Adapter** | **PLANNED** | Defined boundary stub for future MQTT broker integration. |

---

## 1. IoT Adapter Interface Contract

All adapters conform to the typed `IoTAdapter` interface defined in `apps/api/src/services/iot/IoTAdapter.ts`:

```typescript
export interface IoTAdapter {
  readonly name: string;
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): boolean;
  getTelemetry(deviceId: string): Promise<IoTTelemetry | null>;
  sendCommand(deviceId: string, command: IoTCommand): Promise<{ success: boolean; message: string }>;
  getStatus(deviceId: string): Promise<IoTDeviceStatus>;
  onTelemetry(callback: (telemetry: IoTTelemetry) => void): void;
}
```

---

## 2. MockIoTAdapter & Simulation Loop

The `MockIoTAdapter` provides an authentic hardware experience for development and classroom environments without requiring physical hardware:

- **Tick Rate**: Runs on a 1.5-second interval timer.
- **Canonical Baseline**:
  - `temperatureC`: 31.8 °C
  - `humidityPct`: 68.0 %
  - `waterDetected`: false
  - `fan`: true (running)
  - `warningLed`: true (active alert)
  - `buzzer`: false
- **Bounded Realistic Jitter**: Temperature fluctuates smoothly with bounded Brownian noise (±0.08°C per tick).
- **Simulation Modes**:
  1. `NORMAL`: Temperature gravitates toward safe 22.5°C – 24.5°C; humidity settles near 48–52%; alarms clear.
  2. `OVERHEATING`: Temperature rises steadily toward 33.5°C – 35.0°C; if cooling fan is shut down, temperature climbs to 38.0°C.
  3. `COOLING`: Cooling restoration brings temperature downward at 0.18°C per tick toward normal.
  4. `WATER_ALERT`: `waterDetected` triggers `true`, voltage sets to 3.3V, buzzer and beacon activate.
  5. `RECOVERY`: Telemetry systematically normalizes after students execute proper corrective procedures.

---

## 3. Telemetry Ingestion & Storage Strategy

Telemetry flows through `TelemetryService`:

```
IoT Adapter
    │
    ▼
TelemetryService.ingestTelemetry()
    ├──► Updates In-Memory Cache (O(1) instant reads)
    ├──► Appends to 60-sample Ring Buffer (History graph)
    ├──► Throttles MongoDB Persistence (Writes every 4s to prevent DB thrashing)
    └──► Socket.IO Broadcast to `mission:{missionId}` and `device:{deviceId}`
```

### MongoDB Append-Only Schema
Telemetry entries are immutable and stored in the `telemetries` collection with compound indexes:
```typescript
{
  deviceId: String,
  missionId: String,
  timestamp: Date,
  sensors: {
    temperatureC: Number,
    humidityPct: Number,
    waterDetected: Boolean,
    voltage: Number
  },
  actuators: {
    fan: Boolean,
    warningLed: Boolean,
    buzzer: Boolean,
    breakerTripped: Boolean
  },
  simulationMode: String,
  metadata: Object
}
```

---

## 4. Socket.IO Realtime Protocol

### Namespaces & Rooms
- Room `mission:{missionId}`: Joined by students and mission observers when mounting a mission session.
- Room `device:{deviceId}`: Joined by administrators and debugging tools.

### Event Format (`iot:telemetry`)
```json
{
  "type": "iot:telemetry",
  "telemetry": {
    "deviceId": "server-room-esp32",
    "missionId": "rescue-the-server-room",
    "timestamp": "2026-10-08T01:14:00.000Z",
    "sensors": {
      "temperatureC": 31.9,
      "humidityPct": 67.8,
      "waterDetected": false
    },
    "actuators": {
      "fan": true,
      "warningLed": true,
      "buzzer": false
    },
    "simulationMode": "OVERHEATING"
  }
}
```

### Reconnection Resilience
The frontend Socket.IO client (`useIoTStore.ts`):
1. Detects `disconnect` events and presents a "Realtime connection lost" banner.
2. Upon `reconnect`, automatically re-joins the mission room.
3. Immediately fetches authoritative state via `GET /api/telemetry/:missionId` to reconcile any missed ticks during disconnect.

---

## 5. Security & Access Control

1. **Client Trust Policy**: Clients NEVER send authoritative sensor telemetry (e.g. clients cannot push `temperature: 100`). Telemetry is exclusively ingested from adapters.
2. **Command Validation**: All incoming commands pass through `ioTCommandSchema` (Zod).
3. **Role Enforcement**:
   - **Students**: Permitted to trigger gameplay commands mapped to mission interactions (`SET_FAN`, `RESET_ALARM`).
   - **Admins Only**: Permitted to alter simulation physics or debug states (`SET_SIMULATION_MODE`, `SET_TEMPERATURE`, `SET_HUMIDITY`, `SET_WATER`).
   - Requests attempting unauthorized simulation controls return `HTTP 403 FORBIDDEN`.

---

## 6. Integration Boundaries: Wokwi & Physical ESP32

### Wokwi Boundary (`WokwiAdapter`)
- Located at `apps/api/src/services/iot/WokwiAdapter.ts`.
- If `WOKWI_BRIDGE_URL` is unset, reports `OFFLINE` status: `"Wokwi runtime integration is not configured."`
- Circuit schematic and Arduino sketch artifacts are created in `iot/wokwi/rescue-server-room/`.

### Physical ESP32 Boundary (`PhysicalESP32Adapter`)
- Located at `apps/api/src/services/iot/PhysicalESP32Adapter.ts`.
- If `MQTT_BROKER_URL` is unset, returns `OFFLINE` status: `"Physical ESP32 hardware is not configured (MQTT_BROKER_URL not set)."`
- Architecture is pre-wired for zero-friction future physical rollout.
