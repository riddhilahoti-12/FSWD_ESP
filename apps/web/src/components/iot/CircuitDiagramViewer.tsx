'use client';

import React, { useState } from 'react';
import { useIoTStore } from '@/store/useIoTStore';
import {
  Cpu,
  Flame,
  Wind,
  Droplets,
  Volume2,
  VolumeX,
  AlertTriangle,
  Zap,
  Info,
  ExternalLink,
  CheckCircle2,
  Power,
} from 'lucide-react';

interface CircuitDiagramViewerProps {
  onCommandTrigger?: (command: 'SET_FAN' | 'SET_WARNING_LED' | 'SET_BUZZER' | 'SET_WATER', value: any) => void;
  compact?: boolean;
}

export const CircuitDiagramViewer: React.FC<CircuitDiagramViewerProps> = ({
  onCommandTrigger,
  compact = false,
}) => {
  const { sensors, actuators } = useIoTStore();
  const [hoveredNet, setHoveredNet] = useState<string | null>(null);
  const [showNetlist, setShowNetlist] = useState<boolean>(!compact);

  // Fallback direct dispatch if onCommandTrigger is not provided
  const triggerCommand = (cmd: 'SET_FAN' | 'SET_WARNING_LED' | 'SET_BUZZER' | 'SET_WATER', val: any) => {
    if (onCommandTrigger) {
      onCommandTrigger(cmd, val);
    } else {
      fetch('http://localhost:5000/api/iot/wokwi/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          value: val,
          deviceId: 'server-room-esp32',
        }),
      }).catch(console.error);
    }
  };

  const isOverheating = sensors.temperatureC > 28.0;

  return (
    <div className="w-full bg-slate-950 text-slate-100 font-sans rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col">
      {/* Header bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Wokwi ESP32 Circuit Schematic</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                LIVE BUS
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Board: <strong className="text-cyan-300">ESP32 DevKit v4</strong> • Config: <span className="text-slate-300">diagram.json</span> • Sketch: <span className="text-slate-300">sketch.ino</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNetlist(!showNetlist)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition flex items-center gap-1 border border-slate-700"
          >
            <Info className="w-3 h-3 text-cyan-400" />
            <span>{showNetlist ? 'Hide Netlist' : 'Show Netlist'}</span>
          </button>
          <a
            href="https://wokwi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono transition flex items-center gap-1"
            title="Open in Wokwi Simulation Platform"
          >
            <span>Wokwi Web</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Main SVG Schematic Canvas */}
      <div className="relative w-full bg-gradient-to-b from-slate-950 via-[#070b14] to-slate-950 p-2 sm:p-4 overflow-x-auto flex justify-center">
        <svg
          viewBox="0 0 860 520"
          className="w-full max-w-[860px] h-auto select-none"
          style={{ minWidth: '680px' }}
        >
          <defs>
            {/* Animated dashed wires CSS filter & keyframes */}
            <linearGradient id="busGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="glowRed" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="glowOrange" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="glowBlue" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <style>{`
              @keyframes pulseFlow {
                0% { stroke-dashoffset: 24; }
                100% { stroke-dashoffset: 0; }
              }
              @keyframes spinFan {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .wire-active {
                animation: pulseFlow 0.8s linear infinite;
              }
              .wire-fast {
                animation: pulseFlow 0.4s linear infinite;
              }
              .wire-slow {
                animation: pulseFlow 1.6s linear infinite;
              }
              .fan-blade {
                transform-origin: 140px 420px;
                animation: spinFan 1.2s linear infinite;
              }
            `}</style>
          </defs>

          {/* Grid background lines for engineering blueprint aesthetic */}
          <g stroke="#1e293b" strokeWidth="0.5" opacity="0.4">
            {Array.from({ length: 44 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="520" />
            ))}
            {Array.from({ length: 27 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 20} x2="860" y2={i * 20} />
            ))}
          </g>

          {/* ============================================================== */}
          {/* 1. CENTRAL CONTROLLER: ESP32 DEVKIT C V4                      */}
          {/* ============================================================== */}
          <g transform="translate(330, 110)">
            {/* Outer PCB Body */}
            <rect
              x="0"
              y="0"
              width="200"
              height="280"
              rx="12"
              fill="#0f172a"
              stroke="#06b6d4"
              strokeWidth="2"
              className="drop-shadow-lg"
            />
            {/* ESP32 RF Shield (Silver can) */}
            <rect
              x="30"
              y="40"
              width="140"
              height="110"
              rx="6"
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <text x="100" y="75" textAnchor="middle" fill="#f8fafc" fontSize="12" fontFamily="monospace" fontWeight="bold">
              ESP-WROOM-32
            </text>
            <text x="100" y="95" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              WiFi + BLE Dual Core
            </text>
            <text x="100" y="112" textAnchor="middle" fill="#06b6d4" fontSize="8" fontFamily="monospace">
              240MHz • Xtensa LX6
            </text>

            {/* Micro USB Port */}
            <rect x="70" y="260" width="60" height="20" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            <text x="100" y="274" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
              USB (115200)
            </text>

            {/* On-board Power LED */}
            <circle cx="45" cy="245" r="4" fill="#ef4444" filter="url(#glowRed)" />
            <text x="45" y="235" textAnchor="middle" fill="#ef4444" fontSize="7" fontFamily="monospace">PWR</text>

            {/* Title Badge */}
            <rect x="25" y="10" width="150" height="20" rx="4" fill="#0284c7" />
            <text x="100" y="24" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
              ESP32 DevKit v4
            </text>

            {/* ================= LEFT PIN RAIL ================= */}
            {/* 3V3 Pin (Y = 160) */}
            <g
              transform="translate(-10, 50)"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNet('3V3 (VCC +3.3V Bus)')}
              onMouseLeave={() => setHoveredNet(null)}
            >
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#ef4444" />
              <text x="25" y="11" fill="#fca5a5" fontSize="10" fontFamily="monospace" fontWeight="bold">3V3</text>
            </g>

            {/* GND.1 Pin (Y = 80) */}
            <g
              transform="translate(-10, 80)"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNet('GND.1 (Ground Rail 1)')}
              onMouseLeave={() => setHoveredNet(null)}
            >
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
              <text x="25" y="11" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">GND.1</text>
            </g>

            {/* GPIO 2 (Y = 120) */}
            <g
              transform="translate(-10, 120)"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNet('GPIO 2 (Warning LED Signal)')}
              onMouseLeave={() => setHoveredNet(null)}
            >
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#f97316" />
              <text x="25" y="11" fill="#fed7aa" fontSize="10" fontFamily="monospace" fontWeight="bold">IO2</text>
            </g>

            {/* GPIO 15 (Y = 160) */}
            <g
              transform="translate(-10, 160)"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNet('GPIO 15 (Piezo Buzzer PWM)')}
              onMouseLeave={() => setHoveredNet(null)}
            >
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#a855f7" />
              <text x="25" y="11" fill="#e9d5ff" fontSize="10" fontFamily="monospace" fontWeight="bold">IO15</text>
            </g>

            {/* GPIO 16 (Y = 200) */}
            <g
              transform="translate(-10, 200)"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNet('GPIO 16 (CRAC Fan Relay Signal)')}
              onMouseLeave={() => setHoveredNet(null)}
            >
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#06b6d4" />
              <text x="25" y="11" fill="#a5f3fc" fontSize="10" fontFamily="monospace" fontWeight="bold">IO16</text>
            </g>

            {/* ================= RIGHT PIN RAIL ================= */}
            {/* GPIO 4 (Y = 50) */}
            <g
              transform="translate(190, 50)"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNet('GPIO 4 (DHT22 SDA Data Bus)')}
              onMouseLeave={() => setHoveredNet(null)}
            >
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#22c55e" />
              <text x="-8" y="11" textAnchor="end" fill="#bbf7d0" fontSize="10" fontFamily="monospace" fontWeight="bold">IO4</text>
            </g>

            {/* GPIO 34 (Y = 120) */}
            <g
              transform="translate(190, 120)"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNet('GPIO 34 (Water Sensor ADC Input)')}
              onMouseLeave={() => setHoveredNet(null)}
            >
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#3b82f6" />
              <text x="-8" y="11" textAnchor="end" fill="#bfdbfe" fontSize="10" fontFamily="monospace" fontWeight="bold">IO34</text>
            </g>

            {/* GND.2 (Y = 200) */}
            <g
              transform="translate(190, 200)"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNet('GND.2 (Ground Rail 2)')}
              onMouseLeave={() => setHoveredNet(null)}
            >
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
              <text x="-8" y="11" textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">GND.2</text>
            </g>
          </g>

          {/* ============================================================== */}
          {/* 2. COMPONENT: DHT22 SENSOR (TOP-RIGHT: 680, 50)               */}
          {/* ============================================================== */}
          <g
            transform="translate(640, 40)"
            className="cursor-pointer transition-transform hover:scale-105"
            onMouseEnter={() => setHoveredNet('DHT22 Sensor: Single-wire digital temperature & humidity probe')}
            onMouseLeave={() => setHoveredNet(null)}
          >
            {/* DHT22 White Grille Casing */}
            <rect x="0" y="0" width="170" height="120" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
            <rect x="10" y="10" width="150" height="40" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            {/* Ventilation slits */}
            {[-30, -10, 10, 30].map((dx, idx) => (
              <line key={idx} x1={85 + dx} y1="18" x2={85 + dx} y2="42" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
            ))}

            <text x="85" y="66" textAnchor="middle" fill="#0f172a" fontSize="11" fontFamily="monospace" fontWeight="bold">
              DHT22 / AM2302
            </text>
            <text x="85" y="82" textAnchor="middle" fill="#0369a1" fontSize="10" fontFamily="monospace" fontWeight="bold">
              {sensors.temperatureC.toFixed(1)}°C • {sensors.humidityPct.toFixed(0)}% RH
            </text>
            <text x="85" y="98" textAnchor="middle" fill={isOverheating ? '#dc2626' : '#16a34a'} fontSize="9" fontFamily="monospace" fontWeight="bold">
              [{isOverheating ? 'OVERHEATING ALERT' : 'NOMINAL ENVELOPE'}]
            </text>

            {/* Pins on Bottom: 1:VCC, 2:SDA, 3:NC, 4:GND */}
            <circle cx="30" cy="120" r="4" fill="#ef4444" />
            <text x="30" y="112" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="monospace">VCC</text>

            <circle cx="70" cy="120" r="4" fill="#22c55e" />
            <text x="70" y="112" textAnchor="middle" fill="#22c55e" fontSize="8" fontFamily="monospace">SDA</text>

            <circle cx="110" cy="120" r="4" fill="#94a3b8" />
            <text x="110" y="112" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">NC</text>

            <circle cx="150" cy="120" r="4" fill="#1e293b" />
            <text x="150" y="112" textAnchor="middle" fill="#1e293b" fontSize="8" fontFamily="monospace">GND</text>
          </g>

          {/* ============================================================== */}
          {/* 3. COMPONENT: 220Ω RESISTOR (R1)                              */}
          {/* ============================================================== */}
          <g
            transform="translate(190, 220)"
            className="cursor-pointer"
            onMouseEnter={() => setHoveredNet('R1 Resistor: 220Ω Current Limiting (Pin 2 -> LED Anode)')}
            onMouseLeave={() => setHoveredNet(null)}
          >
            <rect x="0" y="0" width="60" height="20" rx="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
            {/* Color bands for 220 ohm: Red Red Brown Gold */}
            <rect x="12" y="0" width="4" height="20" fill="#dc2626" />
            <rect x="22" y="0" width="4" height="20" fill="#dc2626" />
            <rect x="32" y="0" width="4" height="20" fill="#78350f" />
            <rect x="46" y="0" width="3" height="20" fill="#eab308" />
            <text x="30" y="-6" textAnchor="middle" fill="#ca8a04" fontSize="9" fontFamily="monospace" fontWeight="bold">
              R1 (220Ω)
            </text>
          </g>

          {/* ============================================================== */}
          {/* 4. COMPONENT: WARNING RED LED                                 */}
          {/* ============================================================== */}
          <g
            transform="translate(80, 210)"
            className="cursor-pointer transition-transform hover:scale-110"
            onClick={() => triggerCommand('SET_WARNING_LED', !actuators.warningLed)}
            onMouseEnter={() => setHoveredNet('Warning LED: Pin 2 via R1 (Click to Toggle)')}
            onMouseLeave={() => setHoveredNet(null)}
          >
            {/* Outer Glow Halo if active */}
            {actuators.warningLed && (
              <circle cx="20" cy="20" r="28" fill="#ef4444" opacity="0.3" filter="url(#glowRed)" className="animate-pulse" />
            )}
            {/* LED Bulb */}
            <circle
              cx="20"
              cy="20"
              r="16"
              fill={actuators.warningLed ? '#ef4444' : '#7f1d1d'}
              stroke="#b91c1c"
              strokeWidth="2"
              filter={actuators.warningLed ? 'url(#glowRed)' : undefined}
            />
            {/* Inner reflection */}
            <path d="M 12 12 Q 18 10 24 16" stroke="#ffffff" strokeWidth="2" fill="none" opacity={actuators.warningLed ? 0.9 : 0.2} />
            <text x="20" y="52" textAnchor="middle" fill={actuators.warningLed ? '#fca5a5' : '#94a3b8'} fontSize="9" fontFamily="monospace" fontWeight="bold">
              WARNING LED
            </text>
            <text x="20" y="64" textAnchor="middle" fill={actuators.warningLed ? '#ef4444' : '#64748b'} fontSize="8" fontFamily="monospace">
              [{actuators.warningLed ? 'STROBING' : 'OFF'}]
            </text>
          </g>

          {/* ============================================================== */}
          {/* 5. COMPONENT: ACOUSTIC PIEZO BUZZER                           */}
          {/* ============================================================== */}
          <g
            transform="translate(70, 310)"
            className="cursor-pointer transition-transform hover:scale-110"
            onClick={() => triggerCommand('SET_BUZZER', !actuators.buzzer)}
            onMouseEnter={() => setHoveredNet('Piezo Buzzer: Pin 15 (Click to Toggle)')}
            onMouseLeave={() => setHoveredNet(null)}
          >
            {/* Buzzer Sound waves if buzzing */}
            {actuators.buzzer && (
              <g stroke="#c084fc" fill="none" strokeWidth="2" className="animate-ping">
                <circle cx="30" cy="30" r="38" opacity="0.4" />
                <circle cx="30" cy="30" r="48" opacity="0.2" />
              </g>
            )}
            {/* Buzzer Body */}
            <circle
              cx="30"
              cy="30"
              r="26"
              fill="#1e1b4b"
              stroke="#a855f7"
              strokeWidth="2.5"
            />
            <circle cx="30" cy="30" r="10" fill="#0f172a" stroke="#7e22ce" strokeWidth="1.5" />
            <text x="30" y="70" textAnchor="middle" fill={actuators.buzzer ? '#e9d5ff' : '#94a3b8'} fontSize="9" fontFamily="monospace" fontWeight="bold">
              PIEZO BUZZER
            </text>
            <text x="30" y="82" textAnchor="middle" fill={actuators.buzzer ? '#c084fc' : '#64748b'} fontSize="8" fontFamily="monospace">
              [{actuators.buzzer ? '85dB ACTIVE' : 'MUTED'}]
            </text>
          </g>

          {/* ============================================================== */}
          {/* 6. COMPONENT: CRAC BLOWER FAN MOTOR (PIN 16)                  */}
          {/* ============================================================== */}
          <g
            transform="translate(60, 400)"
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => triggerCommand('SET_FAN', !actuators.fan)}
            onMouseEnter={() => setHoveredNet('CRAC Fan Indicator & Motor: Pin 16 (Click to Toggle)')}
            onMouseLeave={() => setHoveredNet(null)}
          >
            {/* Fan Outer Housing */}
            <circle cx="80" cy="30" r="32" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" filter={actuators.fan ? 'url(#glowCyan)' : undefined} />
            {/* Fan Blades (Rotates when fan is on) */}
            <g
              transform="translate(80, 30)"
              style={{
                transformOrigin: '0px 0px',
                animation: actuators.fan ? 'spinFan 0.6s linear infinite' : 'none',
              }}
            >
              <circle cx="0" cy="0" r="8" fill="#0891b2" />
              <path d="M 0 0 C 8 -18 20 -18 16 0 Z" fill="#22d3ee" opacity="0.8" />
              <path d="M 0 0 C 18 8 18 20 0 16 Z" fill="#22d3ee" opacity="0.8" />
              <path d="M 0 0 C -8 18 -20 18 -16 0 Z" fill="#22d3ee" opacity="0.8" />
              <path d="M 0 0 C -18 -8 -18 -20 0 -16 Z" fill="#22d3ee" opacity="0.8" />
            </g>

            <text x="80" y="74" textAnchor="middle" fill={actuators.fan ? '#a5f3fc' : '#94a3b8'} fontSize="9" fontFamily="monospace" fontWeight="bold">
              CRAC FAN MOTOR
            </text>
            <text x="80" y="86" textAnchor="middle" fill={actuators.fan ? '#22d3ee' : '#64748b'} fontSize="8" fontFamily="monospace">
              [{actuators.fan ? '2400 RPM ONLINE' : 'HALTED'}]
            </text>
          </g>

          {/* ============================================================== */}
          {/* 7. COMPONENT: WATER DETECTION SLIDE SWITCH (PIN 34)           */}
          {/* ============================================================== */}
          <g
            transform="translate(650, 240)"
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => triggerCommand('SET_WATER', !sensors.waterDetected)}
            onMouseEnter={() => setHoveredNet('Water Sensor (Slide Switch): Pin 34 ADC (Click to Toggle Leak)')}
            onMouseLeave={() => setHoveredNet(null)}
          >
            {/* Base switch plate */}
            <rect x="0" y="0" width="160" height="90" rx="8" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
            {/* Water icon / status */}
            <g transform="translate(18, 18)">
              <circle cx="16" cy="16" r="14" fill={sensors.waterDetected ? '#1e3a8a' : '#1e293b'} stroke="#60a5fa" strokeWidth="1" />
              <Droplets className="w-4 h-4 text-blue-400" x="8" y="8" />
            </g>

            <text x="56" y="28" fill="#f8fafc" fontSize="11" fontFamily="monospace" fontWeight="bold">
              WATER PROBE
            </text>
            <text x="56" y="44" fill={sensors.waterDetected ? '#93c5fd' : '#94a3b8'} fontSize="9" fontFamily="monospace">
              {sensors.waterDetected ? '💧 LEAK (3.3V ADC)' : '🛡️ DRY (0.0V ADC)'}
            </text>

            {/* Slide switch actuator representation */}
            <rect x="20" y="56" width="120" height="18" rx="9" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <circle
              cx={sensors.waterDetected ? 115 : 45}
              cy="65"
              r="10"
              fill={sensors.waterDetected ? '#3b82f6' : '#64748b'}
              filter={sensors.waterDetected ? 'url(#glowBlue)' : undefined}
              className="transition-all duration-300"
            />
            <text x="80" y="86" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">
              PIN 1 (3V3) • PIN 2 (IO34) • PIN 3 (GND)
            </text>
          </g>

          {/* ============================================================== */}
          {/* 8. LIVELY ANIMATED WIRES & INTERCONNECTIONS                   */}
          {/* ============================================================== */}

          {/* A. 3.3V VCC RAIL (Red Wires) */}
          {/* Wire 1: ESP:3V3 -> DHT:VCC */}
          <path
            d="M 320 160 L 290 160 L 290 20 L 670 20 L 670 160"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="wire-slow"
          />

          {/* Wire 2: ESP:3V3 -> WaterSensor:1 */}
          <path
            d="M 290 160 L 290 180 L 600 180 L 600 290 L 650 290"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="wire-slow"
          />

          {/* B. GROUND RAILS (Black / Dark Slate Wires) */}
          {/* Wire 3: ESP:GND.1 -> DHT:GND */}
          <path
            d="M 320 190 L 270 190 L 270 8 L 790 8 L 790 160"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Wire 4: ESP:GND.1 -> WaterSensor:3 */}
          <path
            d="M 270 190 L 270 200 L 620 200 L 620 310 L 650 310"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Wire 5: ESP:GND.2 -> Warning LED Cathode */}
          <path
            d="M 530 310 L 580 310 L 580 490 L 100 490 L 100 260"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Wire 6: ESP:GND.2 -> Buzzer Pin 1 */}
          <path
            d="M 580 470 L 120 470 L 120 370"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Wire 7: ESP:GND.2 -> Fan Indicator Cathode */}
          <path
            d="M 580 490 L 160 490 L 160 460"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
          />

          {/* C. SIGNAL LINES */}
          {/* Wire 8: ESP:4 -> DHT:SDA (Green Data Bus) */}
          <path
            d="M 530 160 L 560 160 L 560 60 L 710 60 L 710 160"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeDasharray="8 4"
            className="wire-fast"
            filter="drop-shadow(0 0 4px #22c55e)"
          />

          {/* Wire 9: ESP:2 -> R1:1 (Orange wire to Resistor) */}
          <path
            d="M 320 230 L 250 230"
            fill="none"
            stroke="#f97316"
            strokeWidth={actuators.warningLed ? 3 : 2}
            strokeDasharray={actuators.warningLed ? '6 3' : undefined}
            className={actuators.warningLed ? 'wire-fast' : undefined}
          />
          {/* Wire 10: R1:2 -> Warning LED Anode (Orange wire) */}
          <path
            d="M 190 230 L 120 230"
            fill="none"
            stroke="#f97316"
            strokeWidth={actuators.warningLed ? 3 : 2}
            strokeDasharray={actuators.warningLed ? '6 3' : undefined}
            className={actuators.warningLed ? 'wire-fast' : undefined}
            filter={actuators.warningLed ? 'url(#glowOrange)' : undefined}
          />

          {/* Wire 11: ESP:15 -> Buzzer:2 (Purple wire) */}
          <path
            d="M 320 270 L 150 270 L 150 330 L 120 330"
            fill="none"
            stroke="#a855f7"
            strokeWidth={actuators.buzzer ? 3 : 2}
            strokeDasharray={actuators.buzzer ? '6 4' : undefined}
            className={actuators.buzzer ? 'wire-fast' : undefined}
            filter={actuators.buzzer ? 'drop-shadow(0 0 5px #a855f7)' : undefined}
          />

          {/* Wire 12: ESP:16 -> Fan Indicator Anode (Cyan wire) */}
          <path
            d="M 320 310 L 220 310 L 220 430 L 140 430"
            fill="none"
            stroke="#06b6d4"
            strokeWidth={actuators.fan ? 3 : 2}
            strokeDasharray={actuators.fan ? '8 4' : undefined}
            className={actuators.fan ? 'wire-fast' : undefined}
            filter={actuators.fan ? 'url(#glowCyan)' : undefined}
          />

          {/* Wire 13: ESP:34 <- Water Sensor Pin 2 (Blue wire) */}
          <path
            d="M 530 230 L 570 230 L 570 280 L 650 280"
            fill="none"
            stroke="#3b82f6"
            strokeWidth={sensors.waterDetected ? 3 : 2}
            strokeDasharray={sensors.waterDetected ? '6 4' : undefined}
            className={sensors.waterDetected ? 'wire-fast' : undefined}
            filter={sensors.waterDetected ? 'url(#glowBlue)' : undefined}
          />

          {/* Hover tooltip HUD inside SVG */}
          {hoveredNet && (
            <g transform="translate(430, 495)">
              <rect x="-240" y="-18" width="480" height="26" rx="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
              <text x="0" y="0" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                {hoveredNet}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Interactive Controls & Live Bus Indicators */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Click components on schematic or trigger manual bus overrides:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerCommand('SET_FAN', !actuators.fan)}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                actuators.fan
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-900'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Fan Pin 16: {actuators.fan ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => triggerCommand('SET_WARNING_LED', !actuators.warningLed)}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                actuators.warningLed
                  ? 'bg-orange-950/80 border-orange-400 text-orange-200 shadow-sm shadow-orange-900'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>LED Pin 2: {actuators.warningLed ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => triggerCommand('SET_BUZZER', !actuators.buzzer)}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                actuators.buzzer
                  ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-sm shadow-purple-900'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {actuators.buzzer ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>Buzzer Pin 15: {actuators.buzzer ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => triggerCommand('SET_WATER', !sensors.waterDetected)}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                sensors.waterDetected
                  ? 'bg-blue-950/80 border-blue-400 text-blue-200 shadow-sm shadow-blue-900'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Water Pin 34: {sensors.waterDetected ? 'LEAK' : 'DRY'}</span>
            </button>
          </div>
        </div>

        {/* Complete Circuit Netlist Table */}
        {showNetlist && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 overflow-x-auto animate-in fade-in">
            <div className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Wokwi diagram.json Pin Netlist & Electrical Specifications</span>
              <span className="text-[10px] text-slate-500 font-normal">7 Components • 13 Wiring Connections</span>
            </div>
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-1.5 px-2">Net Name</th>
                  <th className="py-1.5 px-2">Source Pin</th>
                  <th className="py-1.5 px-2">Target Pin</th>
                  <th className="py-1.5 px-2">Wire Color</th>
                  <th className="py-1.5 px-2">Signal Type</th>
                  <th className="py-1.5 px-2">Live Electrical State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                <tr className="hover:bg-slate-800/30">
                  <td className="py-1 px-2 font-bold text-cyan-300">DHT_DATA</td>
                  <td className="py-1 px-2">esp:4 (GPIO 4)</td>
                  <td className="py-1 px-2">dht:SDA</td>
                  <td className="py-1 px-2 text-green-400">Green</td>
                  <td className="py-1 px-2 text-slate-400">Single-Wire Digital Bidirectional</td>
                  <td className="py-1 px-2 text-emerald-400">{sensors.temperatureC.toFixed(1)}°C / {sensors.humidityPct.toFixed(0)}% RH</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-1 px-2 font-bold text-cyan-300">VCC_3V3</td>
                  <td className="py-1 px-2">esp:3V3</td>
                  <td className="py-1 px-2">dht:VCC & water_sensor:1</td>
                  <td className="py-1 px-2 text-red-400">Red</td>
                  <td className="py-1 px-2 text-slate-400">+3.3V DC Power Rail</td>
                  <td className="py-1 px-2 text-red-300">3.30 V Constant</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-1 px-2 font-bold text-cyan-300">GND_RAIL</td>
                  <td className="py-1 px-2">esp:GND.1 / GND.2</td>
                  <td className="py-1 px-2">dht:GND, water:3, led:C, buzzer:1</td>
                  <td className="py-1 px-2 text-slate-400">Black</td>
                  <td className="py-1 px-2 text-slate-400">0V Ground Reference</td>
                  <td className="py-1 px-2 text-slate-400">0.00 V Ground</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-1 px-2 font-bold text-cyan-300">WARN_LED</td>
                  <td className="py-1 px-2">esp:2 (GPIO 2)</td>
                  <td className="py-1 px-2">r1:1 -&gt; warning_led:A</td>
                  <td className="py-1 px-2 text-orange-400">Orange</td>
                  <td className="py-1 px-2 text-slate-400">Digital Output (Current limited by 220Ω)</td>
                  <td className="py-1 px-2 text-amber-400">{actuators.warningLed ? 'HIGH (3.3V Strobe)' : 'LOW (0.0V)'}</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-1 px-2 font-bold text-cyan-300">ALARM_BUZZ</td>
                  <td className="py-1 px-2">esp:15 (GPIO 15)</td>
                  <td className="py-1 px-2">buzzer:2</td>
                  <td className="py-1 px-2 text-purple-400">Purple</td>
                  <td className="py-1 px-2 text-slate-400">PWM / Square Wave Driver</td>
                  <td className="py-1 px-2 text-purple-300">{actuators.buzzer ? 'ACTIVE (85dB Oscillating)' : 'MUTED'}</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-1 px-2 font-bold text-cyan-300">WATER_ADC</td>
                  <td className="py-1 px-2">esp:34 (GPIO 34)</td>
                  <td className="py-1 px-2">water_sensor:2</td>
                  <td className="py-1 px-2 text-blue-400">Blue</td>
                  <td className="py-1 px-2 text-slate-400">ADC 12-bit Input (&gt;2000 wet)</td>
                  <td className="py-1 px-2 text-blue-300">{sensors.waterDetected ? '3.3V (Wet - Condensation)' : '0.0V (Dry - Clean)'}</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-1 px-2 font-bold text-cyan-300">FAN_CTRL</td>
                  <td className="py-1 px-2">esp:16 (GPIO 16)</td>
                  <td className="py-1 px-2">fan_indicator:A</td>
                  <td className="py-1 px-2 text-cyan-400">Cyan</td>
                  <td className="py-1 px-2 text-slate-400">Digital Relay Driver (CRAC Blower)</td>
                  <td className="py-1 px-2 text-cyan-300">{actuators.fan ? 'HIGH (Active 2400 RPM)' : 'LOW (Tripped/Halted)'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
