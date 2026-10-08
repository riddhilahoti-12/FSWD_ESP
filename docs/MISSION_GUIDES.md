# MISSIONX — MISSION SOLUTION GUIDES & GAMEPLAY MAP

This comprehensive walkthrough guide details the exact solution map, interaction requirements, target objects, questions, correct answers, and pedagogical hint buzzer responses for all five educational 3D escape-room missions in MissionX.

---

## 1. MISSION 1: RESCUE THE SERVER ROOM

**Identity**: Industrial Datacenter & Thermal Telemetry Facility  
**Focus**: IoT Sensor Ingestion, Environmental Telemetry, Threshold Alarms, CRAC Actuation, Circuit Breakers

### Room Zone Map
```text
[ ENTRANCE & AISLE ]
        ↓
[ TEMPERATURE SENSOR (DHT22) / HUMIDITY SENSOR ] ── Stage 1
        ↓
[ CRAC BLOWER FAN & WARNING BEACON / BUZZER ] ── Stage 2
        ↓
[ RESISTIVE DRIP TRAY WATER SENSOR ] ────────── Stage 3
        ↓
[ EMERGENCY BREAKER PANEL (CB-404) ] ────────── Stage 4
        ↓
[ DIAGNOSTIC SUPPLY CABINET ] ───────────────── Cabinet Unlock
        ↓
[ HERMETIC EXIT PORTAL ] ────────────────────── Mission Complete
```

### Stage-by-Stage Solution Map
1. **Stage 1 — Critical Thermal Incident**
   - **Object to Find**: `temperature_sensor` (Ambient Temperature Sensor on Wall Rack)
   - **Action**: Click to inspect live DHT22 telemetry and threshold configuration.
   - **Question**: *"What is the maximum safe operating temperature threshold before thermal alarm triggers?"*
   - **Correct Answer**: `28` (or `28.0`, `28 C`)
   - **Hint Buzzer**: *"Inspect the temperature sensor calibration specs on the rack. Nominal safe operating temperature is under 28.0°C."*
   - **Expected State Change**: Unlocks Stage 2 (`stage-2`), reveals fan fault clue, and illuminates warning beacon.

2. **Stage 2 — Cooling Subsystem Failure**
   - **Object to Find**: `cooling_fan` (CRAC Blower Ventilation Fan)
   - **Action**: Inspect stopped ventilation blower unit.
   - **Question**: *"Which diagnostic step must be executed to safely inspect the cooling system?"*
   - **Correct Answer**: `Check circuit breaker and clear intake obstruction`
   - **Hint Buzzer**: *"Examine the CRAC blower unit on the north wall and verify the power feed to its motor before resetting."*
   - **Expected State Change**: Unlocks Stage 3 (`stage-3`), de-energizes acoustic alarm buzzer.

3. **Stage 3 — Condensate Leak Detected**
   - **Object to Find**: `water_sensor` / `drainage_tray` (Condensate Moisture Sensor & Pan)
   - **Action**: Inspect moisture sensor probe in drip pan under CRAC unit.
   - **Question**: *"What is the primary operational risk of liquid accumulation near the server rack floor?"*
   - **Correct Answer**: `Short circuit hazard and electrical fire`
   - **Hint Buzzer**: *"Look down at the base of the cooling unit. Verify whether moisture has accumulated in the drip pan."*
   - **Expected State Change**: Unlocks Stage 4 (`stage-4`), clears condensate warning, reveals breaker code clue.

4. **Stage 4 — Restoring Primary Power**
   - **Object to Find**: `control_panel` (Emergency Breaker Panel)
   - **Action**: Enter 4-digit breaker reset authorization code.
   - **Question**: *"Enter the 4-digit electrical breaker reset authorization code to re-energize CRAC Unit #4."*
   - **Correct Answer**: `1042`
   - **Hint Buzzer**: *"Check the emergency breaker panel on the north wall. The 4-digit code is found on the maintenance dispatch sheet (1042)."*
   - **Expected State Change**: Restores CRAC power, resets temperatures to 22.4°C, unlocks cabinet (`cabinet_01`) and exit portal (`exit_door`).

5. **Completion**
   - Click `exit_door` to disengage magnetic locks and trigger mission complete screen.

### Mission 1 Reference Table
| Stage | Target Object ID | Action | Question / Prompt | Correct Answer | Hint Buzzer Guidance |
|---|---|---|---|---|---|
| 1 | `temperature_sensor` | Inspect Sensor | Safe operating temperature threshold | `28` | Safe threshold is under 28.0°C |
| 2 | `cooling_fan` | Inspect CRAC | Diagnostic step to safely inspect cooling | `Check circuit breaker and clear intake obstruction` | Verify power feed before resetting motor |
| 3 | `water_sensor` | Inspect Drip Tray | Operational risk of liquid accumulation | `Short circuit hazard and electrical fire` | Check for liquid pooling in CRAC drain pan |
| 4 | `control_panel` | Enter Breaker Code | 4-digit electrical breaker reset code | `1042` | Maintenance sheet code is 1042 |
| Exit | `exit_door` | Escape Portal | Disengage hermetic exit interlock | *Click* | All 4 recovery stages complete |

---

## 2. MISSION 2: SIGNAL IN THE LAB

**Identity**: Electronics & Signals Prototyping Laboratory  
**Focus**: Frequency Analysis, Time Period ($T=1/f$), Filter Topologies, Op-Amp Calibration

### Room Zone Map
```text
[ LABORATORY ENTRY ]
        ↓
[ OSCILLOSCOPE STATION (CRT DISPLAY) ] ────────── Stage 1
        ↓
[ FUNCTION SYNTHESIZER / BREADBOARD ] ────────── Stage 2
        ↓
[ ACTIVE OP-AMP FILTER SELECTOR ] ────────────── Stage 3
        ↓
[ ATE INSTRUMENTATION TERMINAL ] ─────────────── Stage 4
        ↓
[ PRECISION PARTS LOCKER ] ───────────────────── Cabinet Unlock
        ↓
[ LABORATORY EXIT PORTAL ] ───────────────────── Mission Complete
```

### Stage-by-Stage Solution Map
1. **Stage 1 — Waveform Frequency Identification**
   - **Object to Find**: `oscilloscope` (Digital Storage Oscilloscope on ESD Workbench)
   - **Action**: Inspect phosphor graticule CRT displaying 1 kHz sinusoidal waveform.
   - **Question**: *"What is the frequency of the displayed waveform?"*
   - **Correct Answer**: `1000 Hz` (or `1 kHz`, `1000Hz`, `1kHz`, `1000`)
   - **Hint Buzzer**: *"Look at the frequency/channel readout on the oscilloscope. Notice the signal repeats once every 1 ms."*
   - **Expected State Change**: Unlocks Stage 2 (`stage-2`), unlocks breadboard station.

2. **Stage 2 — Time Period Calculation**
   - **Object to Find**: `breadboard` (Prototyping Breadboard Array)
   - **Action**: Calculate signal period using reciprocal relationship $T = 1/f$.
   - **Question**: *"If the signal frequency is 1000 Hz, what is its period?"*
   - **Correct Answer**: `1 ms` (or `0.001 s`, `1ms`, `0.001s`, `0.001`)
   - **Hint Buzzer**: *"Use the fundamental relationship T = 1/f. For 1000 Hz, calculate 1 divided by 1000 seconds."*
   - **Expected State Change**: Unlocks Stage 3 (`stage-3`), unlocks active filter module.

3. **Stage 3 — Noise Attenuation Topology**
   - **Object to Find**: `filter_module` (Active Op-Amp Filter Module)
   - **Action**: Select the correct active filter topology to suppress high-frequency noise.
   - **Question**: *"Which filter should be used to remove high-frequency noise?"*
   - **Correct Answer**: `Low-pass filter` (or `low pass filter`, `Low-pass`, `low pass`, `low-pass filter`)
   - **Hint Buzzer**: *"Examine the filter module options. We need a filter that passes low frequencies while attenuating high-frequency noise components."*
   - **Expected State Change**: Unlocks Stage 4 (`stage-4`), filter mode LED changes to green, noise on oscilloscope clears.

4. **Stage 4 — ATE Calibration Authorization**
   - **Object to Find**: `measurement_console` (ATE Instrumentation Terminal)
   - **Action**: Enter filter calibration authorization key.
   - **Question**: *"Enter the filter calibration authorization."*
   - **Correct Answer**: `RC741`
   - **Hint Buzzer**: *"Review the filter module specifications and Op-Amp IC labels on the electronics workbench."*
   - **Expected State Change**: Unlocks precision parts locker (`cabinet_02`) and laboratory exit portal (`exit_door`).

5. **Completion**
   - Click `exit_door` to complete mission.

### Mission 2 Reference Table
| Stage | Target Object ID | Action | Question / Prompt | Correct Answer | Hint Buzzer Guidance |
|---|---|---|---|---|---|
| 1 | `oscilloscope` | Inspect Waveform | Frequency of displayed waveform | `1000 Hz` | Check oscilloscope readout; waveform repeats every 1 ms |
| 2 | `breadboard` | Calculate Period | Period for 1000 Hz signal ($T=1/f$) | `1 ms` | Apply $T=1/f$: $1 / 1000 = 0.001\text{ s}$ |
| 3 | `filter_module` | Select Topology | Filter to eliminate high-frequency noise | `Low-pass filter` | Pass low frequencies, attenuate high-frequency noise |
| 4 | `measurement_console` | Enter Auth Key | Filter calibration authorization code | `RC741` | Look at Op-Amp IC label RC741 on bench |
| Exit | `exit_door` | Escape Portal | Exit laboratory | *Click* | All 4 stages calibrated |

---

## 3. MISSION 3: THE LOST SENSOR NETWORK

**Identity**: Network Operations Center (NOC) & IoT Gateway Hub  
**Focus**: Topology Monitoring, Physical Layer Diagnostics, Multi-hop Routing, Gateway Sync

### Room Zone Map
```text
[ NOC COMMAND DESK ]
        ↓
[ CENTRAL NOC TOPOLOGY WALL ] ────────────────── Stage 1
        ↓
[ MANAGED L2+ ETHERNET SWITCH (PORT 3) ] ────── Stage 2
        ↓
[ PACKET ROUTE SELECTION CONSOLE ] ──────────── Stage 3
        ↓
[ CENTRAL IOT GATEWAY HUB ] ─────────────────── Stage 4
        ↓
[ FIBER PATCH ENCLOSURE ] ────────────────────── Cabinet Unlock
        ↓
[ NOC SECURITY EXIT PORTAL ] ─────────────────── Mission Complete
```

### Stage-by-Stage Solution Map
1. **Stage 1 — Fault Isolation in Field Topology**
   - **Object to Find**: `monitoring_screen` (NOC Status Telemetry Display)
   - **Action**: Inspect multi-node network topology visualizer.
   - **Question**: *"Which sensor node is disconnected?"*
   - **Correct Answer**: `Node C` (or `node c`, `NodeC`, `C`)
   - **Hint Buzzer**: *"Observe the NOC topology wall screen. Look for the node displaying an offline or amber/red status indicator."*
   - **Expected State Change**: Unlocks Stage 2 (`stage-2`), unlocks managed switch in network rack.

2. **Stage 2 — Physical Layer Fault Isolation**
   - **Object to Find**: `network_switch` (Managed L2+ Ethernet Switch in Rack)
   - **Action**: Identify the faulted physical patch cable connection.
   - **Question**: *"Which physical link should be checked first?"*
   - **Correct Answer**: `Port 3 patch cable` (or `Port 3`, `port 3`, `Port 3 cable`, `port 3 patch cable`)
   - **Hint Buzzer**: *"Trace Node C's ingress port into the managed switch in the 19\" rack and examine the status LED."*
   - **Expected State Change**: Unlocks Stage 3 (`stage-3`), Port 3 LED turns green.

3. **Stage 3 — Multi-hop Packet Route Selection**
   - **Object to Find**: `packet_console` (Packet Route Selection Console)
   - **Action**: Select the optimal path from Node C across the wireless mesh to gateway.
   - **Question**: *"Which route should Node C use to reach the gateway?"*
   - **Correct Answer**: `Node C → AP → Switch → Gateway` (or `Node C -> AP -> Switch -> Gateway`, `AP -> Switch -> Gateway`, `Node C to AP to Switch to Gateway`)
   - **Hint Buzzer**: *"Determine the hop sequence from the field node to the wireless AP, then through the managed switch into the core gateway."*
   - **Expected State Change**: Unlocks Stage 4 (`stage-4`), animated packet dots resume flowing.

4. **Stage 4 — Gateway Ingestion Synchronization**
   - **Object to Find**: `central_gateway` (Central IoT Gateway Hub)
   - **Action**: Authorize network synchronization key.
   - **Question**: *"Authorize gateway."*
   - **Correct Answer**: `NET99`
   - **Hint Buzzer**: *"Find the network synchronization authorization key in the gateway status display."*
   - **Expected State Change**: Node C turns green, unlocks fiber patch cabinet (`network_cabinet`) and exit portal (`exit_door`).

5. **Completion**
   - Click `exit_door` to exit NOC.

### Mission 3 Reference Table
| Stage | Target Object ID | Action | Question / Prompt | Correct Answer | Hint Buzzer Guidance |
|---|---|---|---|---|---|
| 1 | `monitoring_screen` | Inspect Topology | Which sensor node is disconnected? | `Node C` | Check NOC wall screen for red/offline status |
| 2 | `network_switch` | Inspect Rack Port | Physical link to inspect first | `Port 3 patch cable` | Trace Node C link to switch Port 3 LED |
| 3 | `packet_console` | Configure Route | Multi-hop route to reach gateway | `Node C → AP → Switch → Gateway` | Wireless node hops: AP -> Switch -> Gateway |
| 4 | `central_gateway` | Authorize Ingestion | Gateway synchronization key | `NET99` | Ingestion sync key displayed as NET99 |
| Exit | `exit_door` | Escape Portal | Disengage NOC security airlock | *Click* | All 4 nodes communicating |

---

## 4. MISSION 4: POWER GRID CALIBRATION

**Identity**: Low-Voltage Electrical & Embedded Hardware Testing Facility  
**Focus**: 12-Bit ADC Quantization, PWM Duty Cycles, Joule Heating Power ($P=V^2/R$), Controller Sync

### Room Zone Map
```text
[ POWER LAB WORKBENCH ]
        ↓
[ 12-BIT ANALOG QUANTIZER (ADC) ] ────────────── Stage 1
        ↓
[ PWM BUCK CONVERTER MODULE ] ───────────────── Stage 2
        ↓
[ PRECISION RESISTIVE LOAD BANK (47 Ω) ] ─────── Stage 3
        ↓
[ MASTER MICROGRID CONTROLLER ] ─────────────── Stage 4
        ↓
[ CALIBRATION STANDARDS LOCKER ] ─────────────── Cabinet Unlock
        ↓
[ POWER LAB EXIT PORTAL ] ───────────────────── Mission Complete
```

### Stage-by-Stage Solution Map
1. **Stage 1 — Analog-to-Digital Conversion (12-Bit Quantization)**
   - **Object to Find**: `adc_module` (12-Bit Analog Quantizer Submodule)
   - **Action**: Calculate digital conversion for $V_{ref} = 3.3\text{ V}$ and $V_{in} = 1.65\text{ V}$.
   - **Question**: *"A 12-bit ADC has Vref = 3.3 V and Vin = 1.65 V. What digital value should it produce approximately?"*
   - **Correct Answer**: `2048`
   - **Hint Buzzer**: *"Recall that a 12-bit ADC has 2^12 = 4096 discrete quantization levels. Since 1.65 V is exactly half of 3.3 V, compute 4096 / 2."*
   - **Expected State Change**: Unlocks Stage 2 (`stage-2`), unlocks PWM controller.

2. **Stage 2 — PWM Duty Cycle Modulation**
   - **Object to Find**: `pwm_controller` (PWM Buck Converter Stage)
   - **Action**: Configure the required pulse-width modulation duty cycle.
   - **Question**: *"What PWM duty cycle should be configured?"*
   - **Correct Answer**: `60%` (or `60`, `0.6`)
   - **Hint Buzzer**: *"Check the PWM buck converter target specifications on the test bench terminal."*
   - **Expected State Change**: Unlocks Stage 3 (`stage-3`), PWM LED turns green, ripple stabilizes.

3. **Stage 3 — Joule Heating Load Dissipation ($P=V^2/R$)**
   - **Object to Find**: `load_bank` (Precision Resistive Load Bank)
   - **Action**: Calculate power dissipated across a $47\ \Omega$ load at $4.28\text{ V}$.
   - **Question**: *"What is the power dissipated by a 47 Ω load at approximately 4.28 V?"*
   - **Correct Answer**: `0.39 W` (or `0.39`, `0.39W`, `0.389 W`)
   - **Hint Buzzer**: *"Apply Joule's law formula P = V^2 / R. Square 4.28 V and divide by 47 ohms."*
   - **Expected State Change**: Unlocks Stage 4 (`stage-4`), thermal bay turns nominal green.

4. **Stage 4 — Master Microgrid Synchronization**
   - **Object to Find**: `power_console` (Master Microgrid Controller)
   - **Action**: Submit the power grid calibration authorization key.
   - **Question**: *"Master controller."*
   - **Correct Answer**: `GRID33`
   - **Hint Buzzer**: *"Inspect the calibration certificate key displayed on the microgrid terminal."*
   - **Expected State Change**: Unlocks calibration standards locker (`cabinet_04`) and exit portal (`exit_door`).

5. **Completion**
   - Click `exit_door` to complete mission.

### Mission 4 Reference Table
| Stage | Target Object ID | Action | Question / Prompt | Correct Answer | Hint Buzzer Guidance |
|---|---|---|---|---|---|
| 1 | `adc_module` | Calculate ADC Output | 12-bit ADC with $V_{in}=1.65\text{ V}$, $V_{ref}=3.3\text{ V}$ | `2048` | $2^{12} = 4096$ levels; $1.65\text{ V}$ is half, so 2048 |
| 2 | `pwm_controller` | Configure Duty Cycle | Required PWM duty cycle | `60%` | Inspect PWM buck converter target spec (60%) |
| 3 | `load_bank` | Calculate Power ($P=V^2/R$) | Power dissipated by $47\ \Omega$ load at $4.28\text{ V}$ | `0.39 W` | Calculate $P = V^2/R = (4.28)^2 / 47 \approx 0.39\text{ W}$ |
| 4 | `power_console` | Synchronize Grid | Master grid calibration key | `GRID33` | Authorization key is GRID33 |
| Exit | `exit_door` | Escape Portal | Exit test bay | *Click* | Microgrid synchronized |

---

## 5. MISSION 5: THE SMART GREENHOUSE MYSTERY

**Identity**: Autonomous Botanical Research Facility & Agricultural IoT Lab  
**Focus**: Soil Telemetry Diagnostics, Drip Irrigation Solenoids, Gable Ventilation Actuation, Climate Automation

### Room Zone Map
```text
[ CONSERVATORY CENTRAL WALKWAY ]
        ↓
[ MULTI-SPECTRAL SOIL SENSOR NODE ] ─────────── Stage 1
        ↓
[ AUTOMATED DRIP IRRIGATION MANIFOLD ] ──────── Stage 2
        ↓
[ GABLE CONVECTIVE EXHAUST FAN ] ────────────── Stage 3
        ↓
[ MASTER AGRO-TECH CLIMATE CONSOLE ] ────────── Stage 4
        ↓
[ AGRICULTURAL SUPPLIES LOCKER ] ────────────── Cabinet Unlock
        ↓
[ BOTANICAL FACILITY AIR-LOCK EXIT ] ────────── Mission Complete
```

### Stage-by-Stage Solution Map
1. **Stage 1 — Critical Soil Desiccation Alert**
   - **Object to Find**: `environmental_sensors` (Multi-Spectral IoT Sensor Node)
   - **Action**: Inspect real-time soil and ambient telemetry OLED display.
   - **Question**: *"Which environmental parameter is critically low?"*
   - **Correct Answer**: `Soil moisture` (or `soil moisture`, `Moisture`, `moisture`)
   - **Hint Buzzer**: *"Inspect the environmental sensor readout in the plant beds. The soil moisture is showing a critically low reading of 31%."*
   - **Expected State Change**: Unlocks Stage 2 (`stage-2`), unlocks irrigation manifold.

2. **Stage 2 — Automated Drip Irrigation Activation**
   - **Object to Find**: `irrigation_system` (Automated Drip Irrigation Manifold)
   - **Action**: Click to inspect and confirm solenoid activation.
   - **Action Prompt**: *"Activate irrigation."*
   - **Correct Action**: Confirm interaction on manifold to energize pumps.
   - **Hint Buzzer**: *"Locate the automated drip irrigation manifold connected to the reservoir to supply water to the drying crop beds."*
   - **Expected State Change**: Unlocks Stage 3 (`stage-3`), water flow indicator turns bright blue, soil moisture recovers to 68%.

3. **Stage 3 — Gable Ventilation Airflow Stabilization**
   - **Object to Find**: `ventilation_fan` (Gable Convective Exhaust Fan)
   - **Action**: Click to inspect and engage exhaust fan louvers.
   - **Action Prompt**: *"Activate ventilation fans."*
   - **Correct Action**: Confirm interaction on exhaust fan to spin motor.
   - **Hint Buzzer**: *"Look up toward the upper gable exhaust fan. Engage the convective ventilation to clear stagnant heat and regulate canopy humidity."*
   - **Expected State Change**: Unlocks Stage 4 (`stage-4`), fan blades rotate continuously, airflow streamlines appear.

4. **Stage 4 — Climate Controller Synchronization**
   - **Object to Find**: `greenhouse_console` (Master Agro-Tech Climate Console)
   - **Action**: Submit the botanical automation synchronization authorization key.
   - **Question**: *"Climate controller."*
   - **Correct Answer**: `FLORA88`
   - **Hint Buzzer**: *"Review the climate automation synchronization key on the greenhouse console terminal."*
   - **Expected State Change**: Full-spectrum horticulture LED grow lights illuminate in violet (`#e879f9`), agricultural locker (`supply_cabinet`) and exit portal (`exit_door`) unlock.

5. **Completion**
   - Click `exit_door` to complete mission.

### Mission 5 Reference Table
| Stage | Target Object ID | Action | Question / Prompt | Correct Answer | Hint Buzzer Guidance |
|---|---|---|---|---|---|
| 1 | `environmental_sensors` | Inspect Telemetry | Environmental parameter critically low | `Soil moisture` | Inspect sensor readout showing 31% moisture |
| 2 | `irrigation_system` | Engage Solenoid | Activate drip irrigation pumps | *Confirm Inspection* | Locate drip manifold connected to reservoir |
| 3 | `ventilation_fan` | Engage Fan Motor | Activate gable convective exhaust | *Confirm Inspection* | Check upper gable exhaust fan to regulate humidity |
| 4 | `greenhouse_console` | Authorize Automation | Climate automation key | `FLORA88` | Synchronization key is FLORA88 |
| Exit | `exit_door` | Escape Portal | Exit greenhouse airlock | *Click* | Botanical ecosystem stabilized |

---

## 6. HINT BUZZER ARCHITECTURE & PEDAGOGICAL POLICY

### Guiding Principles
1. **Context-Sensitive**:
   - The Hint Buzzer ALWAYS addresses the player's CURRENT active stage objective.
   - It will NEVER skip ahead or reveal subsequent stage answers prematurely.
2. **Pedagogical Guidance**:
   - The buzzer guides the player on **WHAT TO LOOK FOR** and **HOW TO REASON** rather than simply blurting out the final string.
3. **Multi-Modal Access**:
   - Available as both a 3D tactile push-button buzzer in every room (located on workbenches / consoles) and a top-bar HUD quick-action button (`HINT`).
4. **Scoring Penalty**:
   - Each hint activation deducts **10 points** from the mission run score.
   - If an unlocked hint is re-viewed, no additional penalty is deducted.
