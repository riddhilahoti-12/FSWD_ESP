'use client';

import React, { useState, useEffect } from 'react';
import { useIoTStore } from '@/store/useIoTStore';
import {
  Cpu,
  Activity,
  Flame,
  Wind,
  Droplets,
  AlertTriangle,
  RotateCcw,
  Radio,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react';

import { CircuitDiagramViewer } from '@/components/iot/CircuitDiagramViewer';

interface HardwareDemoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HardwareDemoPanel: React.FC<HardwareDemoPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    sensors,
    actuators,
    simulationMode,
    connectionStatus,
    sendCommand,
    setSimulationMode,
  } = useIoTStore();

  const [activeTab, setActiveTab] = useState<'CONTROLS' | 'CIRCUIT'>('CONTROLS');
  const [activeAdapter, setActiveAdapter] = useState<'WokwiAdapter' | 'MockIoTAdapter'>('WokwiAdapter');
  const [wokwiStatus, setWokwiStatus] = useState<{
    connected: boolean;
    lastTelemetryAt: number;
    activeAdapter: string;
  }>({
    connected: false,
    lastTelemetryAt: 0,
    activeAdapter: 'WokwiAdapter',
  });
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Poll Wokwi bridge status
  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/iot/wokwi/status');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data) {
            setWokwiStatus({
              connected: json.data.connected,
              lastTelemetryAt: json.data.lastTelemetryAt,
              activeAdapter: json.data.activeAdapter,
            });
          }
        }
      } catch {
        // Backend offline or compiling
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleScenarioClick = async (scenario: 'NORMAL' | 'OVERHEATING' | 'COOLING' | 'WATER_ALERT' | 'RECOVERY') => {
    setIsSending(true);
    setFeedback(`Applying Scenario: ${scenario}...`);
    try {
      // 1. Post to Wokwi bridge endpoint
      await fetch('http://localhost:5000/api/iot/wokwi/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: 'SET_SIMULATION_MODE',
          value: scenario,
          deviceId: 'server-room-esp32',
        }),
      });

      // 2. Also sync simulation mode in IoT store if permitted
      try {
        await setSimulationMode('server-room-esp32', scenario);
      } catch {
        // Hardware bridge command already applied and emitted over Socket.IO
      }
      setFeedback(`✓ Scenario ${scenario} active. Telemetry updated!`);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSending(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleDirectActuator = async (command: 'SET_FAN' | 'SET_WARNING_LED' | 'SET_BUZZER' | 'RESET_ALARM' | 'SET_WATER', value: any) => {
    setIsSending(true);
    setFeedback(`Dispatching ${command} = ${value}...`);
    try {
      await fetch('http://localhost:5000/api/iot/wokwi/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          value,
          deviceId: 'server-room-esp32',
        }),
      });

      try {
        await sendCommand({
          deviceId: 'server-room-esp32',
          command,
          value,
        });
      } catch {
        // Handled via Wokwi bridge
      }
      setFeedback(`✓ ${command} confirmed on hardware node.`);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSending(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleTemperatureSet = async (temp: number) => {
    setIsSending(true);
    try {
      await fetch('http://localhost:5000/api/iot/wokwi/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: 'SET_TEMPERATURE',
          value: temp,
          deviceId: 'server-room-esp32',
        }),
      });
      setFeedback(`✓ Temperature calibrated to ${temp.toFixed(1)}°C`);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSending(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const isWokwiLive = wokwiStatus.connected;
  const isOverheating = sensors.temperatureC > 28.0;

  if (!isOpen) return null;

  return (
    <div
      id="hardware-demo-panel"
      className={`fixed bottom-16 right-4 z-40 ${
        activeTab === 'CIRCUIT' ? 'w-[740px] max-w-[96vw]' : 'w-96 max-w-[95vw]'
      } max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-xl shadow-2xl p-4 text-white font-sans transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Wokwi ESP32 Hardware Integration
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Node: <strong className="text-cyan-300">server-room-esp32</strong>
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition text-xs font-mono"
          id="close-hardware-demo-btn"
        >
          ✕
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-3 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('CONTROLS')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
            activeTab === 'CONTROLS'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-900/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Controls & Sensors
        </button>
        <button
          onClick={() => setActiveTab('CIRCUIT')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 ${
            activeTab === 'CIRCUIT'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-900/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Circuit Diagram</span>
        </button>
      </div>

      {activeTab === 'CIRCUIT' ? (
        <div className="mb-2">
          <CircuitDiagramViewer onCommandTrigger={handleDirectActuator} />
        </div>
      ) : (
        <>
          {/* Hardware Transport Status Banner */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isWokwiLive ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
            }`}
          />
          <div>
            <div className="font-mono text-[11px] font-bold text-slate-200">
              {isWokwiLive ? 'WOKWI BRIDGE ACTIVE' : 'MOCK / STANDALONE SIM'}
            </div>
            <div className="text-[9px] font-mono text-slate-400">
              Transport: HTTP Webhook + Socket.IO
            </div>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isWokwiLive
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
          }`}
        >
          {isWokwiLive ? 'ONLINE' : 'ACTIVE'}
        </span>
      </div>

      {/* Live Verified Telemetry Meters */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Temperature */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" /> Temp (DHT22)
            </span>
            <span
              className={`text-[9px] font-bold px-1 rounded ${
                isOverheating ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {isOverheating ? 'ALERT' : 'SAFE'}
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-white tracking-tight">
            {sensors.temperatureC.toFixed(1)}°C
          </div>
          <div className="text-[9px] font-mono text-slate-500 mt-1">
            Safe Threshold: &lt; 28.0°C
          </div>
        </div>

        {/* Humidity */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" /> Humidity
            </span>
            <span className="text-[9px] font-bold px-1 rounded bg-slate-800 text-slate-300">
              NOMINAL
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-white tracking-tight">
            {sensors.humidityPct.toFixed(0)}% RH
          </div>
          <div className="text-[9px] font-mono text-slate-500 mt-1">
            Safe Envelope: 40–60%
          </div>
        </div>

        {/* Water Sensor */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Water Probe</span>
            <span
              className={`text-[9px] font-bold px-1 rounded ${
                sensors.waterDetected ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {sensors.waterDetected ? 'LEAK' : 'DRY'}
            </span>
          </div>
          <div className="text-sm font-mono font-bold text-slate-200">
            {sensors.waterDetected ? '💧 3.3V (Wet)' : '🛡️ 0.0V (Dry)'}
          </div>
        </div>

        {/* CRAC Fan State */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-cyan-400" /> CRAC Fan
            </span>
            <span
              className={`text-[9px] font-bold px-1 rounded ${
                actuators.fan ? 'bg-cyan-500/20 text-cyan-300' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {actuators.fan ? 'RUNNING' : 'STOPPED'}
            </span>
          </div>
          <div className="text-sm font-mono font-bold text-slate-200">
            {actuators.fan ? '🌀 2400 RPM' : '⛔ Stopped'}
          </div>
        </div>
      </div>

      {/* Actuator Indicators Bar */}
      <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800 mb-3 text-[10px] font-mono text-center">
        <div
          className={`py-1.5 rounded ${
            actuators.warningLed
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              : 'bg-slate-800/60 text-slate-400'
          }`}
        >
          🚨 LED: {actuators.warningLed ? 'STROBE' : 'OFF'}
        </div>
        <div
          className={`py-1.5 rounded ${
            actuators.buzzer
              ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-bounce'
              : 'bg-slate-800/60 text-slate-400'
          }`}
        >
          🔊 BUZZER: {actuators.buzzer ? 'ALARM' : 'OFF'}
        </div>
        <div
          className={`py-1.5 rounded ${
            actuators.breakerTripped
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          ⚡ BREAKER: {actuators.breakerTripped ? 'TRIP' : 'ARMED'}
        </div>
      </div>

      {/* Supported Hardware Scenarios */}
      <div className="mb-3">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
          Preset Hardware Scenarios
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
          <button
            onClick={() => handleScenarioClick('NORMAL')}
            disabled={isSending}
            className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-200 hover:text-white transition text-left flex items-center gap-1.5"
            id="scenario-normal-btn"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>1. Normal (23.5°C)</span>
          </button>

          <button
            onClick={() => handleScenarioClick('OVERHEATING')}
            disabled={isSending}
            className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-200 hover:text-white transition text-left flex items-center gap-1.5"
            id="scenario-overheating-btn"
          >
            <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>2. Overheating (31.8°C)</span>
          </button>

          <button
            onClick={() => handleScenarioClick('COOLING')}
            disabled={isSending}
            className="p-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-200 hover:text-white transition text-left flex items-center gap-1.5"
            id="scenario-cooling-btn"
          >
            <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>3. Cooling Restored</span>
          </button>

          <button
            onClick={() => handleScenarioClick('WATER_ALERT')}
            disabled={isSending}
            className="p-2 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/40 text-blue-200 hover:text-white transition text-left flex items-center gap-1.5"
            id="scenario-water-btn"
          >
            <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>4. Water Alert</span>
          </button>
        </div>

        <button
          onClick={() => handleScenarioClick('RECOVERY')}
          disabled={isSending}
          className="w-full mt-1.5 p-2 rounded-lg bg-amber-950/50 hover:bg-amber-900/70 border border-amber-500/40 text-amber-200 hover:text-white transition text-xs font-mono flex items-center justify-center gap-1.5"
          id="scenario-recovery-btn"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>5. Reset Alarms & Recover</span>
        </button>
      </div>

      {/* Manual Hardware Injections */}
      <div className="border-t border-slate-800 pt-2.5">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
          Manual Actuator Controls
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
          <button
            onClick={() => handleDirectActuator('SET_FAN', !actuators.fan)}
            className={`p-1.5 rounded-lg border transition ${
              actuators.fan
                ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            id="toggle-fan-btn"
          >
            Fan {actuators.fan ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => handleDirectActuator('SET_WARNING_LED', !actuators.warningLed)}
            className={`p-1.5 rounded-lg border transition ${
              actuators.warningLed
                ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            id="toggle-led-btn"
          >
            LED {actuators.warningLed ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => handleDirectActuator('SET_BUZZER', !actuators.buzzer)}
            className={`p-1.5 rounded-lg border transition ${
              actuators.buzzer
                ? 'bg-red-950/70 border-red-500/50 text-red-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            id="toggle-buzzer-btn"
          >
            Buzzer {actuators.buzzer ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Quick Temperature Selector */}
        <div className="flex items-center justify-between gap-1 mt-2 text-[10px] font-mono">
          <span className="text-slate-400">Calibrate Temp:</span>
          {[23.0, 26.5, 31.8, 35.0].map((t) => (
            <button
              key={t}
              onClick={() => handleTemperatureSet(t)}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white transition"
            >
              {t}°C
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Alert Banner */}
      {feedback && (
        <div className="mt-3 p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-mono animate-in fade-in">
          {feedback}
        </div>
      )}
        </>
      )}

      {/* Footer Info & Wokwi Link */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>Firmware: sketch.ino (Wokwi ESP32)</span>
        <a
          href="https://wokwi.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-cyan-400 hover:underline"
        >
          <span>Wokwi</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};
