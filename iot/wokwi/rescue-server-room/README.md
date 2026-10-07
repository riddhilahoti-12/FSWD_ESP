# MissionX Wokwi Circuit — Rescue the Server Room

This directory contains the Wokwi ESP32 simulation project artifact representing the IoT sensing and actuator node for the **"Rescue the Server Room"** mission.

---

## 1. Circuit Components & Pinout

| Component | Wokwi Part ID | ESP32 Pin | Function |
| :--- | :--- | :--- | :--- |
| **Microcontroller** | `board-esp32-devkit-c-v4` | — | Embedded Processing Node |
| **Temperature & Humidity** | `wokwi-dht22` | GPIO 4 (`SDA`) | Ambient Server Room Telemetry |
| **Warning LED** | `wokwi-led` (Red) | GPIO 2 | Thermal Disparity Strobe |
| **Piezo Buzzer** | `wokwi-buzzer` | GPIO 15 | Acoustic Alarm |
| **Water Level Sensor** | `wokwi-slide-switch` | GPIO 34 (`ADC`) | Condensate Drip Tray Leak Detection |
| **Cooling Fan Motor** | `wokwi-led` (Blue) | GPIO 16 | Primary CRAC Blower Actuator |

---

## 2. Firmware Behavior (`sketch.ino`)

1. **Telemetry Streaming**: Every 2000ms, the ESP32 samples the DHT22 and water sensor pins, packages readings into normalized JSON, and prints to Serial:
```json
{
  "deviceId": "server-room-esp32",
  "missionId": "rescue-the-server-room",
  "sensors": {
    "temperatureC": 31.8,
    "humidityPct": 68.0,
    "waterDetected": false,
    "voltage": 0.0
  },
  "actuators": {
    "fan": true,
    "warningLed": true,
    "buzzer": false
  }
}
```

2. **Serial Command Execution**: The firmware listens for line-delimited JSON commands over the virtual UART interface:
```json
{ "command": "SET_FAN", "value": true }
{ "command": "SET_WARNING_LED", "value": false }
{ "command": "RESET_ALARM", "value": true }
```

---

## 3. How to Run in Wokwi

1. Open [Wokwi ESP32 Simulator](https://wokwi.com/).
2. Load `diagram.json` and `sketch.ino`.
3. Add the `DHT sensor library` and `ArduinoJson` library in `libraries.txt`.
4. Click **Play / Start Simulation**.
5. Adjust the DHT22 slider to observe real-time serial JSON changes.

---

## 4. Integration Boundary Specification

In Phase 4, MissionX communicates by default using the server-side **`MockIoTAdapter`** for deterministic, zero-dependency local development. 

To bridge this live Wokwi project directly to MissionX:
1. Start a local Wokwi IoT Gateway or custom WebSocket serial bridge:
   ```bash
   wokwi-bridge --project ./iot/wokwi/rescue-server-room
   ```
2. Configure environment variable in `.env`:
   ```env
   WOKWI_BRIDGE_URL=ws://localhost:9012
   ```
3. The `WokwiAdapter` in `apps/api/src/services/iot/WokwiAdapter.ts` defines this exact WebSocket proxy client boundary and seamlessly ingests telemetry packets when configured.
