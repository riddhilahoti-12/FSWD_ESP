'use client';

import React from 'react';
import { MissionState } from '@missionx/shared';
import {
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
  X,
  MapPin,
  DoorOpen,
  Cpu,
  AlertCircle,
  Radio,
  Layers,
  Thermometer,
  Fan,
  Droplets,
  Zap,
  Activity,
  Sliders,
} from 'lucide-react';

interface MissionMapTabletProps {
  isOpen: boolean;
  onClose: () => void;
  missionState: MissionState;
}

interface LocationNode {
  id: string;
  stageOrder: number;
  name: string;
  zone: string;
  icon: React.ReactNode;
  coords: { xPct: number; yPct: number }; // % coordinates on mini-schematic
  description: string;
  guidance: string;
}

// Stage locations for Mission 1: Rescue the Server Room
const MISSION_1_LOCATIONS: LocationNode[] = [
  {
    id: 'temperature_sensor',
    stageOrder: 1,
    name: 'Intake Temperature Sensor',
    zone: 'East Rack Bay Aisle (Probe Node #1)',
    icon: <Thermometer className="w-4 h-4" />,
    coords: { xPct: 68, yPct: 40 },
    description: 'DHT22 digital environmental sensor monitoring cold aisle intake air.',
    guidance: 'Inspect the temperature sensor on the right aisle rack to verify thermal limits.',
  },
  {
    id: 'cooling_fan',
    stageOrder: 2,
    name: 'CRAC Cooling Blower & Warning Beacon',
    zone: 'North-West Ventilation Manifold',
    icon: <Fan className="w-4 h-4" />,
    coords: { xPct: 35, yPct: 22 },
    description: 'High-volume centrifugal cooling blower and alarm strobe beacon.',
    guidance: 'Investigate the stationary blower fan and pulsing warning beacon to diagnose airflow loss.',
  },
  {
    id: 'water_sensor',
    stageOrder: 3,
    name: 'Condensate Drip Tray & Water Sensor',
    zone: 'Sub-floor CRAC Drainage Grid',
    icon: <Droplets className="w-4 h-4" />,
    coords: { xPct: 35, yPct: 32 },
    description: 'Nickel-plated sub-floor resistive moisture grid under the evaporator pan.',
    guidance: 'Inspect the condensate drip tray beneath the cooling blower to rule out liquid leakage hazards.',
  },
  {
    id: 'control_panel',
    stageOrder: 4,
    name: 'Emergency Breaker Subpanel',
    zone: 'North Wall Central Distribution Panel',
    icon: <Zap className="w-4 h-4" />,
    coords: { xPct: 50, yPct: 18 },
    description: 'Auxiliary 240V 3-phase circuit breaker station with digital clearance keypad.',
    guidance: 'Enter the 4-digit clearance authorization code to engage the breaker contactor and restore cooling.',
  },
];

// Stage locations for Mission 2: Signal in the Lab
const MISSION_2_LOCATIONS: LocationNode[] = [
  {
    id: 'oscilloscope',
    stageOrder: 1,
    name: 'Digital Storage Oscilloscope',
    zone: 'Central ESD Workbench (North)',
    icon: <Activity className="w-4 h-4" />,
    coords: { xPct: 40, yPct: 35 },
    description: 'Rigol DS1054Z 200MHz digital storage oscilloscope measuring 1 kHz test sinusoid.',
    guidance: 'Analyze the Channel 1 waveform on the oscilloscope to confirm the fundamental frequency (1000 Hz).',
  },
  {
    id: 'breadboard',
    stageOrder: 2,
    name: 'Prototyping Breadboard & RC Circuit',
    zone: 'Analog Prototyping Station (Center)',
    icon: <Cpu className="w-4 h-4" />,
    coords: { xPct: 50, yPct: 42 },
    description: 'Passive RC prototyping array with 10 kΩ precision resistor and 15 nF capacitor.',
    guidance: 'Calculate the fundamental period in milliseconds (T = 1 / f) for the 1000 Hz tone to synchronize timebase.',
  },
  {
    id: 'filter_module',
    stageOrder: 3,
    name: 'Active Op-Amp Filter Selector Module',
    zone: 'Active Filter Rack Station (North Wall)',
    icon: <Radio className="w-4 h-4" />,
    coords: { xPct: 50, yPct: 22 },
    description: 'TL072 low-noise op-amp active filter bank with selectable filter topology.',
    guidance: 'Select the Low-pass filter topology to suppress electromagnetic noise spikes > 5 kHz while passing 1 kHz.',
  },
  {
    id: 'measurement_console',
    stageOrder: 4,
    name: 'Main Instrumentation ATE Console',
    zone: 'East Wall Automated Test Station',
    icon: <Sliders className="w-4 h-4" />,
    coords: { xPct: 78, yPct: 46 },
    description: 'Master automated test equipment (ATE) calibration terminal and door interlock release.',
    guidance: 'Enter the 5-character Calibration Authorization Code (RC741) to stabilize harmonics and release exit portal.',
  },
];

// Stage locations for Mission 3: Lost Sensor Network
const MISSION_3_LOCATIONS: LocationNode[] = [
  {
    id: 'monitoring_screen',
    stageOrder: 1,
    name: 'NOC Status Telemetry Display',
    zone: 'North Wall Operations Video Wall',
    icon: <Activity className="w-4 h-4" />,
    coords: { xPct: 50, yPct: 18 },
    description: 'Central operations monitoring video wall rendering real-time node heartbeat metrics.',
    guidance: 'Inspect the central NOC status display to isolate which sensor node has dropped off (Node C).',
  },
  {
    id: 'network_switch',
    stageOrder: 2,
    name: 'Managed L2+ Switch & Patch Enclosure',
    zone: 'North-West Equipment Rack Bay',
    icon: <Radio className="w-4 h-4" />,
    coords: { xPct: 35, yPct: 24 },
    description: 'Enterprise 24-port managed Gigabit switch and patch cable connection bay.',
    guidance: 'Inspect switch status LEDs to identify the physical link failure on Port 3.',
  },
  {
    id: 'packet_console',
    stageOrder: 3,
    name: 'Packet Route Selection Console',
    zone: 'West Wall Routing Terminal',
    icon: <Sliders className="w-4 h-4" />,
    coords: { xPct: 25, yPct: 40 },
    description: 'Dynamic packet routing console linking Node C through the industrial wireless AP.',
    guidance: 'Select the resilient route hops: Node C → Wireless AP → Network Switch → Central Gateway.',
  },
  {
    id: 'central_gateway',
    stageOrder: 4,
    name: 'Central IoT Gateway Hub',
    zone: 'Rack Bay Aggregation Terminal',
    icon: <Cpu className="w-4 h-4" />,
    coords: { xPct: 35, yPct: 18 },
    description: 'Carrier-grade IoT gateway terminal committing routing tables and releasing interlocks.',
    guidance: 'Enter Gateway Routing Clearance Code (NET99) to latch the table and unlock the NOC exit portal.',
  },
];

// Stage locations for Mission 4: Power Grid Calibration
const MISSION_4_LOCATIONS: LocationNode[] = [
  {
    id: 'adc_station',
    stageOrder: 1,
    name: '12-Bit ADC Calibration Rig',
    zone: 'West Instrumentation Bench',
    icon: <Activity className="w-4 h-4" />,
    coords: { xPct: 28, yPct: 35 },
    description: 'Precision voltage reference divider (1.65V Vin / 3.3V Vref) and 12-bit ADC quantization meter.',
    guidance: 'Calculate the 12-bit ADC count (Vin / Vref * 4096 = 2048) to calibrate the sampling front-end.',
  },
  {
    id: 'pwm_station',
    stageOrder: 2,
    name: 'PWM Duty Cycle Generator',
    zone: 'Central Modulation Bench',
    icon: <Zap className="w-4 h-4" />,
    coords: { xPct: 50, yPct: 32 },
    description: 'Oscilloscope-monitored variable PWM generator modulating 3.3V down to 1.98V average output.',
    guidance: 'Configure and submit the required PWM duty cycle percentage (60%) for voltage synthesis.',
  },
  {
    id: 'power_bench',
    stageOrder: 3,
    name: 'Resistive Power Dissipation Bench',
    zone: 'East Load Bank Terminal',
    icon: <Sliders className="w-4 h-4" />,
    coords: { xPct: 72, yPct: 38 },
    description: 'Precision 10 Ω shunt load resistor and digital thermal power analyzer.',
    guidance: 'Calculate power dissipation across the 10 Ω load at 1.98V (P = V² / R = 0.39 W) to verify load stability.',
  },
  {
    id: 'calibration_panel',
    stageOrder: 4,
    name: 'Master Grid Closed-Loop Console',
    zone: 'North Wall Grid Synchronization Console',
    icon: <Cpu className="w-4 h-4" />,
    coords: { xPct: 50, yPct: 18 },
    description: 'Non-volatile EEPROM calibration terminal and power grid interlock release.',
    guidance: 'Enter Power Calibration Clearance Code (GRID33) to commit PID parameters and release exit portal.',
  },
];

// Stage locations for Mission 5: Smart Greenhouse Mystery
const MISSION_5_LOCATIONS: LocationNode[] = [
  {
    id: 'soil_sensor',
    stageOrder: 1,
    name: 'Smart Soil Moisture Sensor Probe',
    zone: 'South-West Plant Bed & Rhizosphere Station',
    icon: <Droplets className="w-4 h-4" />,
    coords: { xPct: 30, yPct: 45 },
    description: 'Capacitive frequency-domain soil moisture probe tracking volumetric water content.',
    guidance: 'Inspect the soil telemetry monitor to identify critical moisture deficit (31% vs 40% threshold).',
  },
  {
    id: 'irrigation_manifold',
    stageOrder: 2,
    name: 'Automated Drip Irrigation Manifold',
    zone: 'North-West Fluid Control Station',
    icon: <Droplets className="w-4 h-4" />,
    coords: { xPct: 30, yPct: 22 },
    description: 'Micro-solenoid water distribution manifold and variable-rate peristaltic pump.',
    guidance: 'Dispatch the ACTIVATE_IRRIGATION_PUMP command to start root-zone drip irrigation.',
  },
  {
    id: 'ventilation_system',
    stageOrder: 3,
    name: 'Canopy Convective Ventilation Array',
    zone: 'North Wall Aerodynamic Exhaust Blower',
    icon: <Fan className="w-4 h-4" />,
    coords: { xPct: 50, yPct: 18 },
    description: 'Dual-speed brushless ventilation exhaust blowers and active louver system.',
    guidance: 'Activate ventilation exhaust fans to vent radiant heat and lower canopy temperature toward 24°C.',
  },
  {
    id: 'lighting_console',
    stageOrder: 4,
    name: 'Greenhouse Climate Equilibrium Console',
    zone: 'East Botanical Monitoring Desk',
    icon: <Zap className="w-4 h-4" />,
    coords: { xPct: 75, yPct: 40 },
    description: 'Central climate balance terminal controlling photoperiod schedule and security lock.',
    guidance: 'Enter Climate Equilibrium Clearance Code (FLORA88) to sync grow lights and release exit portal.',
  },
];

export const MissionMapTablet: React.FC<MissionMapTabletProps> = ({
  isOpen,
  onClose,
  missionState,
}) => {
  if (!isOpen) return null;

  const slug = (missionState.slug || '').toLowerCase();
  const isMission1 = slug === 'rescue-the-server-room';
  const isMission2 = slug === 'signal-in-the-lab';
  const isMission3 = slug === 'lost-sensor-network';
  const isMission4 = slug === 'power-grid-calibration';
  const isMission5 = slug === 'smart-greenhouse-mystery';

  const stageLocations = isMission2
    ? MISSION_2_LOCATIONS
    : isMission3
    ? MISSION_3_LOCATIONS
    : isMission4
    ? MISSION_4_LOCATIONS
    : isMission5
    ? MISSION_5_LOCATIONS
    : MISSION_1_LOCATIONS;

  const tabletDeviceTitle = isMission2
    ? 'PRECISION ELECTRONICS NAV-TABLET v2.4'
    : isMission3
    ? 'NETWORK OPERATIONS NAV-TABLET v2.4'
    : isMission4
    ? 'ELECTRICAL GRID NAV-TABLET v2.4'
    : isMission5
    ? 'AGRI-IOT BIOSPHERE NAV-TABLET v2.4'
    : 'DATACENTER FIELD NAV-TABLET v2.4';

  const schematicTitle = isMission2
    ? 'ELECTRONICS LAB 204 — ARCHITECTURAL SCHEMATIC'
    : isMission3
    ? 'NOC OPERATIONS CENTER 301 — ARCHITECTURAL SCHEMATIC'
    : isMission4
    ? 'POWER SYSTEMS LAB 402 — ARCHITECTURAL SCHEMATIC'
    : isMission5
    ? 'SMART GREENHOUSE BIOSPHERE 505 — ARCHITECTURAL SCHEMATIC'
    : 'SERVER ROOM 101 — ARCHITECTURAL SCHEMATIC';

  const currentStageOrder = missionState.currentStage || 1;
  const completedStages = missionState.completedStages || [];
  const isExitUnlocked = missionState.isExitUnlocked || completedStages.includes(4);

  // Active target location node
  const activeLocation =
    stageLocations.find((loc) => loc.stageOrder === currentStageOrder) ||
    stageLocations[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-map-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Tablet Device Frame - Bright futuristic styling */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#F7F9FB] border-4 border-[#B8C4CE] shadow-[0_25px_60px_-15px_rgba(0,191,239,0.3)] overflow-hidden text-[#263442]">
        
        {/* Tablet Top Bezel Status Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#E2E8F0] border-b border-[#CBD5E1] text-[11px] font-mono text-[#607080]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00BFEF] animate-pulse" />
            <span className="font-bold tracking-wider text-[#263442]">
              {tabletDeviceTitle}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#00BFEF]" />
              <span>TELEMETRY LINK: ONLINE</span>
            </div>
            <div className="w-px h-3 bg-[#CBD5E1]" />
            <div className="flex items-center gap-1 text-[#20B86B] font-bold">
              <span>BATTERY 98%</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white text-[#607080] hover:text-[#263442] transition"
              title="Close Mission Map"
              id="close-mission-map-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tablet Main Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#00BFEF] uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span id="mission-map-title">Facility Exploration Map</span>
            </div>
            <h2 className="text-xl font-bold text-[#263442] mt-0.5">
              {missionState.title || (isMission2 ? 'Mission 2: Signal in the Lab' : 'Mission 1: Rescue the Server Room')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] text-xs font-mono font-bold text-[#3B82F6]">
              PROGRESS: {completedStages.length} / {missionState.totalStages} STAGES
            </div>
          </div>
        </div>

        {/* Tablet Body: Split into Interactive Schematic (Left) and Stage Progress Guide (Right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 bg-[#F7F9FB]">
          
          {/* LEFT: 2D Interactive Lab Schematic (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-[4/3] rounded-2xl bg-[#E8EEF4] border-2 border-[#CBD5E1] p-4 flex flex-col justify-between overflow-hidden shadow-inner">
              
              {/* Floor Tile Grid Graphic Background */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(#B8C4CE 1px, transparent 1px), linear-gradient(90deg, #B8C4CE 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Schematic Header */}
              <div className="relative z-10 flex items-center justify-between font-mono text-[11px] text-[#607080]">
                <div className="flex items-center gap-1.5 font-bold text-[#263442]">
                  <Layers className="w-3.5 h-3.5 text-[#00BFEF]" />
                  <span>{schematicTitle}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/80 border border-[#CBD5E1]">
                  NORTH ↑
                </span>
              </div>

              {/* Schematic Graphical Room Layout */}
              <div className="relative flex-1 my-2 z-10 border border-dashed border-[#B8C4CE] rounded-xl bg-white/40 p-2">
                {isMission2 ? (
                  // MISSION 2: Signal Lab Graphical Layout
                  <>
                    <div className="absolute left-[24%] right-[24%] top-[28%] h-[32%] rounded-xl bg-[#CBD5E1] border-2 border-[#9FAFBC] flex flex-col items-center justify-center text-[10px] font-mono text-[#475569] shadow-sm">
                      <span className="font-bold text-[#0284C7]">ESD WORKBENCH</span>
                      <span className="text-[9px] text-[#64748B]">OSCILLOSCOPE & PROTOTYPING</span>
                    </div>
                    <div className="absolute left-[38%] right-[38%] top-[12%] h-[12%] rounded-lg bg-[#E2E8F0] border border-[#00BFEF] flex items-center justify-center text-[9px] font-mono font-bold text-[#0284C7]">
                      FILTER BANK
                    </div>
                    <div className="absolute left-[6%] top-[34%] w-[12%] h-[24%] rounded-lg bg-[#E2E8F0] border border-[#9FAFBC] flex flex-col items-center justify-center text-[9px] font-mono text-[#607080]">
                      <span className="font-bold">PARTS</span>
                      <span>LOCKER</span>
                    </div>
                    <div className="absolute right-[8%] top-[36%] w-[14%] h-[24%] rounded-lg bg-[#E2E8F0] border border-[#00BFEF] flex flex-col items-center justify-center text-[9px] font-mono text-[#0284C7]">
                      <span className="font-bold">ATE CONSOLE</span>
                      <span className="text-[8px] text-[#64748B]">CALIBRATION</span>
                    </div>
                    <div className="absolute left-[40%] right-[40%] bottom-[4%] py-1 rounded border border-dashed border-[#00BFEF]/40 flex items-center justify-center text-[9px] font-mono text-[#00BFEF]">
                      ENTRANCE
                    </div>
                  </>
                ) : isMission3 ? (
                  // MISSION 3: Lost Sensor Network (NOC 301) Graphical Layout
                  <>
                    <div className="absolute left-[20%] top-[14%] w-[24%] h-[26%] rounded-xl bg-[#CBD5E1] border-2 border-[#9FAFBC] flex flex-col items-center justify-center text-[10px] font-mono text-[#475569] shadow-sm">
                      <span className="font-bold text-[#0284C7]">19" RACK BAY</span>
                      <span className="text-[8px] text-[#64748B]">SWITCH • ROUTER • GATEWAY</span>
                    </div>
                    <div className="absolute left-[48%] right-[24%] top-[12%] h-[14%] rounded-lg bg-[#E2E8F0] border border-[#00BFEF] flex items-center justify-center text-[9px] font-mono font-bold text-[#0284C7]">
                      NOC TELEMETRY VIDEO WALL
                    </div>
                    <div className="absolute right-[10%] top-[32%] w-[20%] h-[30%] rounded-xl bg-[#CBD5E1] border-2 border-[#9FAFBC] flex flex-col items-center justify-center text-[10px] font-mono text-[#475569] shadow-sm">
                      <span className="font-bold text-[#0284C7]">SENSOR BENCH</span>
                      <span className="text-[8px] text-[#64748B]">NODES A, B, C, D</span>
                    </div>
                    <div className="absolute left-[12%] top-[38%] w-[18%] h-[24%] rounded-lg bg-[#E2E8F0] border border-[#00BFEF] flex flex-col items-center justify-center text-[9px] font-mono text-[#0284C7]">
                      <span className="font-bold">ROUTING CONSOLE</span>
                      <span className="text-[8px] text-[#64748B]">WIRELESS AP</span>
                    </div>
                    <div className="absolute left-[40%] right-[40%] bottom-[4%] py-1 rounded border border-dashed border-[#00BFEF]/40 flex items-center justify-center text-[9px] font-mono text-[#00BFEF]">
                      ENTRANCE
                    </div>
                  </>
                ) : isMission4 ? (
                  // MISSION 4: Power Grid Lab Graphical Layout
                  <>
                    <div className="absolute left-[14%] top-[28%] w-[22%] h-[30%] rounded-xl bg-[#CBD5E1] border-2 border-[#9FAFBC] flex flex-col items-center justify-center text-[10px] font-mono text-[#475569] shadow-sm">
                      <span className="font-bold text-[#0284C7]">ADC RIG</span>
                      <span className="text-[8px] text-[#64748B]">12-BIT QUANTIZATION</span>
                    </div>
                    <div className="absolute left-[40%] right-[40%] top-[26%] h-[34%] rounded-xl bg-[#CBD5E1] border-2 border-[#9FAFBC] flex flex-col items-center justify-center text-[10px] font-mono text-[#475569] shadow-sm">
                      <span className="font-bold text-[#0284C7]">PWM STATION</span>
                      <span className="text-[8px] text-[#64748B]">VOLTAGE SYNTHESIS</span>
                    </div>
                    <div className="absolute right-[14%] top-[28%] w-[22%] h-[30%] rounded-xl bg-[#CBD5E1] border-2 border-[#9FAFBC] flex flex-col items-center justify-center text-[10px] font-mono text-[#475569] shadow-sm">
                      <span className="font-bold text-[#0284C7]">LOAD BANK</span>
                      <span className="text-[8px] text-[#64748B]">POWER DISSIPATION</span>
                    </div>
                    <div className="absolute left-[36%] right-[36%] top-[12%] h-[12%] rounded-lg bg-[#E2E8F0] border border-[#00BFEF] flex items-center justify-center text-[9px] font-mono font-bold text-[#0284C7]">
                      GRID CALIBRATION PANEL
                    </div>
                    <div className="absolute left-[40%] right-[40%] bottom-[4%] py-1 rounded border border-dashed border-[#00BFEF]/40 flex items-center justify-center text-[9px] font-mono text-[#00BFEF]">
                      ENTRANCE
                    </div>
                  </>
                ) : isMission5 ? (
                  // MISSION 5: Smart Greenhouse Biosphere Graphical Layout
                  <>
                    <div className="absolute left-[16%] bottom-[20%] w-[26%] h-[30%] rounded-xl bg-[#CBD5E1] border-2 border-[#9FAFBC] flex flex-col items-center justify-center text-[10px] font-mono text-[#475569] shadow-sm">
                      <span className="font-bold text-[#0284C7]">PLANT RHIZOSPHERE</span>
                      <span className="text-[8px] text-[#64748B]">SOIL MOISTURE PROBE</span>
                    </div>
                    <div className="absolute left-[16%] top-[14%] w-[24%] h-[22%] rounded-lg bg-[#E2E8F0] border border-[#00BFEF] flex flex-col items-center justify-center text-[9px] font-mono text-[#0284C7]">
                      <span className="font-bold">IRRIGATION MANIFOLD</span>
                      <span className="text-[8px] text-[#64748B]">DRIP SOLENOIDS</span>
                    </div>
                    <div className="absolute left-[44%] right-[28%] top-[12%] h-[14%] rounded-lg bg-[#E2E8F0] border border-[#00BFEF] flex items-center justify-center text-[9px] font-mono font-bold text-[#0284C7]">
                      CONVECTIVE EXHAUST FANS
                    </div>
                    <div className="absolute right-[12%] top-[30%] w-[20%] h-[32%] rounded-xl bg-[#CBD5E1] border-2 border-[#9FAFBC] flex flex-col items-center justify-center text-[10px] font-mono text-[#475569] shadow-sm">
                      <span className="font-bold text-[#0284C7]">CLIMATE DESK</span>
                      <span className="text-[8px] text-[#64748B]">GROW LIGHT EQUILIBRIUM</span>
                    </div>
                    <div className="absolute left-[40%] right-[40%] bottom-[4%] py-1 rounded border border-dashed border-[#00BFEF]/40 flex items-center justify-center text-[9px] font-mono text-[#00BFEF]">
                      ENTRANCE
                    </div>
                  </>
                ) : (
                  // MISSION 1: Server Room Graphical Layout
                  <>
                    <div className="absolute left-[10%] top-[25%] bottom-[20%] w-[16%] rounded-lg bg-[#CBD5E1] border border-[#9FAFBC] flex flex-col items-center justify-center text-[10px] font-mono text-[#475569] shadow-sm">
                      <span className="font-bold">RACK</span>
                      <span>ROW A</span>
                    </div>
                    <div className="absolute right-[12%] top-[30%] bottom-[25%] w-[16%] rounded-lg bg-[#CBD5E1] border border-[#9FAFBC] flex flex-col items-center justify-center text-[10px] font-mono text-[#475569] shadow-sm">
                      <span className="font-bold">RACK</span>
                      <span>ROW B</span>
                    </div>
                    <div className="absolute left-[38%] right-[38%] top-[15%] bottom-[15%] rounded border border-dashed border-[#00BFEF]/40 flex items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-mono text-[#00BFEF] tracking-widest rotate-90">
                        COLD AISLE
                      </span>
                    </div>
                    <div className="absolute right-[8%] top-[16%] w-[10%] h-[12%] rounded bg-[#E2E8F0] border border-[#9FAFBC] flex items-center justify-center text-[9px] font-mono text-[#607080]">
                      CABINET
                    </div>
                  </>
                )}

                {/* Exit Door on East Wall */}
                <div
                  className={`absolute right-[2%] top-[55%] -translate-y-1/2 px-2 py-3 rounded-l-lg border-y border-l flex flex-col items-center text-[10px] font-mono font-bold transition-all ${
                    isExitUnlocked
                      ? 'bg-[#20B86B]/15 border-[#20B86B] text-[#20B86B] animate-pulse'
                      : 'bg-[#EF5350]/10 border-[#EF5350]/40 text-[#EF5350]'
                  }`}
                >
                  <DoorOpen className="w-4 h-4 mb-0.5" />
                  <span className="text-[8px]">EXIT</span>
                </div>

                {/* Interactive Stage Location Markers */}
                {stageLocations.map((loc) => {
                  const isDone = completedStages.includes(loc.stageOrder);
                  const isCurrent = currentStageOrder === loc.stageOrder;
                  const isLocked = loc.stageOrder > currentStageOrder;

                  return (
                    <div
                      key={loc.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                      style={{ left: `${loc.coords.xPct}%`, top: `${loc.coords.yPct}%` }}
                    >
                      {/* Pulsing Target Ring for Active Objective */}
                      {isCurrent && (
                        <span className="absolute -inset-2.5 rounded-full bg-[#00BFEF]/30 animate-ping pointer-events-none" />
                      )}

                      {/* Main Node Pin Icon */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all ${
                          isDone
                            ? 'bg-[#20B86B] text-white ring-2 ring-white'
                            : isCurrent
                            ? 'bg-[#3B82F6] text-white ring-4 ring-[#00BFEF] scale-110'
                            : 'bg-[#9FAFBC] text-slate-100 ring-1 ring-white/60 opacity-70'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isCurrent ? (
                          loc.icon
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Pin Label Tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-8 px-2 py-0.5 rounded bg-white border border-[#CBD5E1] shadow text-[10px] font-mono font-bold whitespace-nowrap text-[#263442] opacity-90 group-hover:opacity-100 z-20 pointer-events-none">
                        {loc.stageOrder}. {loc.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Schematic Map Legend */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#CBD5E1] font-mono text-[10px] text-[#607080]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#20B86B]" /> Completed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] ring-2 ring-[#00BFEF]" /> Current Objective
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9FAFBC]" /> Locked
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#00BFEF] font-bold">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Student Nav System</span>
                </div>
              </div>
            </div>

            {/* Active Objective Summary Card (Bottom Left) */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#00BFEF] uppercase tracking-wider bg-cyan-50 px-2 py-0.5 rounded">
                  ACTIVE MISSION OBJECTIVE
                </span>
                <span className="text-[#607080] font-bold">
                  Stage {currentStageOrder} of {missionState.totalStages}
                </span>
              </div>
              <h3 className="font-bold text-base text-[#263442] mt-1.5 flex items-center gap-2">
                {activeLocation.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#607080] mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#00BFEF] shrink-0" />
                <span>{activeLocation.zone}</span>
              </div>
              <div className="mt-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] leading-relaxed text-[#475569]">
                <strong className="text-[#263442] block mb-0.5">Guidance:</strong>
                {activeLocation.guidance}
              </div>
            </div>
          </div>

          {/* RIGHT: Authoritative Mission Progression Flow (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between font-mono text-xs text-[#607080]">
              <span className="font-bold text-[#263442] uppercase tracking-wider">
                MISSION PROGRESSION PATH
              </span>
              <span className="text-[10px] text-[#00BFEF]">
                Authoritative Engine State
              </span>
            </div>

            {/* Stage Steps Vertical List */}
            <div className="space-y-2.5">
              {/* Mission Start Checkpoint */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#20B86B] flex items-center justify-center font-bold text-xs shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 font-mono text-xs">
                  <span className="font-bold text-[#263442] block">START</span>
                  <span className="text-[10px] text-[#607080]">
                    {isMission2
                      ? 'Deploy to Electronics Lab 204'
                      : isMission3
                      ? 'Deploy to NOC Operations 301'
                      : isMission4
                      ? 'Deploy to Power Systems Lab 402'
                      : isMission5
                      ? 'Deploy to Greenhouse Biosphere 505'
                      : 'Deploy to Datacenter Hub'}
                  </span>
                </div>
              </div>

              {/* Dynamic Stages List */}
              {stageLocations.map((loc) => {
                const isDone = completedStages.includes(loc.stageOrder);
                const isCurrent = currentStageOrder === loc.stageOrder;
                const isLocked = loc.stageOrder > currentStageOrder;

                return (
                  <div
                    key={loc.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-50/80 border-[#3B82F6] shadow-sm'
                        : isDone
                        ? 'bg-white border-[#E2E8F0]'
                        : 'bg-[#F1F5F9]/60 border-[#E2E8F0] opacity-75'
                    }`}
                  >
                    {/* Status Badge */}
                    <div
                      className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-xs mt-0.5 ${
                        isDone
                          ? 'bg-[#20B86B] text-white'
                          : isCurrent
                          ? 'bg-[#3B82F6] text-white ring-2 ring-[#00BFEF]'
                          : 'bg-[#CBD5E1] text-[#607080]'
                      }`}
                    >
                      {isDone ? '✓' : isCurrent ? '→' : loc.stageOrder}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`font-mono text-xs font-bold truncate ${
                            isCurrent
                              ? 'text-[#3B82F6]'
                              : isDone
                              ? 'text-[#263442]'
                              : 'text-[#607080]'
                          }`}
                        >
                          {loc.stageOrder}. {loc.name}
                        </span>
                        {isDone && (
                          <span className="text-[10px] font-mono font-bold text-[#20B86B]">
                            SOLVED
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] font-mono font-bold text-[#3B82F6] animate-pulse">
                            ACTIVE
                          </span>
                        )}
                        {isLocked && (
                          <span className="text-[10px] font-mono text-[#9FAFBC]">
                            LOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#607080] mt-0.5 leading-snug">
                        {loc.description}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* EXIT Portal Marker */}
              <div
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isExitUnlocked
                    ? 'bg-emerald-50 border-[#20B86B] text-[#20B86B]'
                    : 'bg-white border-[#E2E8F0] text-[#607080]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                    isExitUnlocked
                      ? 'bg-[#20B86B] text-white'
                      : 'bg-[#CBD5E1] text-[#607080]'
                  }`}
                >
                  <DoorOpen className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#263442]">FACILITY EXIT PORTAL</span>
                    <span
                      className={`text-[10px] font-bold ${
                        isExitUnlocked ? 'text-[#20B86B]' : 'text-[#EF5350]'
                      }`}
                    >
                      {isExitUnlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#607080] block">
                    {isExitUnlocked
                      ? 'Interlock released. Walk to East Wall door to complete mission!'
                      : 'Locked. Complete all 4 signal diagnostic stages to disengage security portal.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Hint Notice */}
            <div className="mt-auto p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Need assistance? Press the <strong>HINT BUZZER</strong> on the workbench or HUD.
              </span>
            </div>
          </div>
        </div>

        {/* Tablet Footer with Dismiss Action */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-white border-t border-[#E2E8F0]">
          <span className="text-[11px] font-mono text-[#607080]">
            Use <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#CBD5E1] font-bold">M</kbd> or button to open/close map at any time
          </span>

          <button
            onClick={onClose}
            id="close-mission-map-btn-footer"
            className="px-5 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition shadow-md shadow-blue-500/20"
          >
            Return to Exploration
          </button>
        </div>
      </div>
    </div>
  );
};
