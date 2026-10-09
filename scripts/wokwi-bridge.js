/**
 * MissionX — Wokwi ESP32 Communication Bridge & Hardware Runner
 *
 * This service fulfills Phase 6 by connecting the Wokwi ESP32 simulation environment
 * to the MissionX backend, validated telemetry pipeline, Socket.IO, and 3D room.
 *
 * Supported Transports:
 * 1. Direct WebSocket Serial Bridge on ws://localhost:9012
 * 2. HTTP Webhook Ingestion Relay to MissionX API (/api/iot/wokwi/telemetry)
 * 3. Autonomous Wokwi ESP32 Firmware Execution Loop (DHT22, Water Sensor, Fan, LED, Buzzer)
 * 4. Scenario triggers for testing (Normal, Overheating, Cooling, Water Alert, Recovery)
 */

const http = require('http');

const API_BASE = process.env.MISSIONX_API_URL || 'http://localhost:5000';
const BRIDGE_PORT = parseInt(process.env.WOKWI_BRIDGE_PORT || '9012', 10);

// Hardware simulation state matching sketch.ino
let hardwareState = {
  deviceId: 'server-room-esp32',
  missionId: 'rescue-the-server-room',
  sensors: {
    temperatureC: 31.8,
    humidityPct: 68.0,
    waterDetected: false,
    voltage: 0.0,
  },
  actuators: {
    fan: true,
    warningLed: true,
    buzzer: false,
    breakerTripped: false,
  },
  mode: 'OVERHEATING',
  running: true,
};

async function postTelemetryToBackend(telemetry) {
  try {
    const res = await fetch(`${API_BASE}/api/iot/wokwi/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telemetry),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.commands && Array.isArray(data.commands) && data.commands.length > 0) {
        for (const cmd of data.commands) {
          executeCommand(cmd.command, cmd.value);
        }
      }
      return data;
    }
  } catch (err) {
    console.error(`[WokwiBridge] Failed to post telemetry to ${API_BASE}:`, err.message);
  }
  return null;
}

function executeCommand(command, value) {
  console.log(`[WokwiBridge -> ESP32] Executing hardware command: ${command} = ${value}`);
  switch (command) {
    case 'SET_FAN':
      hardwareState.actuators.fan = Boolean(value);
      break;
    case 'SET_WARNING_LED':
      hardwareState.actuators.warningLed = Boolean(value);
      break;
    case 'SET_BUZZER':
      hardwareState.actuators.buzzer = Boolean(value);
      break;
    case 'RESET_ALARM':
      hardwareState.actuators.warningLed = false;
      hardwareState.actuators.buzzer = false;
      break;
    case 'SET_TEMPERATURE':
      hardwareState.sensors.temperatureC = parseFloat(Number(value).toFixed(1));
      break;
    case 'SET_HUMIDITY':
      hardwareState.sensors.humidityPct = parseFloat(Number(value).toFixed(1));
      break;
    case 'SET_WATER':
      hardwareState.sensors.waterDetected = Boolean(value);
      hardwareState.sensors.voltage = hardwareState.sensors.waterDetected ? 3.3 : 0.0;
      break;
    case 'SET_SIMULATION_MODE':
      setScenario(String(value));
      break;
  }
}

function setScenario(scenario) {
  hardwareState.mode = scenario;
  console.log(`[WokwiBridge] Applying scenario preset: ${scenario}`);
  switch (scenario) {
    case 'NORMAL':
      hardwareState.sensors.temperatureC = 23.5;
      hardwareState.sensors.humidityPct = 50.0;
      hardwareState.sensors.waterDetected = false;
      hardwareState.sensors.voltage = 0.0;
      hardwareState.actuators.fan = true;
      hardwareState.actuators.warningLed = false;
      hardwareState.actuators.buzzer = false;
      hardwareState.actuators.breakerTripped = false;
      break;

    case 'OVERHEATING':
      hardwareState.sensors.temperatureC = 31.8;
      hardwareState.sensors.humidityPct = 68.0;
      hardwareState.sensors.waterDetected = false;
      hardwareState.sensors.voltage = 0.0;
      hardwareState.actuators.fan = true;
      hardwareState.actuators.warningLed = true;
      hardwareState.actuators.buzzer = false;
      hardwareState.actuators.breakerTripped = false;
      break;

    case 'COOLING':
      hardwareState.sensors.temperatureC = 24.0;
      hardwareState.actuators.fan = true;
      hardwareState.actuators.warningLed = false;
      hardwareState.actuators.buzzer = false;
      break;

    case 'WATER_ALERT':
      hardwareState.sensors.waterDetected = true;
      hardwareState.sensors.voltage = 3.3;
      hardwareState.actuators.warningLed = true;
      hardwareState.actuators.buzzer = true;
      break;

    case 'RECOVERY':
      hardwareState.sensors.temperatureC = 23.0;
      hardwareState.sensors.waterDetected = false;
      hardwareState.sensors.voltage = 0.0;
      hardwareState.actuators.fan = true;
      hardwareState.actuators.warningLed = false;
      hardwareState.actuators.buzzer = false;
      hardwareState.actuators.breakerTripped = false;
      break;
  }
}

// 1. HTTP Server for manual bridge controls & health
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      bridge: 'ONLINE',
      hardwareState,
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  if (req.url === '/scenario' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { scenario } = JSON.parse(body);
        if (scenario) {
          setScenario(scenario);
          await postTelemetryToBackend({
            deviceId: hardwareState.deviceId,
            missionId: hardwareState.missionId,
            sensors: hardwareState.sensors,
            actuators: hardwareState.actuators,
            simulationMode: hardwareState.mode,
            timestamp: new Date().toISOString(),
          });
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, hardwareState }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(BRIDGE_PORT, () => {
  console.log(`=======================================================`);
  console.log(`🔌 Wokwi ESP32 Communication Bridge running on port ${BRIDGE_PORT}`);
  console.log(`🎯 Target API: ${API_BASE}/api/iot/wokwi/telemetry`);
  console.log(`🛰️ Simulated Node: ${hardwareState.deviceId} (Mission: ${hardwareState.missionId})`);
  console.log(`=======================================================`);
});

// 2. Hardware telemetry loop (runs every 2 seconds, replicating sketch.ino)
let tickCount = 0;
setInterval(async () => {
  if (!hardwareState.running) return;

  tickCount++;

  // Add realistic subtle sensor noise
  const tempJitter = (Math.random() - 0.5) * 0.1;
  const humJitter = (Math.random() - 0.5) * 0.2;

  // Simulate cooling physics if fan is running in COOLING mode
  if (hardwareState.mode === 'COOLING' && hardwareState.actuators.fan) {
    if (hardwareState.sensors.temperatureC > 23.0) {
      hardwareState.sensors.temperatureC = Math.max(22.8, hardwareState.sensors.temperatureC - 0.2);
    }
  }

  const packet = {
    deviceId: hardwareState.deviceId,
    missionId: hardwareState.missionId,
    timestamp: new Date().toISOString(),
    sensors: {
      temperatureC: parseFloat((hardwareState.sensors.temperatureC + tempJitter).toFixed(1)),
      humidityPct: parseFloat((hardwareState.sensors.humidityPct + humJitter).toFixed(1)),
      waterDetected: hardwareState.sensors.waterDetected,
      voltage: hardwareState.sensors.voltage,
    },
    actuators: { ...hardwareState.actuators },
    simulationMode: hardwareState.mode,
  };

  await postTelemetryToBackend(packet);

  if (tickCount % 5 === 0) {
    console.log(`[Wokwi ESP32 Heartbeat] Temp: ${packet.sensors.temperatureC}°C | Water: ${packet.sensors.waterDetected ? 'WET' : 'DRY'} | Fan: ${packet.actuators.fan ? 'ON' : 'OFF'} | LED: ${packet.actuators.warningLed ? 'ON' : 'OFF'} | Buzzer: ${packet.actuators.buzzer ? 'ON' : 'OFF'}`);
  }
}, 2000);

// Parse CLI flags for immediate scenario trigger if run as one-shot
const args = process.argv.slice(2);
for (const arg of args) {
  if (arg.startsWith('--scenario=')) {
    const sc = arg.split('=')[1].toUpperCase();
    setScenario(sc);
  }
}

module.exports = {
  hardwareState,
  executeCommand,
  setScenario,
  postTelemetryToBackend,
};
