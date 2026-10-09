'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useIoTStore } from '@/store/useIoTStore';
import { SimulationMode } from '@missionx/shared';
import {
  Cpu,
  Activity,
  Flame,
  Wind,
  Droplets,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Terminal,
  Power,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { CircuitDiagramViewer } from '@/components/iot/CircuitDiagramViewer';

export default function SimulatorPage() {
  const { user } = useAuthStore();
  const {
    initSocket,
    connectionStatus,
    sensors,
    actuators,
    simulationMode,
    history,
    sendCommand,
    setSimulationMode,
  } = useIoTStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize socket for the server room mission
  useEffect(() => {
    initSocket('rescue-the-server-room');
  }, [initSocket]);

  // Access control check: Allow in development or any authenticated user
  const isDev = process.env.NODE_ENV !== 'production';
  const isAuthenticated = Boolean(user);

  if (!isDev && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-red-500/30 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-bold font-mono uppercase text-white">
            Access Restricted
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The IoT Telemetry Workbench and hardware simulation controls are
            restricted to authorized administrators and test engineers.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleModeChange = async (mode: SimulationMode) => {
    setIsSubmitting(true);
    setStatusMessage(`Applying simulation mode: ${mode}...`);
    const res = await setSimulationMode('server-room-esp32', mode);
    setStatusMessage(res.message);
    setIsSubmitting(false);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleActuatorCommand = async (
    command: 'SET_FAN' | 'SET_WARNING_LED' | 'SET_BUZZER' | 'RESET_ALARM' | 'SET_WATER',
    value: boolean | number
  ) => {
    setIsSubmitting(true);
    setStatusMessage(`Transmitting ${command}...`);
    const res = await sendCommand({
      deviceId: 'server-room-esp32',
      command,
      value,
    });
    setStatusMessage(res.message);
    setIsSubmitting(false);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2">
                <Cpu className="w-6 h-6 text-cyan-400" />
                <h1 className="text-xl font-bold font-mono tracking-wider text-white uppercase">
                  IoT Hardware Telemetry Workbench
                </h1>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1 ml-11">
              Target Device: <span className="text-cyan-300 font-bold">server-room-esp32</span> • Mission:{' '}
              <span className="text-slate-300 font-bold">rescue-the-server-room</span>
            </p>
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
              <Radio
                className={`w-4 h-4 ${
                  connectionStatus === 'ONLINE'
                    ? 'text-emerald-400'
                    : connectionStatus === 'SIMULATED'
                    ? 'text-cyan-400 animate-pulse'
                    : 'text-red-400'
                }`}
              />
              <span className="text-slate-400">Status:</span>
              <span
                className={`font-bold ${
                  connectionStatus === 'ONLINE'
                    ? 'text-emerald-400'
                    : connectionStatus === 'SIMULATED'
                    ? 'text-cyan-300'
                    : 'text-red-400'
                }`}
              >
                {connectionStatus}
              </span>
            </div>

            <Link
              href="/missions/rescue-the-server-room/play"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-cyan-500/20"
            >
              Enter 3D Room
            </Link>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-200 font-mono text-xs flex items-center gap-2 shadow-lg">
            <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Temperature Sensor */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                TEMPERATURE (DHT22)
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  sensors.temperatureC > 28.0
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {sensors.temperatureC > 28.0 ? 'OVERHEATING' : 'SAFE'}
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              {sensors.temperatureC.toFixed(1)} <span className="text-base text-slate-400">°C</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  sensors.temperatureC > 28.0 ? 'bg-red-500' : 'bg-cyan-400'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, ((sensors.temperatureC - 15) / 30) * 100))}%`,
                }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-500">Envelope: 20.0°C – 28.0°C</p>
          </div>

          {/* Humidity Sensor */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-cyan-400" />
                RELATIVE HUMIDITY
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  sensors.humidityPct > 60.0
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {sensors.humidityPct > 60.0 ? 'ELEVATED' : 'NOMINAL'}
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              {sensors.humidityPct.toFixed(1)} <span className="text-base text-slate-400">%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-500"
                style={{ width: `${sensors.humidityPct}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-500">Envelope: 40.0% – 60.0%</p>
          </div>

          {/* Water Detection Sensor */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-400" />
                DRIP TRAY SENSOR
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  sensors.waterDetected
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {sensors.waterDetected ? 'LEAK DETECTED' : 'DRY NOMINAL'}
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {sensors.waterDetected ? 'HAZARD (3.3V)' : 'CLEAR (0.0V)'}
            </div>
            <p className="text-[10px] font-mono text-slate-500">
              Pin 34 ADC Logic Threshold: 2000
            </p>
          </div>

          {/* Actuators Summary */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Power className="w-4 h-4 text-purple-400" />
                ACTUATOR STATES
              </span>
              <span className="text-[10px] font-mono text-slate-500">BUS GPIO</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">CRAC Blower Fan:</span>
                <span className={actuators.fan ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {actuators.fan ? 'ONLINE (2400 RPM)' : 'OFFLINE (0 RPM)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Warning LED Beacon:</span>
                <span className={actuators.warningLed ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                  {actuators.warningLed ? 'ACTIVE STROBE' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Acoustic Buzzer:</span>
                <span className={actuators.buzzer ? 'text-red-400 font-bold' : 'text-slate-500'}>
                  {actuators.buzzer ? 'SOUNDING (85dB)' : 'MUTED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Wokwi ESP32 Circuit Diagram & Dynamic Wire Netlist */}
        <CircuitDiagramViewer
          onCommandTrigger={(cmd, val) => handleActuatorCommand(cmd as any, val)}
        />

        {/* Simulation Mode Selector & Direct Actuator Overrides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulation Modes */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Simulation Profiles
                </h2>
              </div>
              <span className="font-mono text-xs text-cyan-300">
                Current: <strong>{simulationMode}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(
                [
                  { mode: 'NORMAL', label: 'Normal (23°C)', color: 'border-emerald-500/40 text-emerald-300' },
                  { mode: 'OVERHEATING', label: 'Overheating (33°C)', color: 'border-red-500/40 text-red-300' },
                  { mode: 'COOLING', label: 'Cooling Mode', color: 'border-cyan-500/40 text-cyan-300' },
                  { mode: 'WATER_ALERT', label: 'Water Leak Alert', color: 'border-blue-500/40 text-blue-300' },
                  { mode: 'RECOVERY', label: 'Thermal Recovery', color: 'border-purple-500/40 text-purple-300' },
                ] as const
              ).map(({ mode, label, color }) => (
                <button
                  key={mode}
                  disabled={isSubmitting}
                  onClick={() => handleModeChange(mode)}
                  className={`p-3 rounded-xl border font-mono text-xs transition text-left ${
                    simulationMode === mode
                      ? 'bg-slate-800 border-cyan-400 text-white font-bold shadow-md shadow-cyan-950'
                      : `bg-slate-950/60 ${color} hover:bg-slate-800`
                  }`}
                >
                  <div className="text-[11px] font-semibold">{label}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Mode: {mode}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actuator Direct Hardware Commands */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Hardware Actuator Commands
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500">REST + Socket.IO</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <button
                disabled={isSubmitting}
                onClick={() => handleActuatorCommand('SET_FAN', true)}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 text-cyan-300 transition text-left flex items-center justify-between"
              >
                <span>Energize Fan</span>
                <span className="text-[10px] text-slate-500">[ON]</span>
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => handleActuatorCommand('SET_FAN', false)}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-red-500 text-red-300 transition text-left flex items-center justify-between"
              >
                <span>Halt Fan</span>
                <span className="text-[10px] text-slate-500">[OFF]</span>
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => handleActuatorCommand('SET_WATER', !sensors.waterDetected)}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500 text-blue-300 transition text-left flex items-center justify-between"
              >
                <span>Toggle Water Leak</span>
                <span className="text-[10px] text-slate-500">
                  [{sensors.waterDetected ? 'CLEAR' : 'LEAK'}]
                </span>
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => handleActuatorCommand('RESET_ALARM', true)}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500 text-amber-300 transition text-left flex items-center justify-between"
              >
                <span>Reset Alarms</span>
                <span className="text-[10px] text-slate-500">[CLEAR]</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Telemetry Time Series Table */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                Recent Telemetry Stream (Last 30 Samples)
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-400">
              Samples Ingested: <strong className="text-cyan-300">{history.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Temperature</th>
                  <th className="py-2.5 px-3">Humidity</th>
                  <th className="py-2.5 px-3">Water Leak</th>
                  <th className="py-2.5 px-3">Fan State</th>
                  <th className="py-2.5 px-3">Warning LED</th>
                  <th className="py-2.5 px-3">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.slice(-8).reverse().map((sample, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                    <td className="py-2 px-3 text-slate-500">
                      {new Date(sample.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 font-bold text-white">
                      {sample.sensors.temperatureC.toFixed(1)} °C
                    </td>
                    <td className="py-2 px-3 text-cyan-300">
                      {sample.sensors.humidityPct.toFixed(1)} %
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          sample.sensors.waterDetected
                            ? 'bg-red-950 text-red-400'
                            : 'bg-emerald-950 text-emerald-400'
                        }`}
                      >
                        {sample.sensors.waterDetected ? 'WET' : 'DRY'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          sample.actuators.fan
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-red-950 text-red-400'
                        }`}
                      >
                        {sample.actuators.fan ? 'ON' : 'OFF'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-amber-400">
                      {sample.actuators.warningLed ? 'ACTIVE' : 'OFF'}
                    </td>
                    <td className="py-2 px-3 text-purple-300 text-[10px]">
                      {sample.simulationMode || 'NORMAL'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
