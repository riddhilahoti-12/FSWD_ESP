'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useIoTStore } from '@/store/useIoTStore';
import { soundEffects } from '@/components/3d/Sound/soundEffects';
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
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

interface CircuitDiagramViewerProps {
  onCommandTrigger?: (command: 'SET_FAN' | 'SET_WARNING_LED' | 'SET_BUZZER' | 'SET_WATER', value: any) => void;
  compact?: boolean;
}

interface StepConfig {
  id: number;
  label: string;
  badge: string;
  badgeColor: string;
  target: 'ALL' | 'DHT22' | 'FAN' | 'WATER' | 'BUZZER' | 'RECOVERY';
  title: string;
  desc: string;
  voiceText: string;
  applyState: () => void;
}

export const CircuitDiagramViewer: React.FC<CircuitDiagramViewerProps> = ({
  onCommandTrigger,
  compact = false,
}) => {
  const { sensors, actuators, setSimulationMode, sendCommand } = useIoTStore();
  const [hoveredNet, setHoveredNet] = useState<string | null>(null);
  const [showNetlist, setShowNetlist] = useState<boolean>(!compact);

  // Step-by-Step Guided Walkthrough ("One after another")
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Send hardware command helper
  const sendBridgeCommand = (cmd: string, val: any) => {
    fetch('http://localhost:5000/api/iot/wokwi/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command: cmd,
        value: val,
        deviceId: 'server-room-esp32',
      }),
    }).catch(console.error);
  };

  const triggerCommand = (cmd: 'SET_FAN' | 'SET_WARNING_LED' | 'SET_BUZZER' | 'SET_WATER', val: any) => {
    if (onCommandTrigger) {
      onCommandTrigger(cmd, val);
    } else {
      sendBridgeCommand(cmd, val);
    }
  };

  // Define the 6 sequential demonstration steps
  const steps: StepConfig[] = [
    {
      id: 0,
      label: '1. Baseline',
      badge: 'NORMAL ENVELOPE',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      target: 'ALL',
      title: 'Step 1: Normal Baseline Operating State',
      desc: 'All systems start clean. Temperature is within nominal range (23.5°C), humidity 48%, drip tray is dry (0.0V), and all warning LEDs and buzzers are silent.',
      voiceText: 'Normal baseline environment. All telemetry nominal.',
      applyState: () => {
        sendBridgeCommand('SET_SIMULATION_MODE', 'NORMAL');
        try { setSimulationMode('server-room-esp32', 'NORMAL'); } catch {}
        sendBridgeCommand('SET_WARNING_LED', false);
        sendBridgeCommand('SET_BUZZER', false);
        sendBridgeCommand('SET_FAN', false);
      },
    },
    {
      id: 1,
      label: '2. Temp Sensor (DHT22)',
      badge: 'OVERHEATING ALERT',
      badgeColor: 'bg-red-950 text-red-300 border-red-500/40',
      target: 'DHT22',
      title: 'Step 2: Sensor 1 — DHT22 Ambient Temperature Probe (GPIO 4)',
      desc: 'Simulating thermal build-up in the server rack. When temperature exceeds 28.0°C threshold (rising to 32.5°C), the Warning Red Strobe LED on GPIO 2 ignites through 220Ω resistor R1.',
      voiceText: 'Warning: Critical server room overheating detected. Strobe warning LED activated.',
      applyState: () => {
        sendBridgeCommand('SET_SIMULATION_MODE', 'OVERHEATING');
        try { setSimulationMode('server-room-esp32', 'OVERHEATING'); } catch {}
        soundEffects.playHardwareAlarm();
      },
    },
    {
      id: 2,
      label: '3. CRAC Fan Relay',
      badge: 'COOLING ENGAGED',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
      target: 'FAN',
      title: 'Step 3: Actuator 1 — CRAC Blower Fan Relay Motor (GPIO 16)',
      desc: 'Energizing the active cooling blower. GPIO 16 goes HIGH, Blue motor indicator LED illuminates, fan accelerates to 2400 RPM, and thermal heat dissipation cools the room.',
      voiceText: 'CRAC Blower Fan online at 2400 RPM. Cooling restored.',
      applyState: () => {
        sendBridgeCommand('SET_SIMULATION_MODE', 'COOLING');
        try { setSimulationMode('server-room-esp32', 'COOLING'); } catch {}
        sendBridgeCommand('SET_FAN', true);
      },
    },
    {
      id: 3,
      label: '4. Water Leak Probe',
      badge: 'WATER DETECTED',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-500/40',
      target: 'WATER',
      title: 'Step 4: Sensor 2 — Water Condensation Drip Tray Probe (GPIO 34)',
      desc: 'Simulating condensation leak in the CRAC drainage tray. GPIO 34 analog input detects 3.3V voltage threshold (>2000 count on 12-bit ADC), flagging a hazard alert.',
      voiceText: 'Alert: Water condensation leak detected in drip tray.',
      applyState: () => {
        sendBridgeCommand('SET_SIMULATION_MODE', 'WATER_ALERT');
        try { setSimulationMode('server-room-esp32', 'WATER_ALERT'); } catch {}
        sendBridgeCommand('SET_WATER', true);
      },
    },
    {
      id: 4,
      label: '5. Acoustic Buzzer',
      badge: '85dB ALARM ACTIVE',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-500/40',
      target: 'BUZZER',
      title: 'Step 5: Actuator 2 — Piezo Acoustic Annunciator (GPIO 15)',
      desc: 'Evacuation annunciator triggered. GPIO 15 pulses an 85dB acoustic buzzer tone and vocal speech alert to warn server room personnel of liquid accumulation.',
      voiceText: 'Acoustic buzzer sounding at 85 decibels.',
      applyState: () => {
        sendBridgeCommand('SET_BUZZER', true);
        soundEffects.playHardwareBuzzerTone();
      },
    },
    {
      id: 5,
      label: '6. System Recovery',
      badge: 'RECOVERY NOMINAL',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      target: 'RECOVERY',
      title: 'Step 6: System Recovery & Nominal Clearance',
      desc: 'Resetting all sensor alarm flags. Warning LED and buzzer are silenced, temperature returns to the safe 22°C envelope, and the facility returns to healthy operation.',
      voiceText: 'All alarms cleared. Server room environment nominal.',
      applyState: () => {
        sendBridgeCommand('SET_SIMULATION_MODE', 'RECOVERY');
        try { setSimulationMode('server-room-esp32', 'RECOVERY'); } catch {}
        sendBridgeCommand('RESET_ALARM', true);
      },
    },
  ];

  const currentStep = steps[currentStepIndex];

  // Advance or select step
  const goToStep = (index: number) => {
    const nextIdx = Math.max(0, Math.min(steps.length - 1, index));
    setCurrentStepIndex(nextIdx);
    const step = steps[nextIdx];
    step.applyState();
    soundEffects.speakVoice(step.voiceText);
    setCountdown(5);
  };

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Advance to next step
          setCurrentStepIndex((curr) => {
            const nextIdx = (curr + 1) % steps.length;
            const nextStep = steps[nextIdx];
            nextStep.applyState();
            soundEffects.speakVoice(nextStep.voiceText);
            return nextIdx;
          });
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying]);

  const isOverheating = sensors.temperatureC > 28.0;

  // Helpers to check if a component is the focal target in current step
  const isTarget = (targetName: string) => {
    if (currentStep.target === 'ALL') return true;
    return currentStep.target === targetName;
  };

  const getComponentOpacity = (targetName: string) => {
    if (currentStep.target === 'ALL') return 1;
    return currentStep.target === targetName ? 1 : 0.35;
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 font-sans rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Header bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Wokwi ESP32 Circuit Schematic</span>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${currentStep.badgeColor}`}>
                {currentStep.badge}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Target: <strong className="text-cyan-300">{currentStep.title}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto Tour Toggle */}
          <button
            onClick={() => {
              setIsAutoPlaying(!isAutoPlaying);
              if (!isAutoPlaying) {
                // start from current or step 0
                goToStep(currentStepIndex);
              }
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 border ${
              isAutoPlaying
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-900/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isAutoPlaying ? `Auto Playing (${countdown}s)` : 'Auto Tour: One-by-One'}</span>
          </button>

          <button
            onClick={() => setShowNetlist(!showNetlist)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition flex items-center gap-1 border border-slate-700"
          >
            <Info className="w-3 h-3 text-cyan-400" />
            <span>{showNetlist ? 'Hide Netlist' : 'Netlist'}</span>
          </button>
        </div>
      </div>

      {/* Sequential Step Controller Bar (Shows One After Another) */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Step Tabs / Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-1">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              id={`circuit-step-btn-${s.id}`}
              onClick={() => goToStep(idx)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition font-semibold ${
                currentStepIndex === idx
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-900'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Prev / Next buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="circuit-step-prev-btn"
            onClick={() => goToStep(currentStepIndex - 1)}
            disabled={currentStepIndex === 0}
            className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono text-xs text-slate-400 px-1">
            Step <strong className="text-white">{currentStepIndex + 1}</strong> of {steps.length}
          </span>

          <button
            id="circuit-step-next-btn"
            onClick={() => goToStep(currentStepIndex + 1)}
            disabled={currentStepIndex === steps.length - 1}
            className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Description Banner */}
      <div className="bg-slate-950/80 border-b border-slate-800/60 px-4 py-2.5 flex items-start gap-2.5">
        <div className="p-1 rounded bg-cyan-950 text-cyan-400 shrink-0 mt-0.5">
          <Zap className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold text-slate-200">
            {currentStep.title}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5 leading-relaxed">
            {currentStep.desc}
          </div>
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
            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="glowRed" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="glowGreen" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
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
              .fan-blade {
                transform-origin: 140px 420px;
                animation: spinFan 1.2s linear infinite;
              }
            `}</style>
          </defs>

          {/* Grid background lines */}
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
            {/* ESP32 RF Shield */}
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

            {/* LEFT PIN RAIL */}
            <g transform="translate(-10, 50)" className="cursor-pointer" onMouseEnter={() => setHoveredNet('3V3 (VCC +3.3V Bus)')} onMouseLeave={() => setHoveredNet(null)}>
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#ef4444" />
              <text x="25" y="11" fill="#fca5a5" fontSize="10" fontFamily="monospace" fontWeight="bold">3V3</text>
            </g>

            <g transform="translate(-10, 80)" className="cursor-pointer" onMouseEnter={() => setHoveredNet('GND.1 (Ground Rail 1)')} onMouseLeave={() => setHoveredNet(null)}>
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
              <text x="25" y="11" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">GND.1</text>
            </g>

            <g transform="translate(-10, 120)" className="cursor-pointer" onMouseEnter={() => setHoveredNet('GPIO 2 (Warning LED Signal)')} onMouseLeave={() => setHoveredNet(null)}>
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#f97316" />
              <text x="25" y="11" fill="#fed7aa" fontSize="10" fontFamily="monospace" fontWeight="bold">IO2</text>
            </g>

            <g transform="translate(-10, 160)" className="cursor-pointer" onMouseEnter={() => setHoveredNet('GPIO 15 (Piezo Buzzer PWM)')} onMouseLeave={() => setHoveredNet(null)}>
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#a855f7" />
              <text x="25" y="11" fill="#e9d5ff" fontSize="10" fontFamily="monospace" fontWeight="bold">IO15</text>
            </g>

            <g transform="translate(-10, 200)" className="cursor-pointer" onMouseEnter={() => setHoveredNet('GPIO 16 (CRAC Fan Relay Signal)')} onMouseLeave={() => setHoveredNet(null)}>
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#06b6d4" />
              <text x="25" y="11" fill="#a5f3fc" fontSize="10" fontFamily="monospace" fontWeight="bold">IO16</text>
            </g>

            {/* RIGHT PIN RAIL */}
            <g transform="translate(190, 50)" className="cursor-pointer" onMouseEnter={() => setHoveredNet('GPIO 4 (DHT22 SDA Data Bus)')} onMouseLeave={() => setHoveredNet(null)}>
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#22c55e" />
              <text x="-8" y="11" textAnchor="end" fill="#bbf7d0" fontSize="10" fontFamily="monospace" fontWeight="bold">IO4</text>
            </g>

            <g transform="translate(190, 120)" className="cursor-pointer" onMouseEnter={() => setHoveredNet('GPIO 34 (Water Sensor ADC Input)')} onMouseLeave={() => setHoveredNet(null)}>
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#3b82f6" />
              <text x="-8" y="11" textAnchor="end" fill="#bfdbfe" fontSize="10" fontFamily="monospace" fontWeight="bold">IO34</text>
            </g>

            <g transform="translate(190, 200)" className="cursor-pointer" onMouseEnter={() => setHoveredNet('GND.2 (Ground Rail 2)')} onMouseLeave={() => setHoveredNet(null)}>
              <rect x="0" y="0" width="20" height="14" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
              <text x="-8" y="11" textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">GND.2</text>
            </g>
          </g>

          {/* ============================================================== */}
          {/* 2. COMPONENT: DHT22 SENSOR (TOP-RIGHT: 640, 40)               */}
          {/* ============================================================== */}
          <g
            transform="translate(640, 40)"
            opacity={getComponentOpacity('DHT22')}
            className="cursor-pointer transition-all duration-300"
            onMouseEnter={() => setHoveredNet('DHT22 Sensor: Single-wire digital temperature & humidity probe')}
            onMouseLeave={() => setHoveredNet(null)}
          >
            {/* Focal Highlight Ring if active in current step */}
            {isTarget('DHT22') && (
              <rect x="-6" y="-6" width="182" height="132" rx="12" fill="none" stroke="#22c55e" strokeWidth="2.5" filter="url(#glowGreen)" strokeDasharray="6 3" className="wire-fast" />
            )}
            <rect x="0" y="0" width="170" height="120" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
            <rect x="10" y="10" width="150" height="40" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
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
              [{isOverheating ? 'OVERHEATING ALERT' : 'NOMINAL SAFE'}]
            </text>

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
          {/* 3. COMPONENT: 220Ω RESISTOR (R1) & WARNING RED LED            */}
          {/* ============================================================== */}
          <g
            transform="translate(190, 220)"
            opacity={getComponentOpacity('DHT22')}
            className="cursor-pointer"
            onMouseEnter={() => setHoveredNet('R1 Resistor: 220Ω Current Limiting (Pin 2 -> LED Anode)')}
            onMouseLeave={() => setHoveredNet(null)}
          >
            <rect x="0" y="0" width="60" height="20" rx="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
            <rect x="12" y="0" width="4" height="20" fill="#dc2626" />
            <rect x="22" y="0" width="4" height="20" fill="#dc2626" />
            <rect x="32" y="0" width="4" height="20" fill="#78350f" />
            <rect x="46" y="0" width="3" height="20" fill="#eab308" />
            <text x="30" y="-6" textAnchor="middle" fill="#ca8a04" fontSize="9" fontFamily="monospace" fontWeight="bold">
              R1 (220Ω)
            </text>
          </g>

          <g
            transform="translate(80, 210)"
            opacity={getComponentOpacity('DHT22')}
            className="cursor-pointer transition-transform hover:scale-110"
            onClick={() => triggerCommand('SET_WARNING_LED', !actuators.warningLed)}
            onMouseEnter={() => setHoveredNet('Warning LED: Pin 2 via R1 (Click to Toggle)')}
            onMouseLeave={() => setHoveredNet(null)}
          >
            {actuators.warningLed && (
              <circle cx="20" cy="20" r="28" fill="#ef4444" opacity="0.3" filter="url(#glowRed)" className="animate-pulse" />
            )}
            <circle
              cx="20"
              cy="20"
              r="16"
              fill={actuators.warningLed ? '#ef4444' : '#7f1d1d'}
              stroke="#b91c1c"
              strokeWidth="2"
              filter={actuators.warningLed ? 'url(#glowRed)' : undefined}
            />
            <path d="M 12 12 Q 18 10 24 16" stroke="#ffffff" strokeWidth="2" fill="none" opacity={actuators.warningLed ? 0.9 : 0.2} />
            <text x="20" y="52" textAnchor="middle" fill={actuators.warningLed ? '#fca5a5' : '#94a3b8'} fontSize="9" fontFamily="monospace" fontWeight="bold">
              WARNING LED
            </text>
            <text x="20" y="64" textAnchor="middle" fill={actuators.warningLed ? '#ef4444' : '#64748b'} fontSize="8" fontFamily="monospace">
              [{actuators.warningLed ? 'STROBING' : 'OFF'}]
            </text>
          </g>

          {/* ============================================================== */}
          {/* 4. COMPONENT: ACOUSTIC PIEZO BUZZER                           */}
          {/* ============================================================== */}
          <g
            transform="translate(70, 310)"
            opacity={getComponentOpacity('BUZZER')}
            className="cursor-pointer transition-transform hover:scale-110"
            onClick={() => triggerCommand('SET_BUZZER', !actuators.buzzer)}
            onMouseEnter={() => setHoveredNet('Piezo Buzzer: Pin 15 (Click to Toggle)')}
            onMouseLeave={() => setHoveredNet(null)}
          >
            {isTarget('BUZZER') && (
              <circle cx="30" cy="30" r="36" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="6 3" className="wire-fast" />
            )}
            {actuators.buzzer && (
              <g stroke="#c084fc" fill="none" strokeWidth="2" className="animate-ping">
                <circle cx="30" cy="30" r="38" opacity="0.4" />
                <circle cx="30" cy="30" r="48" opacity="0.2" />
              </g>
            )}
            <circle cx="30" cy="30" r="26" fill="#1e1b4b" stroke="#a855f7" strokeWidth="2.5" />
            <circle cx="30" cy="30" r="10" fill="#0f172a" stroke="#7e22ce" strokeWidth="1.5" />
            <text x="30" y="70" textAnchor="middle" fill={actuators.buzzer ? '#e9d5ff' : '#94a3b8'} fontSize="9" fontFamily="monospace" fontWeight="bold">
              PIEZO BUZZER
            </text>
            <text x="30" y="82" textAnchor="middle" fill={actuators.buzzer ? '#c084fc' : '#64748b'} fontSize="8" fontFamily="monospace">
              [{actuators.buzzer ? '85dB ACTIVE' : 'MUTED'}]
            </text>
          </g>

          {/* ============================================================== */}
          {/* 5. COMPONENT: CRAC BLOWER FAN MOTOR (PIN 16)                  */}
          {/* ============================================================== */}
          <g
            transform="translate(60, 400)"
            opacity={getComponentOpacity('FAN')}
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => triggerCommand('SET_FAN', !actuators.fan)}
            onMouseEnter={() => setHoveredNet('CRAC Fan Indicator & Motor: Pin 16 (Click to Toggle)')}
            onMouseLeave={() => setHoveredNet(null)}
          >
            {isTarget('FAN') && (
              <circle cx="80" cy="30" r="42" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="6 3" className="wire-fast" />
            )}
            <circle cx="80" cy="30" r="32" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" filter={actuators.fan ? 'url(#glowCyan)' : undefined} />
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
          {/* 6. COMPONENT: WATER DETECTION SLIDE SWITCH (PIN 34)           */}
          {/* ============================================================== */}
          <g
            transform="translate(650, 240)"
            opacity={getComponentOpacity('WATER')}
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => triggerCommand('SET_WATER', !sensors.waterDetected)}
            onMouseEnter={() => setHoveredNet('Water Sensor (Slide Switch): Pin 34 ADC (Click to Toggle Leak)')}
            onMouseLeave={() => setHoveredNet(null)}
          >
            {isTarget('WATER') && (
              <rect x="-6" y="-6" width="172" height="102" rx="12" fill="none" stroke="#3b82f6" strokeWidth="2.5" filter="url(#glowBlue)" strokeDasharray="6 3" className="wire-fast" />
            )}
            <rect x="0" y="0" width="160" height="90" rx="8" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
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
          {/* 7. LIVELY CONTROLLED WIRES & INTERCONNECTIONS                  */}
          {/* ============================================================== */}

          {/* A. 3.3V VCC RAIL (Red Wires) */}
          <path
            d="M 320 160 L 290 160 L 290 20 L 670 20 L 670 160"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            opacity="0.8"
          />
          <path
            d="M 290 160 L 290 180 L 600 180 L 600 290 L 650 290"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* B. GROUND RAILS */}
          <path d="M 320 190 L 270 190 L 270 8 L 790 8 L 790 160" fill="none" stroke="#475569" strokeWidth="1.5" />
          <path d="M 270 190 L 270 200 L 620 200 L 620 310 L 650 310" fill="none" stroke="#475569" strokeWidth="1.5" />
          <path d="M 530 310 L 580 310 L 580 490 L 100 490 L 100 260" fill="none" stroke="#475569" strokeWidth="1.5" />
          <path d="M 580 470 L 120 470 L 120 370" fill="none" stroke="#475569" strokeWidth="1.5" />
          <path d="M 580 490 L 160 490 L 160 460" fill="none" stroke="#475569" strokeWidth="1.5" />

          {/* C. SIGNAL LINES (Animates ONLY when targeted or active) */}

          {/* Wire: ESP:4 -> DHT:SDA (Green Data Bus) */}
          <path
            d="M 530 160 L 560 160 L 560 60 L 710 60 L 710 160"
            fill="none"
            stroke="#22c55e"
            strokeWidth={isTarget('DHT22') ? 3.5 : 2}
            strokeDasharray={isTarget('DHT22') ? '8 4' : undefined}
            className={isTarget('DHT22') ? 'wire-fast' : undefined}
            filter={isTarget('DHT22') ? 'drop-shadow(0 0 5px #22c55e)' : undefined}
          />

          {/* Wire: ESP:2 -> R1:1 -> Warning LED Anode (Orange wire) */}
          <path
            d="M 320 230 L 250 230"
            fill="none"
            stroke="#f97316"
            strokeWidth={actuators.warningLed ? 3 : 2}
            strokeDasharray={actuators.warningLed ? '6 3' : undefined}
            className={actuators.warningLed ? 'wire-fast' : undefined}
          />
          <path
            d="M 190 230 L 120 230"
            fill="none"
            stroke="#f97316"
            strokeWidth={actuators.warningLed ? 3 : 2}
            strokeDasharray={actuators.warningLed ? '6 3' : undefined}
            className={actuators.warningLed ? 'wire-fast' : undefined}
            filter={actuators.warningLed ? 'url(#glowOrange)' : undefined}
          />

          {/* Wire: ESP:15 -> Buzzer:2 (Purple wire) */}
          <path
            d="M 320 270 L 150 270 L 150 330 L 120 330"
            fill="none"
            stroke="#a855f7"
            strokeWidth={actuators.buzzer || isTarget('BUZZER') ? 3 : 2}
            strokeDasharray={actuators.buzzer || isTarget('BUZZER') ? '6 4' : undefined}
            className={actuators.buzzer || isTarget('BUZZER') ? 'wire-fast' : undefined}
            filter={actuators.buzzer ? 'drop-shadow(0 0 5px #a855f7)' : undefined}
          />

          {/* Wire: ESP:16 -> Fan Indicator Anode (Cyan wire) */}
          <path
            d="M 320 310 L 220 310 L 220 430 L 140 430"
            fill="none"
            stroke="#06b6d4"
            strokeWidth={actuators.fan || isTarget('FAN') ? 3 : 2}
            strokeDasharray={actuators.fan || isTarget('FAN') ? '8 4' : undefined}
            className={actuators.fan || isTarget('FAN') ? 'wire-fast' : undefined}
            filter={actuators.fan ? 'url(#glowCyan)' : undefined}
          />

          {/* Wire: ESP:34 <- Water Sensor Pin 2 (Blue wire) */}
          <path
            d="M 530 230 L 570 230 L 570 280 L 650 280"
            fill="none"
            stroke="#3b82f6"
            strokeWidth={sensors.waterDetected || isTarget('WATER') ? 3 : 2}
            strokeDasharray={sensors.waterDetected || isTarget('WATER') ? '6 4' : undefined}
            className={sensors.waterDetected || isTarget('WATER') ? 'wire-fast' : undefined}
            filter={sensors.waterDetected ? 'url(#glowBlue)' : undefined}
          />

          {/* Hover tooltip HUD */}
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

      {/* Netlist Table */}
      {showNetlist && (
        <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4 overflow-x-auto">
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
              <tr className={`hover:bg-slate-800/30 ${isTarget('DHT22') ? 'bg-cyan-950/40 font-bold' : ''}`}>
                <td className="py-1 px-2 text-cyan-300">DHT_DATA</td>
                <td className="py-1 px-2">esp:4 (GPIO 4)</td>
                <td className="py-1 px-2">dht:SDA</td>
                <td className="py-1 px-2 text-green-400">Green</td>
                <td className="py-1 px-2 text-slate-400">Single-Wire Digital Bidirectional</td>
                <td className="py-1 px-2 text-emerald-400">{sensors.temperatureC.toFixed(1)}°C / {sensors.humidityPct.toFixed(0)}% RH</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-1 px-2 text-cyan-300">VCC_3V3</td>
                <td className="py-1 px-2">esp:3V3</td>
                <td className="py-1 px-2">dht:VCC & water_sensor:1</td>
                <td className="py-1 px-2 text-red-400">Red</td>
                <td className="py-1 px-2 text-slate-400">+3.3V DC Power Rail</td>
                <td className="py-1 px-2 text-red-300">3.30 V Constant</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-1 px-2 text-cyan-300">GND_RAIL</td>
                <td className="py-1 px-2">esp:GND.1 / GND.2</td>
                <td className="py-1 px-2">dht:GND, water:3, led:C, buzzer:1</td>
                <td className="py-1 px-2 text-slate-400">Black</td>
                <td className="py-1 px-2 text-slate-400">0V Ground Reference</td>
                <td className="py-1 px-2 text-slate-400">0.00 V Ground</td>
              </tr>
              <tr className={`hover:bg-slate-800/30 ${isTarget('DHT22') ? 'bg-orange-950/40 font-bold' : ''}`}>
                <td className="py-1 px-2 text-cyan-300">WARN_LED</td>
                <td className="py-1 px-2">esp:2 (GPIO 2)</td>
                <td className="py-1 px-2">r1:1 -&gt; warning_led:A</td>
                <td className="py-1 px-2 text-orange-400">Orange</td>
                <td className="py-1 px-2 text-slate-400">Digital Output (Current limited by 220Ω)</td>
                <td className="py-1 px-2 text-amber-400">{actuators.warningLed ? 'HIGH (3.3V Strobe)' : 'LOW (0.0V)'}</td>
              </tr>
              <tr className={`hover:bg-slate-800/30 ${isTarget('BUZZER') ? 'bg-purple-950/40 font-bold' : ''}`}>
                <td className="py-1 px-2 text-cyan-300">ALARM_BUZZ</td>
                <td className="py-1 px-2">esp:15 (GPIO 15)</td>
                <td className="py-1 px-2">buzzer:2</td>
                <td className="py-1 px-2 text-purple-400">Purple</td>
                <td className="py-1 px-2 text-slate-400">PWM / Square Wave Driver</td>
                <td className="py-1 px-2 text-purple-300">{actuators.buzzer ? 'ACTIVE (85dB Oscillating)' : 'MUTED'}</td>
              </tr>
              <tr className={`hover:bg-slate-800/30 ${isTarget('WATER') ? 'bg-blue-950/40 font-bold' : ''}`}>
                <td className="py-1 px-2 text-cyan-300">WATER_ADC</td>
                <td className="py-1 px-2">esp:34 (GPIO 34)</td>
                <td className="py-1 px-2">water_sensor:2</td>
                <td className="py-1 px-2 text-blue-400">Blue</td>
                <td className="py-1 px-2 text-slate-400">ADC 12-bit Input (&gt;2000 wet)</td>
                <td className="py-1 px-2 text-blue-300">{sensors.waterDetected ? '3.3V (Wet - Condensation)' : '0.0V (Dry - Clean)'}</td>
              </tr>
              <tr className={`hover:bg-slate-800/30 ${isTarget('FAN') ? 'bg-cyan-950/40 font-bold' : ''}`}>
                <td className="py-1 px-2 text-cyan-300">FAN_CTRL</td>
                <td className="py-1 px-2">esp:16 (GPIO 16)</td>
                <td className="py-1 px-2">fan_indicator:A</td>
                <td className="py-1 px-2 text-cyan-400">Cyan</td>
                <td className="py-1 px-2 text-slate-400">Digital Relay Driver (CRAC Blower)</td>
                <td className="py-1 px-2 text-cyan-300">{actuators.fan ? 'HIGH (Active 2400 RPM)' : 'LOW (Halted)'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
